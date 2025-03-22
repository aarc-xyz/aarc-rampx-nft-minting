import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  preview: {
    allowedHosts: [
      '.onrender.com' // This will allow all subdomains on render.com
    ]
  }
})
