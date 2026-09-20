import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 38204,
    proxy: {
      '/api': {
        target: 'http://localhost:38304',
        changeOrigin: true
      }
    }
  }
});
