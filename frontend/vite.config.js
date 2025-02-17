import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5175',  // Redirect /api requests to backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
