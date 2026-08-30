import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
  },

  build: {
    sourcemap: false,

    // ─── PERFORMANCE OPTIMIZATIONS ─────────────────────────────
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ['react', 'react-dom'],
          // Add other large libraries if needed, e.g.:
          // 'three': ['three', '@react-three/fiber', '@react-three/drei'],
          // 'axios': ['axios'],
        },
      },
    },

    // Enable CSS code splitting to avoid loading all styles at once
    cssCodeSplit: true,

    // Optional: set chunk size warning limit to 500 kB (default is 500)
    // chunkSizeWarningLimit: 500,
  },
});