import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      external: [
        /^https:\/\/cdn\.jsdelivr\.net\/.*/,
        /^https:\/\/storage\.googleapis\.com\/.*/,
      ],
    },
    rollupOptions: {
      external: [
        /^https:\/\/cdn\.jsdelivr\.net\/.*/,
        /^https:\/\/storage\.googleapis\.com\/.*/,
      ],
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
})
