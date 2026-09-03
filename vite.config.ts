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
 * Plugin que genera 404.html como copia de index.html al terminar el build.
 *
 * GitHub Pages sirve 404.html cuando una ruta no existe físicamente
 * (ej: /plataforma-comisiones/ruta-inexistente). Como es una SPA,
 * 404.html debe ser el index.html para que React Router tome el control.
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
        console.log('✓ 404.html generado para SPA fallback');
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

export default defineConfig({
  // base path para GitHub Pages (https://yalfonso-ui.github.io/plataforma-comisiones/).
  // El default '/' funciona en localhost pero rompe los assets en Pages.
  base: process.env.VITE_BASE_PATH || '/plataforma-comisiones/',
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
})
