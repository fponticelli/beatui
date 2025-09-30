import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3001,
  },
})
