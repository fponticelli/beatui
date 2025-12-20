#!/usr/bin/env node

import { execSync, spawnSync } from 'node:child_process'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const registry =
  process.env.npm_config_registry ||
  process.env.NPM_CONFIG_REGISTRY ||
  'https://registry.npmjs.org/'

const currentUser = () => {
  try {
    const user = execSync(`pnpm whoami --registry ${registry}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return user || null
  } catch {
    return null
  }
}

const user = currentUser()

if (user) {
  console.log(`Already logged in to npm as ${user}`)
  process.exit(0)
}

if (!input.isTTY || !output.isTTY) {
  console.error(
    `Not logged in to npm registry ${registry}. Please run "pnpm login --registry ${registry}" and retry the release.`,
  )
  process.exit(1)
}

const rl = readline.createInterface({ input, output })
const answer = (
  await rl.question(
    `Not logged in to npm registry ${registry}. Run "pnpm login" now? (y/N): `,
  )
)
  .trim()
  .toLowerCase()

rl.close()

if (answer !== 'y' && answer !== 'yes') {
  console.error('Aborting release. Please log in to npm and try again.')
  process.exit(1)
}

const loginResult = spawnSync('pnpm', ['login', '--registry', registry], {
  stdio: 'inherit',
})

if (loginResult.status !== 0) {
  console.error('`pnpm login` failed. Aborting release.')
  process.exit(loginResult.status ?? 1)
}

const loggedInUser = currentUser()

if (!loggedInUser) {
  console.error(
    'Still not logged in after running `pnpm login`. Please log in manually and rerun the release.',
  )
  process.exit(1)
}

console.log(`Logged in to npm as ${loggedInUser}. Continuing with release.`)
