import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import type { HtmlTagDescriptor, Plugin, UserConfig, ViteDevServer } from 'vite'

type PostcssPluginFactory = (...args: unknown[]) => unknown
type PostcssNamedPlugin = {
  name?: string
  postcssPlugin?: string
} & Record<string, unknown>

type PostcssPluginEntry = string | PostcssNamedPlugin | PostcssPluginFactory

type PostcssConfig = Record<string, unknown> & {
  plugins?: PostcssPluginEntry | PostcssPluginEntry[]
}

type MutableCSSOptions = Record<string, unknown> & {
  postcss?: PostcssConfig | string
}

function fileUrlToPath(input: string | URL): string {
  const url = typeof input === 'string' ? new URL(input) : input
  if (url.protocol !== 'file:') {
    throw new TypeError(`Expected file URL, received: ${url.href}`)
  }

  const host = url.hostname

  const isLocalHost = host === '' || host === 'localhost'
  const decodedPath = decodeURIComponent(url.pathname)
  if (process.platform === 'win32') {
    let windowsPath = decodedPath.replace(/\//g, '\\')
    if (!isLocalHost && host) {
      return `\\\\${host}${windowsPath}`
    }
    if (windowsPath.startsWith('\\')) {
      windowsPath = windowsPath.slice(1)
    }
    return windowsPath
  }

  return !isLocalHost && host ? `//${host}${decodedPath}` : decodedPath
}

interface ViteUserConfig {
  define?: Record<string, string>
  css?: MutableCSSOptions
}

type PluginResolveFn = (
  this: unknown,
  id: string,
  importer?: string,
  options?: { skipSelf?: boolean }
) => Promise<{ id: string } | string | null>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getPluginName(plugin: PostcssPluginEntry): string | undefined {
  if (typeof plugin === 'string') {
    return plugin
  }

  if (typeof plugin === 'function') {
    return plugin.name
  }

  if (isRecord(plugin)) {
    const maybeName = plugin['name']
    if (typeof maybeName === 'string') {
      return maybeName
    }

    const maybePostcssName = plugin['postcssPlugin']
    if (typeof maybePostcssName === 'string') {
      return maybePostcssName
    }
  }

  return undefined
}

import { createBeatuiPreset } from './preset'
import type { BeatuiPresetOptions } from './preset'
import {
  generateSemanticTokenVariables,
  generateFontFamilyOverrideVariables,
} from '../tokens'

const CSS_MODULE_ID = '@tempots/beatui/tailwind.css'
const CSS_ASSET_FILENAME = 'beatui.tailwind.css'
const MODULE_DIR = path.dirname(fileUrlToPath(import.meta.url))
const PACKAGE_ROOT = findPackageRoot(MODULE_DIR) ?? MODULE_DIR

function buildCssFromVariables(variables: Record<string, string>): string {
  if (Object.keys(variables).length === 0) {
    return ''
  }
  let css = ':root {\n'
  for (const [name, value] of Object.entries(variables)) {
    css += `  ${name}: ${value};\n`
  }
  css += '}\n'
  return css
}

export interface BeatuiTailwindPluginOptions extends BeatuiPresetOptions {
  /** Automatically import the BeatUI Tailwind CSS bundle into the application entry. */
  injectCss?: boolean
  /** File name of the Tailwind config if it lives in a non-standard location. */
  tailwindConfigPath?: string
  /** Tailwind class that denotes dark mode. Defaults to 'dark'. */
  darkClass?: string
  /** Attribute inspected for RTL mode. Defaults to `dir="rtl"`. */
  rtlAttribute?: string
  /** Value of RTL attribute that should trigger `.b-rtl`. Defaults to `rtl`. */
  rtlValue?: string
}

const DEFAULT_CONFIG_FILES = [
  'tailwind.config.ts',
  'tailwind.config.js',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
  'tailwind.config.mts',
  'tailwind.config.cts',
]

function findPackageRoot(startDir: string): string | null {
  let current = startDir
  const root = path.parse(current).root
  while (current && current !== root) {
    const packageJsonPath = path.join(current, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        if (pkg?.name === '@tempots/beatui') {
          return current
        }
      } catch {
        // ignored
      }
    }
    current = path.dirname(current)
  }
  return null
}

const projectRequireCache = new Map<string, NodeJS.Require>()

function getProjectRequire(projectRoot: string): NodeJS.Require {
  const key = path.resolve(projectRoot)
  const cached = projectRequireCache.get(key)
  if (cached) return cached
  const pkgPath = path.join(key, 'package.json')
  const requireFromProject = createRequire(
    fs.existsSync(pkgPath) ? pkgPath : key
  )
  projectRequireCache.set(key, requireFromProject)
  return requireFromProject
}

async function importFromProject<T = unknown>(
  specifier: string,
  projectRoot: string
): Promise<T> {
  const requireFromProject = getProjectRequire(projectRoot)
  const resolvedPath = requireFromProject.resolve(specifier)
  return (await import(pathToFileURL(resolvedPath).href)) as T
}

function findTailwindConfig(root: string, override?: string) {
  const candidates = override
    ? [override, ...DEFAULT_CONFIG_FILES]
    : DEFAULT_CONFIG_FILES
  for (const candidate of candidates) {
    const full = path.resolve(root, candidate)
    if (fs.existsSync(full)) {
      return full
    }
  }
  return null
}

function normalizeResolvedId(
  resolved: string | { id: string } | null | undefined
): string | null {
  if (resolved == null) {
    return null
  }
  const rawId = typeof resolved === 'string' ? resolved : resolved.id
  if (!rawId) {
    return null
  }
  const [withoutQuery] = rawId.split('?')
  if (withoutQuery.startsWith('virtual:') || withoutQuery.startsWith('\0')) {
    return null
  }
  if (withoutQuery.startsWith('/@fs/')) {
    return decodeURIComponent(withoutQuery.slice(4))
  }
  if (withoutQuery.startsWith('file://')) {
    return fileUrlToPath(withoutQuery)
  }
  if (path.isAbsolute(withoutQuery)) {
    return withoutQuery
  }
  return null
}

function resolveTailwindCssFile(projectRoot: string): string | null {
  const candidates = new Set<string>([
    path.resolve(MODULE_DIR, CSS_ASSET_FILENAME),
    path.resolve(MODULE_DIR, '../', CSS_ASSET_FILENAME),
    path.resolve(MODULE_DIR, '../../', CSS_ASSET_FILENAME),
    path.resolve(MODULE_DIR, 'tailwind.css'),
    path.resolve(MODULE_DIR, '../tailwind.css'),
    path.resolve(MODULE_DIR, '../../tailwind.css'),
    path.resolve(MODULE_DIR, '../styles/tailwind.css'),
    path.resolve(MODULE_DIR, '../../styles/tailwind.css'),
    path.resolve(PACKAGE_ROOT, 'dist', CSS_ASSET_FILENAME),
    path.resolve(PACKAGE_ROOT, CSS_ASSET_FILENAME),
    path.resolve(PACKAGE_ROOT, 'tailwind.css'),
    path.resolve(PACKAGE_ROOT, 'src/styles/tailwind.css'),
    path.resolve(projectRoot, 'node_modules/@tempots/beatui/tailwind.css'),
  ])

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

async function resolveWithPluginContext(
  context: unknown,
  id: string
): Promise<{ id: string } | string | null> {
  const resolver = (context as { resolve?: PluginResolveFn }).resolve
  if (!resolver) {
    return null
  }
  try {
    return await resolver.call(context, id, undefined, { skipSelf: true })
  } catch {
    return null
  }
}

export function beatuiTailwindPlugin(
  options: BeatuiTailwindPluginOptions = {}
): Plugin {
  let projectRoot = process.cwd()
  let resolvedConfigPath: string | null =
    findTailwindConfig(projectRoot, options.tailwindConfigPath) ?? null
  const injectCss = options.injectCss !== false
  const darkClass = options.darkClass ?? 'dark'
  const rtlAttribute = options.rtlAttribute ?? 'dir'
  const rtlValue = options.rtlValue ?? 'rtl'
  let publicBasePath = '/'
  const presetOptions: BeatuiPresetOptions = {
    semanticColors: options.semanticColors,
    semanticFonts: options.semanticFonts,
    semanticRadii: options.semanticRadii,
    semanticShadows: options.semanticShadows,
    semanticMotion: options.semanticMotion,
    semanticSpacing: options.semanticSpacing,
    semanticTextShadows: options.semanticTextShadows,
    fontFamilies: options.fontFamilies,
    includeCoreTokens: options.includeCoreTokens,
    includeSemanticTokens: options.includeSemanticTokens,
    extendTheme: options.extendTheme,
  }
  const hasSemanticOverrides =
    options.semanticColors != null ||
    options.semanticFonts != null ||
    options.semanticRadii != null ||
    options.semanticShadows != null ||
    options.semanticMotion != null ||
    options.semanticSpacing != null ||
    options.semanticTextShadows != null

  const semanticOverrideCss = hasSemanticOverrides
    ? buildCssFromVariables(
        generateSemanticTokenVariables({
          colors: options.semanticColors,
          fonts: options.semanticFonts,
          radii: options.semanticRadii,
          shadows: options.semanticShadows,
          motion: options.semanticMotion,
          spacing: options.semanticSpacing,
          textShadows: options.semanticTextShadows,
        })
      )
    : ''
  const fontOverrideCss = options.fontFamilies
    ? buildCssFromVariables(
        generateFontFamilyOverrideVariables(options.fontFamilies)
      )
    : ''
  const overrideCss = [semanticOverrideCss, fontOverrideCss]
    .filter(fragment => fragment.length > 0)
    .join('\n')
  let tailwindCssPath: string | null = null

  return {
    name: 'beatui-tailwind',
    enforce: 'pre',
    async configResolved(resolved) {
      projectRoot = resolved.root
      resolvedConfigPath =
        findTailwindConfig(projectRoot, options.tailwindConfigPath) ??
        resolvedConfigPath
      publicBasePath =
        resolved.base && resolved.base !== '/'
          ? resolved.base.endsWith('/')
            ? resolved.base
            : `${resolved.base}/`
          : '/'
      if (injectCss) {
        const resolvedCssModule = await resolveWithPluginContext(
          this,
          CSS_MODULE_ID
        )
        tailwindCssPath =
          normalizeResolvedId(resolvedCssModule) ??
          resolveTailwindCssFile(projectRoot)
      }
      if (!resolvedConfigPath) {
        this.warn(
          '[BeatUI] Tailwind config file not found. BeatUI preset will not be auto-registered. ' +
            'Specify tailwindConfigPath if your config lives elsewhere.'
        )
      }
      if (injectCss && !tailwindCssPath) {
        this.warn(
          '[BeatUI] Unable to resolve @tempots/beatui/tailwind.css. CSS will not be auto-injected.'
        )
      }
    },
    configureServer(server: ViteDevServer) {
      if (!injectCss || tailwindCssPath == null) return
      server.middlewares.use((req, res, next) => {
        const method = req.method ?? 'GET'
        if (!['GET', 'HEAD'].includes(method)) {
          next()
          return
        }
        const urlPath = (req.url ?? '').split('?')[0]
        const validPaths = new Set<string>(
          [
            `/${CSS_ASSET_FILENAME}`,
            publicBasePath === '/'
              ? null
              : `${publicBasePath}${CSS_ASSET_FILENAME}`,
          ].filter((entry): entry is string => Boolean(entry))
        )

        if (!validPaths.has(urlPath)) {
          next()
          return
        }

        res.setHeader('Content-Type', 'text/css')
        try {
          let cssSource = fs.readFileSync(tailwindCssPath!, 'utf8')
          if (overrideCss) {
            cssSource += `\n${overrideCss}`
          }
          res.end(cssSource)
        } catch (error) {
          server.config.logger.error(
            `[BeatUI] Failed to stream ${CSS_MODULE_ID}: ${String(error)}`
          )
          res.statusCode = 500
          res.end()
        }
      })
    },
    buildStart() {
      if (!injectCss || tailwindCssPath == null) return
      const cssFilePath = tailwindCssPath!
      let cssSource = fs.readFileSync(cssFilePath, 'utf8')
      if (overrideCss) {
        cssSource += `\n${overrideCss}`
      }
      this.emitFile({
        type: 'asset',
        fileName: CSS_ASSET_FILENAME,
        source: cssSource,
      })
    },
    async config(userConfig) {
      const beatuiPreset = createBeatuiPreset(presetOptions)
      const cssInput = (userConfig as ViteUserConfig).css
      const nextCss: MutableCSSOptions = {}
      if (typeof cssInput === 'object' && cssInput !== null) {
        Object.assign(nextCss, cssInput)
      }
      const postcssInput = nextCss.postcss

      let postcss: PostcssConfig = {}
      if (typeof postcssInput === 'object' && postcssInput !== null) {
        postcss = { ...postcssInput }
      }

      const existingPlugins = postcss.plugins
      let pluginList: PostcssPluginEntry[] = []

      if (Array.isArray(existingPlugins)) {
        pluginList = [...existingPlugins]
      } else if (existingPlugins) {
        pluginList = [existingPlugins]
      }

      if (!resolvedConfigPath) {
        resolvedConfigPath =
          findTailwindConfig(projectRoot, options.tailwindConfigPath) ?? null
      }

      let tailwindFactory: unknown

      try {
        const postcssNamespace = await importFromProject(
          '@tailwindcss/postcss',
          projectRoot
        )
        tailwindFactory =
          (postcssNamespace as { default?: unknown }).default ??
          postcssNamespace
      } catch {
        // ignore and fall back to tailwindcss package
      }

      if (typeof tailwindFactory !== 'function') {
        try {
          const tailwindNamespace = await importFromProject(
            'tailwindcss',
            projectRoot
          )
          tailwindFactory =
            (tailwindNamespace as { default?: unknown }).default ??
            tailwindNamespace
        } catch (error) {
          const reason =
            error instanceof Error && error.message ? ` (${error.message})` : ''
          this.warn(
            `[BeatUI] Unable to load Tailwind CSS automatically. Install \`@tailwindcss/postcss\` (Tailwind v4) or \`tailwindcss\` (legacy) in your project.${reason}`
          )
        }
      }

      const isTailwindFactory = typeof tailwindFactory === 'function'
      if (isTailwindFactory) {
        const pluginAlreadyPresent = pluginList.some(
          plugin => getPluginName(plugin) === 'tailwindcss'
        )
        if (!pluginAlreadyPresent) {
          try {
            const tailwindPlugin = (
              tailwindFactory as (config: unknown) => PostcssPluginEntry
            )({
              config: resolvedConfigPath ?? {
                presets: [beatuiPreset],
              },
            })
            pluginList.push(tailwindPlugin)
          } catch (error) {
            const reason =
              error instanceof Error && error.message
                ? ` (${error.message})`
                : ''
            this.warn(
              `[BeatUI] Failed to initialize Tailwind automatically. Install \`@tailwindcss/postcss\` (Tailwind v4) or register Tailwind manually.${reason}`
            )
          }
        }
      } else if (tailwindFactory != null) {
        this.warn(
          '[BeatUI] Unable to load Tailwind CSS automatically. Received unexpected module shape.'
        )
      }

      const updatedConfig: ViteUserConfig = {
        define: {
          'import.meta.env.BEATUI_TAILWIND_PRESET':
            JSON.stringify(beatuiPreset),
        },
        css: {
          ...nextCss,
          postcss: {
            ...postcss,
            plugins: pluginList,
          },
        },
      }

      return updatedConfig as unknown as UserConfig
    },
    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = []

      if (injectCss && tailwindCssPath) {
        const cssHref =
          publicBasePath === '/'
            ? `/${CSS_ASSET_FILENAME}`
            : `${publicBasePath}${CSS_ASSET_FILENAME}`
        tags.push({
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: cssHref,
          },
          injectTo: 'head-prepend',
        })
      }

      const syncScript = `
        (() => {
          const apply = () => {
            const root = document.documentElement
            const target = document.body
            if (!target) return
            const hasDark = root.classList.contains('${darkClass.replace(/'/g, "\\'")}')
            target.classList.toggle('b-dark', hasDark)
            target.classList.toggle('b-light', !hasDark)
            const dirValue = root.getAttribute('${rtlAttribute.replace(/'/g, "\\'")}')
            const isRtl = dirValue === '${rtlValue.replace(/'/g, "\\'")}'
            target.classList.toggle('b-rtl', isRtl)
            target.classList.toggle('b-ltr', !isRtl)
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', apply, { once: true })
          } else {
            apply()
          }
          const observer = new MutationObserver(apply)
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', '${rtlAttribute.replace(/'/g, "\\'")}'],
          })
        })();
      `

      tags.push({
        tag: 'script',
        attrs: { type: 'module' },
        children: syncScript,
        injectTo: 'body',
      })

      return { html, tags }
    },
  }
}

export default beatuiTailwindPlugin
