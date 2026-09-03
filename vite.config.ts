import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/**
 * Plugin que genera 404.html como copia exacta de index.html.
 *
 * GitHub Pages sirve 404.html cuando una ruta no existe físicamente
 * (ej: /plataforma-comisiones/resumen). Como es una SPA:
 *   1. El 404.html carga los mismos assets que index.html.
 *   2. React Router con `basename="/plataforma-comisiones/"` lee la
 *      URL del navegador, extrae la ruta interna y renderiza el
 *      componente correcto.
 *
 * Resultado: al refrescar cualquier ruta, GitHub Pages sirve 404.html,
 * React arranca y React Router muestra la página correspondiente.
 *
 * Hacer esto como plugin (en lugar de un step del workflow de CI)
 * garantiza que SIEMPRE se genere, en builds locales y en Pages.
 */
function generate404Plugin() {
  return {
    name: 'generate-404',
    apply: 'build' as const,
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      const notFoundPath = path.join(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
        console.log('✓ 404.html generado como copia de index.html para SPA fallback');
      }
    },
  };
}

/**
 * Plugin que copia .nojekyll al directorio dist/.
 *
 * .nojekyll evita que GitHub Pages procese el sitio con Jekyll,
 * lo cual ignoraría archivos con _ al inicio y podría romper
 * los assets de Vite y el SPA routing.
 */
function copyNojekyllPlugin() {
  return {
    name: 'copy-nojekyll',
    apply: 'build' as const,
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const source = path.resolve(__dirname, 'public', '.nojekyll');
      const target = path.join(distDir, '.nojekyll');
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, target);
        console.log('✓ .nojekyll copiado a dist/');
      }
    },
  };
}

export default defineConfig(({ command }) => ({
  // En dev: base '/' para que funcione en localhost:5173/ sin subpath.
  // En build: usa VITE_BASE_PATH (por defecto '/plataforma-comisiones/' para GitHub Pages).
  // Esto evita pantalla en blanco en local y mantiene compatibilidad con Pages.
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || '/plataforma-comisiones/'),
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // SPA fallback: 404.html + .nojekyll se generan localmente,
    // no dependen del step del workflow de CI.
    generate404Plugin(),
    copyNojekyllPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))
