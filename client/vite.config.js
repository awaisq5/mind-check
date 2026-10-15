import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development, /api is proxied to the local API so no VITE_API_BASE_URL is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': process.env.API_PROXY_TARGET || 'http://localhost:5000' },
  },
})
