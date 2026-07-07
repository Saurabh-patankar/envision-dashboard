import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, proxy /api requests to the Express backend on :4000 so the
// frontend can use same-origin relative URLs (no CORS/host juggling in code).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
