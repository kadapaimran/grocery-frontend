// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/frontapp1/',   // or './' if you prefer relative
  plugins: [react()]
})
