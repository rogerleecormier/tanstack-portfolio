import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
                // Ensure dynamic imports use relative paths
                manualChunks: undefined,
            },
        },
        // Ensure chunks use relative paths
        chunkSizeWarningLimit: 1000,
    },
    // Ensure all imports use relative paths
    optimizeDeps: {
        include: ['react', 'react-dom'],
    },
});
