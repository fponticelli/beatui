import { createESLintConfig } from '../../eslint.config.base.mjs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createESLintConfig(__dirname, {
  hasScripts: true,
  hasTests: true,
  hasSrc: true,
})
