import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Always use production Pages Functions for API access
  const apiTarget =
    env.VITE_API_PROXY_TARGET || 'https://tanstack-portfolio.pages.dev';
  return {
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_BLOG_RECOMMENDATIONS_URL': JSON.stringify(
        'https://blog-recommendations.rcormier.workers.dev'
      ),
      'import.meta.env.VITE_AI_WORKER_URL': JSON.stringify(
        'https://tanstack-portfolio-ai-generator.rcormier.workers.dev'
      ),
      // Content operations use R2 worker, AI generation uses dedicated AI worker
    },
    build: {
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          manualChunks: (id) => {
            // React core - loaded immediately
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/scheduler')) {
              return 'vendor-react';
            }
            // TanStack libraries
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
            // Recharts and D3 (used by charts)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // PDF rendering (heavy, loaded on demand)
            if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
              return 'vendor-pdf';
            }
            // Excel export (heavy, loaded on demand)
            if (id.includes('exceljs')) {
              return 'vendor-excel';
            }
            // TipTap editor (heavy, loaded on demand)
            if (id.includes('@tiptap') || id.includes('prosemirror')) {
              return 'vendor-editor';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Cytoscape (graph visualization)
            if (id.includes('cytoscape')) {
              return 'vendor-cytoscape';
            }
            // Icons (lucide-react)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            // Syntax highlighting
            if (id.includes('highlight.js') || id.includes('lowlight')) {
              return 'vendor-syntax';
            }
            // Markdown processing
            if (id.includes('marked') || id.includes('dompurify') || id.includes('turndown')) {
              return 'vendor-markdown';
            }
            // Remaining node_modules
            if (id.includes('node_modules')) {
              return 'vendor-misc';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    plugins: [react()],
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    server: {
      hmr: { overlay: false },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: path => path,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('API proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('API Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('API Response:', proxyRes.statusCode, req.url);
              if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
                console.log(
                  'API Error Response Headers:',
                  Object.fromEntries(proxyRes.headers)
                );
              }
            });
          },
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  };
});
