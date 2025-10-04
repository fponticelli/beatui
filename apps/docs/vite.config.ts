import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'
import { resolve } from 'path'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'

const beatuiPlugin = beatuiTailwindPlugin({
  googleFonts: [
    {
      family: 'Jacquard 12 Charted',
      weights: [400],
    },
  ],
  fontFamilies: { sans: ['"Jacquard 12 Charted"', 'system-ui'] },
  darkClass: 'dark',
  rtlAttribute: 'dir',
  semanticColors: {
    primary: 'sky',
    secondary: 'cyan',
  },
}) as PluginOption

export default defineConfig({
  root: '.',
  plugins: [tailwindcss(), beatuiPlugin],
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
