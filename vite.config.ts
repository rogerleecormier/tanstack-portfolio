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
