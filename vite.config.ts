import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Browser → api-v3 is CORS-blocked; proxy same-origin /api in dev.
    proxy: {
      '/api': {
        target: 'https://api-stage-v3.witteria.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
