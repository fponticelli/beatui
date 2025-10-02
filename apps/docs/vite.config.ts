import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'

export default defineConfig({
  root: '.',
  plugins: [
    tailwindcss(),
    beatuiTailwindPlugin({ darkClass: 'dark', rtlAttribute: 'dir' }),
  ],
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
