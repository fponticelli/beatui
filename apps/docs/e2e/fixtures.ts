import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Guide routes extracted from the app router file */
export const GUIDE_ROUTES = [
  '/guides/getting-started',
  '/guides/theming',
  '/guides/customization',
  '/guides/css-variables',
  '/guides/forms',
  '/guides/rtl-ltr',
  '/guides/data-source',
  '/guides/authentication',
  '/guides/lexical-editor',
  '/guides/monaco-editor',
  '/guides/prosemirror-editor',
  '/guides/markdown-renderer',
  '/guides/json-schema-forms',
  '/guides/json-structure-forms',
  '/guides/json-schema-display',
]

/** Read the auto-generated page registry to discover component pages */
export function getComponentSlugs(): string[] {
  const registryPath = path.resolve(
    __dirname,
    '../src/registry/page-registry.ts'
  )
  const content = fs.readFileSync(registryPath, 'utf8')
  // Only parse the `pages` array (before `categories`) to avoid duplicates
  const pagesEnd = content.indexOf('export const categories')
  const pagesSection = pagesEnd > 0 ? content.slice(0, pagesEnd) : content
  const slugs: string[] = []
  const re = /"slug":\s*"([^"]+)"/g
  let match
  while ((match = re.exec(pagesSection)) !== null) {
    slugs.push(match[1])
  }
  return slugs
}

/** All component routes derived from the page registry */
export function getComponentRoutes(): string[] {
  return getComponentSlugs().map(slug => `/components/${slug}`)
}
