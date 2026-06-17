import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',

  publicDir: '../public',
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    proxy: {
      '/submissions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/submit': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/calendar': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
