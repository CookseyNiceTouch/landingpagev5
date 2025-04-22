import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Disable React StrictMode to prevent double rendering in development
    strictMode: false
  })],
})
