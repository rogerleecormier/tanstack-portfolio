import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Always use production Pages Functions for KV cache access in development
  const apiTarget = env.VITE_API_PROXY_TARGET || 'https://tanstack-portfolio.pages.dev'
  return {
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_BLOG_RECOMMENDATIONS_URL': JSON.stringify('https://blog-recommendations.rcormier.workers.dev'),
    'import.meta.env.VITE_AI_WORKER_URL': JSON.stringify('https://tanstack-portfolio-ai-generator.rcormier.workers.dev'),
    'import.meta.env.VITE_R2_PROXY_BASE': JSON.stringify('https://r2-content-proxy.rcormier.workers.dev'),
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
  plugins: [
    react(),
    {
      name: 'copy-functions',
      buildEnd() {
        console.log('🔄 Copying Pages Functions to dist...')

        const srcDir = path.resolve('functions')
        const destDir = path.resolve('dist', 'functions')

        function copyDirRecursive(src: string, dest: string) {
          try {
            mkdirSync(dest, { recursive: true })

            const entries = readdirSync(src, { withFileTypes: true })

            for (const entry of entries) {
              const srcPath = path.join(src, entry.name)
              const destPath = path.join(dest, entry.name)

              if (entry.isDirectory()) {
                copyDirRecursive(srcPath, destPath)
              } else if (entry.isFile() && entry.name.endsWith('.ts')) {
                copyFileSync(srcPath, destPath)
                console.log(`📄 Copied: ${entry.name}`)
              }
            }
          } catch (error) {
            console.error('❌ Error copying functions:', error)
          }
        }

        copyDirRecursive(srcDir, destDir)
        console.log('✅ Pages Functions copied successfully!')
      }
    }
  ],
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
