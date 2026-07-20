import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://miditrust.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/events': {
        target: 'wss://miditrust.onrender.com',
        changeOrigin: true,
        ws: true,
        secure: false,
      }
    }
  }
});
