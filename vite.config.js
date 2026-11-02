import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Fills (or removes) the absolute-URL meta tags in index.html.
// Open Graph / canonical URLs must be absolute, so they depend on VITE_SITE_URL.
function siteUrlPlugin(siteUrl) {
  const base = (siteUrl || '').replace(/\/+$/, '')

  return {
    name: 'fintrack-site-url',
    transformIndexHtml(html) {
      if (base) {
        return html.replaceAll('__SITE_URL__', base)
      }

      return html
        .split('\n')
        .filter((line) => !line.includes('__SITE_URL__'))
        .join('\n')
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      // Dev-only tooling: never part of the production build.
      command === 'serve' ? vueDevTools() : null,
      siteUrlPlugin(env.VITE_SITE_URL),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 600,
    },
  }
})
