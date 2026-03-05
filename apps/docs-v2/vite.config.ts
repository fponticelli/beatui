import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { Plugin, PluginOption } from 'vite'
import { resolve, dirname } from 'path'
import { copyFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'
import { componentMetaPlugin } from './scripts/vite-plugin-component-meta'
import { pageRegistryPlugin } from './scripts/vite-plugin-page-registry'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

function spa404Plugin(): Plugin {
  return {
    name: 'spa-404',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const indexPath = resolve(outDir, 'index.html')
      if (existsSync(indexPath)) {
        copyFileSync(indexPath, resolve(outDir, '404.html'))
      }
    },
  }
}

export default defineConfig({
  root: '.',
  plugins: [
    tailwindcss(),
    beatuiPlugin,
    componentMetaPlugin(),
    pageRegistryPlugin(),
    spa404Plugin(),
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
    port: 3002,
    open: true,
  },
  preview: {
    port: 3003,
  },
})
