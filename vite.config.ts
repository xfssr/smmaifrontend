import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendProxy = {
  target: 'http://localhost:4000',
  changeOrigin: true,
  headers: {
    'x-forwarded-proto': 'https',
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: 'web-assets',
  },
  server: {
    host: '0.0.0.0',
    hmr: false,
    allowedHosts: ['localhost', '127.0.0.1', '.trycloudflare.com'],
    proxy: {
      '/dev': backendProxy,
      '/api': backendProxy,
    },
  },
});
