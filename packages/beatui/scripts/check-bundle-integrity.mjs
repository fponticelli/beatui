#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const packageRoot = resolve(dirname(__filename), '..')
const snapshotPath = resolve(packageRoot, 'scripts/bundle-integrity.snapshot.json')
const writeSnapshot = process.argv.includes('--write') || process.argv.includes('--update')

if (!existsSync(snapshotPath)) {
  console.error(`❌ Missing snapshot file at ${snapshotPath}`)
  process.exitCode = 1
  if (!writeSnapshot) {
    process.exit(1)
  }
}

const snapshot = existsSync(snapshotPath)
  ? JSON.parse(readFileSync(snapshotPath, 'utf8'))
  : { files: [] }

if (!Array.isArray(snapshot.files)) {
  console.error('❌ Snapshot format invalid: expected an array of files')
  process.exit(1)
}

const results = []
const errors = []

for (const entry of snapshot.files) {
  if (!entry?.path) {
    errors.push('Snapshot entry missing "path" field')
    continue
  }

  const absolutePath = resolve(packageRoot, entry.path)
  if (!existsSync(absolutePath)) {
    errors.push(`File not found: ${entry.path}`)
    continue
  }

  const fileBuffer = readFileSync(absolutePath)
  const bytes = fileBuffer.length
  const sha256 = createHash('sha256').update(fileBuffer).digest('hex')

  results.push({
    path: entry.path,
    bytes,
    sha256,
    description: entry.description ?? '',
  })

  if (writeSnapshot) {
    entry.bytes = bytes
    entry.sha256 = sha256
  } else {
    if (typeof entry.bytes === 'number' && entry.bytes !== bytes) {
      errors.push(
        `Size mismatch for ${entry.path}: snapshot=${entry.bytes} bytes, actual=${bytes} bytes`
      )
    }

    if (typeof entry.sha256 === 'string' && entry.sha256 !== sha256) {
      errors.push(
        `SHA-256 mismatch for ${entry.path}: snapshot=${entry.sha256}, actual=${sha256}`
      )
    }
  }
}

if (writeSnapshot) {
  snapshot.files = snapshot.files
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  console.log('✨ Snapshot updated')
  process.exit(0)
}

if (errors.length > 0) {
  console.error('❌ Bundle integrity check failed:')
  for (const err of errors) {
    console.error(`  • ${err}`)
  }

  console.error('\nRun "pnpm --filter @tempots/beatui run bundle:snapshot" after verifying changes to refresh the snapshot when intentional.')
  process.exit(1)
}

console.log('✅ Bundle integrity validated')
for (const result of results) {
  const kb = (result.bytes / 1024).toFixed(2)
  console.log(`  • ${result.path} — ${kb} KiB — ${result.sha256}`)
}
