import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Browser calls to api-v3 are CORS-blocked (403). Proxy through Vite in dev.
    proxy: {
      '/api': {
        target: 'https://api-v3.witteria.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
