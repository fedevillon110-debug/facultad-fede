// ===================== CONFIGURACIÓN LOCAL =====================
// Se usa almacenamiento local para que la app funcione sin depender de Firebase ni de prompts.

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
    } catch (e) {
      // Ignorar si el almacenamiento no está disponible
    }
  }

  return code.trim();
}

function storageKeyFor(key) {
  const userCode = getOrCreateUserCode();
  return `mifacultad_${userCode}_${key}`;
}

window.storage = {
  async get(key) {
    const raw = localStorage.getItem(storageKeyFor(key));
    if (raw === null) {
      throw new Error("Key not found: " + key);
    }
    try {
      return { key, value: JSON.parse(raw), shared: false };
    } catch (e) {
      return { key, value: raw, shared: false };
    }
  },

  async set(key, value) {
    localStorage.setItem(storageKeyFor(key), value);
    return { key, value, shared: false };
  },

  async delete(key) {
    localStorage.removeItem(storageKeyFor(key));
    return { key, deleted: true, shared: false };
  },

  async list(prefix) {
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
  },
};

window.uploadFile = async function (file) {
  if (!file) throw new Error("No file provided");
  const url = URL.createObjectURL(file);
  return { path: url, url, name: file.name };
};

window.dispatchEvent(new Event("storage-ready"));
