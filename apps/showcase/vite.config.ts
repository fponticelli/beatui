import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'
import { resolve } from 'path'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'

const beatuiPlugin = beatuiTailwindPlugin({
  semanticFonts: {
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  tailwindConfigPath: './tailwind.config.ts',
  darkClass: 'dark',
  rtlAttribute: 'dir',
  semanticColors: {
    primary: 'sky',
    secondary: 'cyan',
  },
  baseFontSize: '14px',
  baseSpacing: '3px',
  // --spacing-base
  // semanticSpacing: {
  //   'stack-2xs': '0.25rem',
  //   'stack-xs': '0.5rem',
  //   'stack-sm': '0.75rem',
  //   'stack-md': '1rem',
  //   'stack-lg': '1.5rem',
  //   'stack-xl': '2rem',
  // },
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
    port: 3200,
    open: true,
  },
  preview: {
    port: 3201,
  },
})
