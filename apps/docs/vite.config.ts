import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { Plugin, PluginOption } from 'vite'
import { resolve } from 'path'
import { copyFileSync } from 'fs'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'

const beatuiPlugin = beatuiTailwindPlugin({
  googleFonts: [
    {
      family: 'Alan Sans',
      weights: [400],
    },
  ],
  semanticFonts: {
    heading: '"Alan Sans"',
  },
  darkClass: 'dark',
  rtlAttribute: 'dir',
  semanticColors: {
    primary: 'sky',
    secondary: 'cyan',
  },
}) as PluginOption

/**
 * Copies index.html to 404.html after build so GitHub Pages serves the SPA
 * shell for all routes, letting the client-side router handle them.
 */
function spa404Plugin(): Plugin {
  return {
    name: 'spa-404',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  root: '.',
  plugins: [tailwindcss(), beatuiPlugin, spa404Plugin()],
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
