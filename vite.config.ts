// ABOUTME: Vite build configuration for the multiplication learning game.
// ABOUTME: Configures React plugin and development server settings.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
