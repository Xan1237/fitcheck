import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://fitcheck-kt9g.onrender.com',  // Redirect /api requests to backend
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'https://fitcheck-kt9g.onrender.com',  // Redirect /auth requests to backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
