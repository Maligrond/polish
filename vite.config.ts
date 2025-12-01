import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This ensures the app works on GitHub Pages
  // by making asset paths relative (e.g. "./script.js" instead of "/script.js")
  base: './', 
})
