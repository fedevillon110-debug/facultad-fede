# Mi Facultad — guía de instalación

Esta app guarda tus datos en una base de datos gratuita (Firebase Firestore) para
que sincronice entre tu celular y tu computadora. Hay 3 pasos: crear la base de
datos gratuita, subir esto a GitHub, e instalarlo en tu iPhone.

## Paso 1 — Crear el proyecto Firebase (gratis, 5 minutos)

1. Entrá a https://console.firebase.google.com con tu cuenta de Google.
2. Click en **"Crear un proyecto"**. Poné el nombre que quieras (ej: "mi-facultad").
   No necesitás activar Google Analytics, podés desmarcarlo.
3. Una vez creado, en el menú izquierdo entrá a **Compilación → Firestore Database**.
4. Click en **"Crear base de datos"**.
   - Elegí la ubicación más cercana (ej: `southamerica-east1`).
   - En el modo de seguridad elegí **"Modo de prueba"** (test mode) — esto te
     deja arrancar rápido. Es importante que después configures las reglas de
     seguridad (ver Paso 1b), porque el modo de prueba caduca solo a los 30 días
     y deja la base abierta a cualquiera mientras tanto.
5. Una vez creada la base, volvé a la página principal del proyecto (ícono de
   casita) y click en el ícono **`</>`** ("Web") para registrar una app web.
   - Poné un nombre cualquiera (ej: "mi-facultad-web").
   - **No** marques "Firebase Hosting", no lo necesitás.
6. Firebase te va a mostrar un bloque de código con un objeto `firebaseConfig`
   con varias claves (`apiKey`, `authDomain`, `projectId`, etc). Copiá esos
   valores.
7. Abrí el archivo **`firebase-config.js`** de esta carpeta y reemplazá cada
   valor `"PEGA_TU_..._ACA"` con el valor real correspondiente que copiaste.

### Paso 1b — Configurar las reglas de seguridad (importante)

Por defecto, "modo de prueba" deja la base de datos abierta a cualquiera en
internet durante 30 días. Para protegerla con tu código personal:

1. En Firestore Database, pestaña **"Reglas"**.
2. Reemplazá el contenido por esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userCode}/datos/{doc} {
      allow read, write: if true;
    }
  }
}
```

Esto sigue siendo abierto (cualquiera con el link de tu app podría, en teoría,
adivinar tu código y ver tus datos), pero como tu código de usuario es privado
y nadie más conoce la URL ni el código, es un nivel de protección razonable
para un proyecto personal. Si más adelante querés autenticación real con
usuario y contraseña, se puede agregar Firebase Authentication — avisame y
te ayudo con ese paso.

## Paso 2 — Subir a GitHub Pages

1. Entrá a https://github.com y creá una cuenta si no tenés.
2. Click en **"New repository"**. Nombre sugerido: `mi-facultad`. Dejalo
   público. Click en **"Create repository"**.
3. En la página del repo vacío, click en **"uploading an existing file"**.
4. Arrastrá estos archivos (todos los que están en esta carpeta):
   - `index.html`
   - `firebase-config.js` (ya con tus claves pegadas)
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
5. Click en **"Commit changes"**.
6. Ahora activá GitHub Pages: en el repo, **Settings → Pages**.
   - En "Source", elegí **"Deploy from a branch"**.
   - Branch: `main`, carpeta `/ (root)`. Guardar.
7. Esperá un minuto y refrescá. GitHub te va a mostrar la URL pública, algo
   como: `https://tu-usuario.github.io/mi-facultad/`

Esa es la URL de tu app, ya accesible desde cualquier dispositivo.

## Paso 3 — Instalar en tu iPhone (pantalla de inicio)

1. Abrí la URL de tu app en **Safari** (tiene que ser Safari, no Chrome, para
   que la opción exista en iOS).
2. Tocá el botón de compartir (el cuadrado con la flecha hacia arriba).
3. Deslizá y elegí **"Agregar a pantalla de inicio"**.
4. Confirmá el nombre y tocá **"Agregar"**.

Va a quedar como un ícono más en tu pantalla de inicio, y al abrirlo se ve
sin barra de navegador, como una app nativa.

## Sincronizar entre dispositivos

La primera vez que abras la app (en cualquier dispositivo) te va a pedir
crear un **código personal** — usá algo como tu legajo. Para que el celu y
la PC compartan los mismos datos, escribí **exactamente el mismo código** en
ambos cuando te lo pida. Si te lo pidió mal una vez, podés borrarlo abriendo
la consola del navegador y ejecutando:
`localStorage.removeItem("mifacultad_user_code")`, y volviendo a cargar la
página.

## ¿Y si quiero seguir usando la versión de Claude también?

Podés usar las dos en paralelo, pero **no comparten datos entre sí** — la
versión del artifact de Claude usa su propio almacenamiento interno, separado
de esta versión con Firebase. Te recomiendo elegir una sola como "la oficial"
para no perder el rastro de qué cargaste dónde.
