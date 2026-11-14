import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Served from GitHub Pages at /nishtar-lms/ (override with BASE=/ for a custom domain)
export default defineConfig({
  base: process.env.BASE || '/nishtar-lms/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
