import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { servicesPlugin } from './scripts/servicesPlugin.ts';

export default defineConfig({
  // servicesPlugin routes /editor and /drop and runs their backend (scripts/).
  plugins: [react(), servicesPlugin()],
  server: {
    port: 3000,
    open: true,
    // Reachable from other devices on the WiFi, which /drop needs.
    host: true
  },
  preview: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      // One page per app: the portfolio, and each service on its own so it
      // loads only its own code.
      input: {
        main: 'index.html',
        editor: 'editor.html',
        drop: 'drop.html',
        rentVsBuy: 'rent-vs-buy-calculator.html'
      }
    }
  }
});
