import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

const beatuiRoot = resolve(__dirname, '../../packages/beatui')
const distExists = fs.existsSync(resolve(beatuiRoot, 'dist/index.es.js'))
const beatuiPaths = {
  css: resolve(
    beatuiRoot,
    distExists ? 'dist/beatui.css' : 'src/styles/index.css'
  ),
  main: resolve(beatuiRoot, distExists ? 'dist/index.es.js' : 'src/index.ts'),
  auth: resolve(
    beatuiRoot,
    distExists ? 'dist/auth/index.es.js' : 'src/auth/index.ts'
  ),
  jsonSchema: resolve(
    beatuiRoot,
    distExists ? 'dist/json-schema/index.es.js' : 'src/json-schema/index.ts'
  ),
  monaco: resolve(
    beatuiRoot,
    distExists ? 'dist/monaco/index.es.js' : 'src/monaco/index.ts'
  ),
  milkdown: resolve(
    beatuiRoot,
    distExists ? 'dist/milkdown/index.es.js' : 'src/milkdown/index.ts'
  ),
}

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tempots/beatui/css': beatuiPaths.css,
      '@tempots/beatui/monaco': beatuiPaths.monaco,
      '@tempots/beatui/milkdown': beatuiPaths.milkdown,
      '@tempots/beatui/json-schema': beatuiPaths.jsonSchema,
      '@tempots/beatui/auth': beatuiPaths.auth,
      '@tempots/beatui': beatuiPaths.main,
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: [resolve(__dirname, '../../')],
    },
  },
  preview: {
    port: 3001,
  },
})
