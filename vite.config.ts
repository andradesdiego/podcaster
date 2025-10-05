import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
    proxy: {
      // Proxy para la API de iTunes
      '/rss': {
        target: 'https://itunes.apple.com/us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss/, '/rss'),
      },
      '/lookup': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lookup/, '/lookup'),
      },
    },
  },
});
