import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-routes',
      configureServer(server) {
        server.middlewares.use((req, _, next) => {
          // Rewrite /book (and /book/*) to index.html for SPA routing
          if (req.url?.startsWith('/book') && !req.url.includes('.')) {
            req.url = '/'
          }
          next()
        })
      },
    },
  ],
})
