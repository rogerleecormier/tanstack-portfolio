import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8788'
  return {
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_BLOG_RECOMMENDATIONS_URL': JSON.stringify('https://blog-recommendations.rcormier.workers.dev'),
  },
  build: {
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    hmr: { overlay: false },
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
}
})
