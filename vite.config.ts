// ABOUTME: Vite build configuration for the multiplication learning game.
// ABOUTME: Configures React plugin, Tailwind CSS, and development server settings.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})
