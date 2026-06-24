// ===================== CONFIGURACIÓN DE FIREBASE =====================
// Pegá acá las credenciales que te da Firebase al crear tu proyecto.
// Paso a paso completo en README.md
const firebaseConfig = {
  apiKey: "AIzaSyDrJ73EWo0XAKaioEGMjq12msPA7lefqw4",
  authDomain: "facultad-fede.firebaseapp.com",
  projectId: "facultad-fede",
  storageBucket: "facultad-fede.firebasestorage.app",
  messagingSenderId: "620787408727",
  appId: "1:620787408727:web:5f8eca23f58b28a3cc6812",
};

// Código de usuario: un identificador simple para que solo vos veas tus datos.
// Se guarda en este navegador la primera vez. Si querés usar el mismo código
// en el celu y la PC, escribilo manualmente la primera vez que abrís en cada uno.
function getOrCreateUserCode() {
  let code = localStorage.getItem("mifacultad_user_code");
  if (!code) {
    code = prompt(
      "Creá un código personal para tus datos (por ejemplo tu legajo). " +
      "Usá el MISMO código en todos tus dispositivos para que sincronicen:",
      ""
    );
    if (!code || !code.trim()) code = "default";
    code = code.trim();
    localStorage.setItem("mifacultad_user_code", code);
  }
  return code;
}

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

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const USER_CODE = getOrCreateUserCode();

// Emula la misma interfaz que window.storage (get/set/delete/list)
// para que app.js no necesite reescribirse.
window.storage = {
  async get(key) {
    const ref = doc(db, "usuarios", USER_CODE, "datos", key);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("Key not found: " + key);
    }
    return { key, value: snap.data().value, shared: false };
  },

  async set(key, value) {
    const ref = doc(db, "usuarios", USER_CODE, "datos", key);
    await setDoc(ref, { value });
    return { key, value, shared: false };
  },

  async delete(key) {
    const ref = doc(db, "usuarios", USER_CODE, "datos", key);
    await deleteDoc(ref);
    return { key, deleted: true, shared: false };
  },

  async list(prefix) {
    const colRef = collection(db, "usuarios", USER_CODE, "datos");
    const snaps = await getDocs(colRef);
    const keys = [];
    snaps.forEach((d) => {
      if (!prefix || d.id.startsWith(prefix)) keys.push(d.id);
    });
    return { keys, prefix, shared: false };
  },
};

// Señal para que app.js sepa que ya puede arrancar
window.dispatchEvent(new Event("storage-ready"));
