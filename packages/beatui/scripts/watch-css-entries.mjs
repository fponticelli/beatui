import { watch } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.resolve(__dirname, '..')

// Note: we rely on directory watching instead of enumerating files

// Watch directories that contain CSS files
const watchDirs = [
  'src/components/milkdown',
  'src/components/monaco',
  'src/markdown',
  'src/components/prosemirror',
  'src/styles',
]

let buildTimeout

function runBuildCss() {
  console.log('[CSS] Rebuilding CSS entries...')
  
  // Clear any pending rebuild
  if (buildTimeout) clearTimeout(buildTimeout)
  
  // Debounce the build to avoid multiple rebuilds
  buildTimeout = setTimeout(() => {
    const child = spawn('node', ['scripts/build-css-entries.mjs'], {
      cwd: pkgRoot,
      stdio: 'inherit',
    })
    
    child.on('error', err => {
      console.error('[CSS] Error running build-css-entries.mjs:', err)
    })
  }, 300)
}

// Initial build
console.log('[CSS] Running initial CSS build...')
const initialBuild = spawn('node', ['scripts/build-css-entries.mjs'], {
  cwd: pkgRoot,
  stdio: 'inherit',
})

initialBuild.on('close', code => {
  if (code === 0) {
    console.log('[CSS] Initial build complete, watching for changes...')
    
    // Watch each directory
    watchDirs.forEach(dir => {
      const watchPath = path.resolve(pkgRoot, dir)
      console.log(`[CSS] Watching ${dir}`)
      
      watch(watchPath, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.css')) {
          console.log(`[CSS] Detected change in ${filename}`)
          runBuildCss()
        }
      })
    })
  } else {
    console.error('[CSS] Initial build failed')
    process.exit(1)
  }
})
