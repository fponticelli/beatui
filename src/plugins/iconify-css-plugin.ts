// Vite plugin for generating pure CSS Iconify icons
import type { Plugin } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

interface IconifyPluginOptions {
  collections?: string[]
  outputFile?: string
  prefix?: string
  usedIcons?: string[]
}

interface IconData {
  body: string
  width?: number
  height?: number
  viewBox?: string
}

interface IconSet {
  icons: Record<string, IconData>
  width?: number
  height?: number
}

export function iconifyCSS(options: IconifyPluginOptions = {}): Plugin {
  const {
    collections = ['line-md', 'tabler'],
    outputFile = 'iconify-icons.css',
    prefix = 'bc-icon',
    usedIcons = [],
  } = options

  let iconCSS = ''
  const processedIcons = new Set<string>()

  function loadIconSet(collection: string): IconSet | null {
    try {
      // Try to load from node_modules
      const iconifyJsonPath = resolve(
        process.cwd(),
        `node_modules/@iconify-json/${collection}/icons.json`
      )

      if (existsSync(iconifyJsonPath)) {
        const iconSetData = JSON.parse(readFileSync(iconifyJsonPath, 'utf-8'))
        return iconSetData
      }

      console.warn(`Iconify collection "${collection}" not found`)
      return null
    } catch (error) {
      console.error(`Error loading Iconify collection "${collection}":`, error)
      return null
    }
  }

  function generateIconCSS(
    collection: string,
    iconName: string,
    iconData: IconData
  ): string {
    const className = `icon-\\[${collection}\\:${iconName}\\]`

    // Default dimensions
    const width = iconData.width || 24
    const height = iconData.height || 24
    const viewBox = iconData.viewBox || `0 0 ${width} ${height}`

    // Create SVG data URL for CSS mask (better performance and color control)
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${iconData.body}</svg>`
    const encodedSvg = encodeURIComponent(svgContent)
    const dataUrl = `data:image/svg+xml,${encodedSvg}`

    return `
.${className} {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-image: url("${dataUrl}");
  mask-image: url("${dataUrl}");
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-position: center;
  mask-position: center;
  vertical-align: -0.125em;
}
`
  }

  function processUsedIcons() {
    iconCSS = `/* Generated Iconify CSS Icons - Pure CSS Solution */\n`

    // Process only used icons for better performance
    const iconsToProcess =
      usedIcons.length > 0
        ? usedIcons
        : [
            // Default commonly used icons
            'line-md:home',
            'line-md:account',
            'line-md:cog',
            'line-md:heart',
            'line-md:alert',
            'line-md:close',
            'line-md:check',
            'line-md:arrow-left',
            'line-md:arrow-right',
            'line-md:plus',
            'line-md:minus',
            'line-md:edit',
            'line-md:delete',
            'line-md:search',
            'line-md:menu',
            'line-md:chevron-left',
            'line-md:chevron-right',
            'tabler:x',
            'tabler:menu-2',
          ]

    for (const iconName of iconsToProcess) {
      const [collection, name] = iconName.split(':')
      if (!collection || !name) continue

      const iconSet = loadIconSet(collection)
      if (!iconSet || !iconSet.icons[name]) {
        console.warn(`Icon "${iconName}" not found`)
        continue
      }

      if (!processedIcons.has(iconName)) {
        iconCSS += generateIconCSS(collection, name, iconSet.icons[name])
        processedIcons.add(iconName)
      }
    }

    // Add base icon styles that work with our layered CSS system
    iconCSS += `
/* Base icon styles for layered CSS architecture */
.bc-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Icon size variants */
.bc-icon--xs { width: var(--spacing-3); height: var(--spacing-3); font-size: var(--spacing-3); }
.bc-icon--sm { width: var(--spacing-4); height: var(--spacing-4); font-size: var(--spacing-4); }
.bc-icon--md { width: var(--spacing-5); height: var(--spacing-5); font-size: var(--spacing-5); }
.bc-icon--lg { width: var(--spacing-6); height: var(--spacing-6); font-size: var(--spacing-6); }
.bc-icon--xl { width: var(--spacing-8); height: var(--spacing-8); font-size: var(--spacing-8); }
`
  }

  return {
    name: 'iconify-css',
    buildStart() {
      // Process used icons at build start
      processUsedIcons()
    },
    generateBundle() {
      // Emit the CSS file
      this.emitFile({
        type: 'asset',
        fileName: outputFile,
        source: iconCSS,
      })
    },
    load(id) {
      // Serve the CSS content when requested
      if (id.endsWith('iconify-icons.css')) {
        return iconCSS
      }
    },
    resolveId(id) {
      // Resolve the virtual CSS file
      if (id === 'virtual:iconify-css') {
        return 'iconify-icons.css'
      }
    },
  }
}
