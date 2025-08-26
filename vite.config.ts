import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This ensures relative paths work correctly
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_BLOG_RECOMMENDATIONS_URL': JSON.stringify('https://blog-recommendations.rcormier.workers.dev'),
  },
})