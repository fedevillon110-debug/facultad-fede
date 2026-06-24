// ===================== CONFIGURACIÓN DE SINCRONIZACIÓN =====================
// Usa el legajo como identificador compartido entre dispositivos.
// Si Firebase no está disponible, se usa almacenamiento local como fallback.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrJ73EWo0XAKaioEGMjq12msPA7lefqw4",
  authDomain: "facultad-fede.firebaseapp.com",
  projectId: "facultad-fede",
  storageBucket: "facultad-fede.firebasestorage.app",
  messagingSenderId: "620787408727",
  appId: "1:620787408727:web:5f8eca23f58b28a3cc6812",
};

function getOrCreateUserCode() {
  const storageKey = "mifacultad_user_code";
  let code = "";

  try {
    code = localStorage.getItem(storageKey) || "";
  } catch (e) {
    code = "";
  }

  if (!code) {
    code = "default";
    try {
      localStorage.setItem(storageKey, code);
    } catch (e) {}
  }

  const normalized = (code || "default").trim() || "default";
  if (normalized !== code) {
    try {
      localStorage.setItem(storageKey, normalized);
    } catch (e) {}
  }

  return normalized;
}

function setUserCode(code) {
  const clean = (code || "default").trim() || "default";
  const previous = getOrCreateUserCode();
  if (previous !== clean) {
    try {
      const prefix = `mifacultad_${previous}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(prefix)) continue;
        const suffix = key.slice(prefix.length);
        localStorage.setItem(`mifacultad_${clean}_${suffix}`, localStorage.getItem(key));
      }
    } catch (e) {}
  }
  try {
    localStorage.setItem("mifacultad_user_code", clean);
  } catch (e) {}
  window.currentUserCode = clean;
  return clean;
}

let db = null;
let firebaseApp = null;
let firebaseReady = false;
let firebaseError = false;

async function initFirebase() {
  if (firebaseReady || firebaseError) return;
  try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    window.firebaseStorage = getStorage(firebaseApp);
    window.firebaseFirestore = { doc, getDoc, setDoc, deleteDoc, collection, getDocs };
    firebaseReady = true;
  } catch (e) {
    firebaseError = true;
  }
}

async function storageGetRemote(key) {
  await initFirebase();
  if (!firebaseReady || !db) throw new Error("Firebase unavailable");
  const userCode = getOrCreateUserCode();
  const ref = window.firebaseFirestore.doc(db, "usuarios", userCode, "datos", key);
  const snap = await window.firebaseFirestore.getDoc(ref);
  if (!snap.exists()) throw new Error("Key not found: " + key);
  return { key, value: snap.data().value, shared: true };
}

async function storageSetRemote(key, value) {
  await initFirebase();
  if (!firebaseReady || !db) throw new Error("Firebase unavailable");
  const userCode = getOrCreateUserCode();
  const ref = window.firebaseFirestore.doc(db, "usuarios", userCode, "datos", key);
  await window.firebaseFirestore.setDoc(ref, { value });
  return { key, value, shared: true };
}

async function storageDeleteRemote(key) {
  await initFirebase();
  if (!firebaseReady || !db) throw new Error("Firebase unavailable");
  const userCode = getOrCreateUserCode();
  const ref = window.firebaseFirestore.doc(db, "usuarios", userCode, "datos", key);
  await window.firebaseFirestore.deleteDoc(ref);
  return { key, deleted: true, shared: true };
}

async function storageListRemote(prefix) {
  await initFirebase();
  if (!firebaseReady || !db) throw new Error("Firebase unavailable");
  const userCode = getOrCreateUserCode();
  const colRef = window.firebaseFirestore.collection(db, "usuarios", userCode, "datos");
  const snaps = await window.firebaseFirestore.getDocs(colRef);
  const keys = [];
  snaps.forEach((d) => {
    if (!prefix || d.id.startsWith(prefix)) keys.push(d.id);
  });
  return { keys, prefix, shared: true };
}

function storageKeyFor(key) {
  const userCode = getOrCreateUserCode();
  return `mifacultad_${userCode}_${key}`;
}

window.storage = {
  async get(key) {
    try {
      return await storageGetRemote(key);
    } catch (e) {
      const raw = localStorage.getItem(storageKeyFor(key));
      if (raw === null) throw e;
      try {
        return { key, value: JSON.parse(raw), shared: false };
      } catch (err) {
        return { key, value: raw, shared: false };
      }
    }
  },

  async set(key, value) {
    try {
      return await storageSetRemote(key, value);
    } catch (e) {
      localStorage.setItem(storageKeyFor(key), value);
      return { key, value, shared: false };
    }
  },

  async delete(key) {
    try {
      return await storageDeleteRemote(key);
    } catch (e) {
      localStorage.removeItem(storageKeyFor(key));
      return { key, deleted: true, shared: false };
    }
  },

  async list(prefix) {
    try {
      return await storageListRemote(prefix);
    } catch (e) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (!storageKey) continue;
        if (storageKey.startsWith("mifacultad_") && storageKey.includes("_")) {
          const name = storageKey.split("_").slice(2).join("_");
          if (!prefix || name.startsWith(prefix)) keys.push(name);
        }
      }
      return { keys, prefix, shared: false };
    }
  },
};

window.uploadFile = async function (file) {
  if (!file) throw new Error("No file provided");
  try {
    await initFirebase();
    if (!firebaseReady || !window.firebaseStorage) throw new Error("Firebase unavailable");
    const userCode = getOrCreateUserCode();
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
    const path = `usuarios/${userCode}/files/${safeName}`;
    const ref = storageRef(window.firebaseStorage, path);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    return { path, url, name: file.name };
  } catch (e) {
    const url = URL.createObjectURL(file);
    return { path: url, url, name: file.name };
  }
};

window.getUserCode = getOrCreateUserCode;
window.setUserCode = setUserCode;
window.currentUserCode = getOrCreateUserCode();
if (document.getElementById("legajoValue")) {
  document.getElementById("legajoValue").textContent = window.currentUserCode;
}
window.dispatchEvent(new Event("storage-ready"));

