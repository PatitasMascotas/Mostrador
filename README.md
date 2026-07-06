# Mostrador

App de ventas y cierre de caja, con login y sincronización en tiempo real entre dispositivos (Firebase).

## Pasos para dejarla funcionando

### 1. Pegar las credenciales de Firebase
Abrí `src/firebaseConfig.js` y reemplazá los valores `"PEGAR_ACA"` por el bloque
`firebaseConfig` que te dio Firebase cuando registraste la app web .

### 2. Configurar las reglas de seguridad de Firestore
En la consola de Firebase → Firestore Database → pestaña **Reglas**, pegá el
contenido del archivo `firestore.rules` (de este proyecto) y publicá los cambios.
Esto asegura que solo el usuario logueado (el del negocio) pueda leer/escribir datos.
 
### 3. Crear el usuario del negocio
En Firebase → Authentication → Users → "Agregar usuario", con el email y
contraseña que van a usar para entrar a la app (ya lo hicimos juntos, pero
podés agregar más de uno si hace falta).

### 4. Subir este proyecto al repositorio
Subí **todos** estos archivos y carpetas a
`https://github.com/PatitasMascotas/Mostrador` (rama `main`).

### 5. Activar GitHub Pages con GitHub Actions
En el repositorio → **Settings** → **Pages** → en "Build and deployment",
elegir como **Source**: `GitHub Actions` (no "Deploy from a branch").

Con eso, cada vez que subas un cambio a `main`, el workflow
`.github/workflows/deploy.yml` va a compilar la app y publicarla sola.

### 6. Ver la app publicada
Una vez que termine el primer despliegue (se ve el progreso en la pestaña
**Actions** del repo), la app va a estar disponible en:

```
https://patitasmascotas.github.io/Mostrador/
```

## Desarrollo local (opcional)

Si en algún momento querés probar cambios en tu computadora antes de subirlos:

```bash
npm install
npm run dev
```

Y para generar el build manualmente (normalmente no hace falta, lo hace GitHub Actions solo):

```bash
npm run build
```

## Estructura del proyecto

```
src/
  firebaseConfig.js     ← tus credenciales de Firebase (paso 1)
  firebase.js            ← inicialización de Firebase
  storage.js              ← guardado/lectura/sincronización con Firestore
  helpers.js              ← funciones de fecha, moneda y cálculos
  App.jsx                 ← lógica principal de la app
  main.jsx                ← punto de entrada
  styles.css               ← estilos visuales
  components/
    Login.jsx
    DayView.jsx
    TicketRow.jsx
    TicketBuilder.jsx
    ClosingSummary.jsx
    ProductFormModal.jsx
    HistoryRowLoader.jsx
```

## Notas

- La app funciona en Chrome/Edge en cualquier dispositivo. Podés "instalarla"
  desde el navegador (ícono de instalar / "Agregar a pantalla de inicio").
- Si en el futuro querés imprimir tickets por Bluetooth o exportar los cierres
  a Google Sheets, se agrega como código adicional sobre esta misma base.
