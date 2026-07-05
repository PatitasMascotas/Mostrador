import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANTE: "base" tiene que ser "/NOMBRE-DEL-REPO/" para que los archivos
// se carguen bien una vez publicados en GitHub Pages (que sirve el sitio
// desde https://usuario.github.io/NOMBRE-DEL-REPO/, no desde la raíz).
export default defineConfig({
  plugins: [react()],
  base: '/Mostrador/',
});
