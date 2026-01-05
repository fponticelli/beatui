/// <reference types="node" />

import { bundle } from '@apidevtools/json-schema-ref-parser'
import { writeFile } from 'node:fs/promises'
import { spawnSync } from 'child_process'

function formatWithPrettier(filePath: string) {
  try {
    const res = spawnSync(
      'pnpm',
      ['exec', 'prettier', '--log-level', 'warn', '--write', filePath],
      { stdio: 'inherit' }
    )
    if (res.status === 0) return
    // eslint-disable-next-line no-empty
  } catch {}
  try {
    const res = spawnSync(
      'npx',
      ['prettier', '--log-level', 'warn', '--write', filePath],
      { stdio: 'inherit' }
    )
    if (res.status === 0) return
    // eslint-disable-next-line no-empty
  } catch {}
  try {
    spawnSync('prettier', ['--write', filePath], { stdio: 'inherit' })
  } catch {
    console.warn('Warning: Prettier not available to format', filePath)
  }
}

const targets = [
  {
    uri: 'https://json-schema.org/draft/2020-12/schema',
    out: 'draft-2020-schema.ts',
  },
  {
    uri: 'https://json-schema.org/draft/2019-09/schema',
    out: 'draft-2019-schema.ts',
  },
  {
    uri: 'http://json-schema.org/draft-07/schema',
    out: 'draft-07-schema.ts',
  },
]

for (const t of targets) {
  console.log(`Bundling ${t.uri}...`)
  const schema = await bundle(t.uri)
  const body = `export default ${JSON.stringify(schema, null, 2)}`
  const outPath = `./src/pages/json-samples/${t.out}`
  await writeFile(outPath, body)
  try {
    formatWithPrettier(outPath)
    // eslint-disable-next-line no-empty
  } catch {}
}
