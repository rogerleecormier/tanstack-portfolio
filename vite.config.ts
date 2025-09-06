import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use root path since the app is served from the root domain
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_BLOG_RECOMMENDATIONS_URL': JSON.stringify('https://blog-recommendations.rcormier.workers.dev'),
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure proper asset handling
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Force relative paths for all chunks
        format: 'es',
        // Manual chunking for better performance and smaller initial bundle
        manualChunks: (id) => {
          // Vendor chunks for large libraries
          if (id.includes('node_modules')) {
            // React and core libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // TanStack libraries
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor';
            }
            // Radix UI components (large bundle)
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            // Charts and visualization libraries
            if (id.includes('recharts') || id.includes('mermaid')) {
              return 'charts-vendor';
            }
            // Markdown processing
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('highlight.js')) {
              return 'markdown-vendor';
            }
            // Other UI libraries
            if (id.includes('lucide-react') || id.includes('cmdk') || id.includes('fuse.js')) {
              return 'ui-vendor';
            }
            // Everything else goes to vendor
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit since we have effective code splitting
    chunkSizeWarningLimit: 900,
  },
  // Ensure all imports use relative paths
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // Development server optimizations
  server: {
    hmr: {
      // Optimize HMR for better performance
      overlay: false,
    },
  },
  // Performance optimizations
  esbuild: {
    // Reduce bundle size and improve performance
    drop: ['console', 'debugger'],
  },
})