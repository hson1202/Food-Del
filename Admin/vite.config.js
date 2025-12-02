import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Bảo mật: không generate sourcemap cho production build
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    // Enable history API fallback for development
    historyApiFallback: true
  },
  preview: {
    // Enable history API fallback for preview
    historyApiFallback: true
  }
})
