import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production optimizations
    minify: 'terser',
    // Output directory
    outDir: 'dist',
    // Generate source maps for error monitoring
    sourcemap: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
  },
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
})
