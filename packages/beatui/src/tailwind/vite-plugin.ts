import fs from 'node:fs'
import path from 'node:path'
import type { HtmlTagDescriptor, Plugin, ViteDevServer } from 'vite'

import {
  generateSemanticTokenVariables,
  generateFontFamilyOverrideVariables,
  getBaseFontSizeVarName,
  getSpacingVarName,
  getMotionDurationVarName,
} from '../tokens'
import type { SemanticColorOverrides } from '../tokens/colors'
import type {
  FontFamilyOverrides,
  SemanticFontOverrides,
} from '../tokens/typography'
import type { SemanticRadiusOverrides } from '../tokens/radius'
import type { SemanticShadowOverrides } from '../tokens/shadows'
import type { SemanticMotionOverrides } from '../tokens/motion'
import type { SemanticSpacingOverrides } from '../tokens/spacing'
import type { SemanticTextShadowOverrides } from '../tokens/text-shadows'
import {
  prepareGoogleFonts,
  buildGoogleFontCssUrl,
  type GoogleFontRequest,
  type GoogleFontAsset,
} from './google-fonts'

type PluginResolveFn = (
  this: unknown,
  id: string,
  importer?: string,
  options?: { skipSelf?: boolean }
) => Promise<{ id: string } | string | null>

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

export interface BeatuiTailwindPluginOptions {
  /** Override the semantic color mapping BeatUI uses (e.g. map `primary` to `emerald`). */
  semanticColors?: SemanticColorOverrides
  /** Override semantic font aliases (e.g. map `heading` to `var(--font-family-serif)`). */
  semanticFonts?: SemanticFontOverrides
  /** Override semantic radius aliases for controls, surfaces, etc. */
  semanticRadii?: SemanticRadiusOverrides
  /** Override semantic shadow aliases (elevation levels for surfaces, overlays, etc.). */
  semanticShadows?: SemanticShadowOverrides
  /** Override semantic motion tokens (transition durations/easing). */
  semanticMotion?: SemanticMotionOverrides
  /** Override spacing stack aliases for layout stacks. */
  semanticSpacing?: SemanticSpacingOverrides
  /** Override semantic text shadow aliases (e.g. button emphasis shadows). */
  semanticTextShadows?: SemanticTextShadowOverrides
  /** Override the default font family tokens (e.g. set `sans` to a custom stack). */
  fontFamilies?: FontFamilyOverrides
  /**
   * Override the base spacing unit (`--spacing-base`). All spacing scale values
   * are computed from this variable. Defaults to `'0.25rem'`.
   */
  baseSpacing?: string
  /**
   * Override the base font size (`--font-size-base`). All font size and per-size
   * line height values are computed from this variable. Defaults to `'1rem'`.
   */
  baseFontSize?: string
  /**
   * Override the base motion duration (`--motion-duration-base`). All duration
   * values are computed from this variable. Defaults to `'200ms'`.
   */
  baseMotionDuration?: string
  /** Automatically import the BeatUI Tailwind CSS bundle into the application entry. */
  injectCss?: boolean
  /** Tailwind class that denotes dark mode. Defaults to 'dark'. */
  darkClass?: string
  /** Attribute inspected for RTL mode. Defaults to `dir="rtl"`. */
  rtlAttribute?: string
  /** Value of RTL attribute that should trigger `.b-rtl`. Defaults to `rtl`. */
  rtlValue?: string
  /** Request Google Fonts for local hosting. */
  googleFonts?: GoogleFontRequest | GoogleFontRequest[]
}

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

function normalizeGoogleFontOptions(
  input?: GoogleFontRequest | GoogleFontRequest[]
): GoogleFontRequest[] {
  if (!input) {
    return []
  }
  return Array.isArray(input) ? input : [input]
}

function replacePlaceholders(
  source: string,
  replacements: Map<string, string>
): string {
  let result = source
  for (const [placeholder, value] of replacements) {
    result = result.split(placeholder).join(value)
  }
  return result
}

async function resolveWithPluginContext(
  context: unknown,
  id: string
): Promise<{ id: string } | string | null> {
  if (context == null || typeof context !== 'object') {
    return null
  }
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
  const injectCss = options.injectCss !== false
  const rtlAttribute = options.rtlAttribute ?? 'dir'
  const rtlValue = options.rtlValue ?? 'rtl'
  let publicBasePath = '/'
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
  const baseTokenOverrides: Record<string, string> = {}
  if (options.baseSpacing) {
    baseTokenOverrides[getSpacingVarName('base')] = options.baseSpacing
  }
  if (options.baseFontSize) {
    baseTokenOverrides[getBaseFontSizeVarName()] = options.baseFontSize
  }
  if (options.baseMotionDuration) {
    baseTokenOverrides[getMotionDurationVarName('base')] =
      options.baseMotionDuration
  }
  const baseTokenOverrideCss = buildCssFromVariables(baseTokenOverrides)
  const googleFontRequests = normalizeGoogleFontOptions(options.googleFonts)
  let googleFontCssRaw = ''
  let googleFontAssets: GoogleFontAsset[] = []
  const placeholderToDevPath = new Map<string, string>()
  const placeholderToBuildRef = new Map<string, string>()
  const devFontPathMap = new Map<string, string>()
  const GOOGLE_FONT_DEV_PREFIX = '/@beatui/google-fonts'
  const googleFontFallbackUrls: string[] = []
  let tailwindCssAssetRef: string | null = null
  let tailwindCssPath: string | null = null
  let isBuildCommand = false

  const buildOverrideCss = (mode: 'dev' | 'raw'): string => {
    const fragments = [
      baseTokenOverrideCss,
      semanticOverrideCss,
      fontOverrideCss,
    ]
    if (googleFontCssRaw) {
      if (mode === 'dev') {
        fragments.push(
          replacePlaceholders(googleFontCssRaw, placeholderToDevPath)
        )
      } else {
        fragments.push(googleFontCssRaw)
      }
    }
    return fragments
      .filter(fragment => fragment && fragment.length > 0)
      .join('\n')
  }

  return {
    name: 'beatui-tailwind',
    enforce: 'pre',
    async configResolved(resolved) {
      projectRoot = resolved.root
      isBuildCommand = resolved.command === 'build'
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

      const warn = (msg: string) => {
        if (this && typeof (this as { warn?: unknown }).warn === 'function') {
          ;(this as { warn: (msg: string) => void }).warn(msg)
        } else {
          resolved.logger.warn(msg)
        }
      }

      if (googleFontRequests.length > 0) {
        const remoteCssUrls = Array.from(
           
          new Set(googleFontRequests.map(buildGoogleFontCssUrl))
        )
        const preparation = await prepareGoogleFonts({
          projectRoot,
          requests: googleFontRequests,
          logger: message => warn(`[BeatUI] ${message}`),
        })
        googleFontCssRaw = preparation?.cssText ?? ''
        googleFontAssets = preparation?.assets ?? []
        placeholderToDevPath.clear()
        placeholderToBuildRef.clear()
        devFontPathMap.clear()
        googleFontFallbackUrls.length = 0
        if (googleFontAssets.length > 0) {
          for (const asset of googleFontAssets) {
            const devPath = `${GOOGLE_FONT_DEV_PREFIX}/${asset.fileName}`
            placeholderToDevPath.set(asset.placeholder, devPath)
            devFontPathMap.set(devPath, asset.localPath)
          }
        } else {
          googleFontFallbackUrls.push(...remoteCssUrls)
        }
      } else {
        googleFontFallbackUrls.length = 0
      }
      if (injectCss && !tailwindCssPath) {
        warn(
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
          const overrideCss = buildOverrideCss('dev')
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

      if (devFontPathMap.size > 0) {
        server.middlewares.use((req, res, next) => {
          const method = req.method ?? 'GET'
          if (!['GET', 'HEAD'].includes(method)) {
            next()
            return
          }
          const urlPath = (req.url ?? '').split('?')[0]
          const localPath = urlPath ? devFontPathMap.get(urlPath) : undefined
          if (!localPath) {
            next()
            return
          }
          res.setHeader('Content-Type', 'font/woff2')
          fs.createReadStream(localPath)
            .on('error', () => {
              res.statusCode = 500
              res.end()
            })
            .pipe(res)
        })
      }
    },
    buildStart() {
      if (!isBuildCommand || !injectCss || tailwindCssPath == null) return
      placeholderToBuildRef.clear()
      tailwindCssAssetRef = null
      const cssFilePath = tailwindCssPath!
      let cssSource = fs.readFileSync(cssFilePath, 'utf8')
      const overrideCss = buildOverrideCss('raw')
      if (overrideCss) {
        cssSource += `\n${overrideCss}`
      }
      tailwindCssAssetRef = this.emitFile({
        type: 'asset',
        fileName: CSS_ASSET_FILENAME,
        source: cssSource,
      })
      if (googleFontAssets.length > 0) {
        for (const asset of googleFontAssets) {
          try {
            const buffer = fs.readFileSync(asset.localPath)
            const refId = this.emitFile({
              type: 'asset',
              name: `assets/${asset.fileName}`,
              source: buffer,
            })
            placeholderToBuildRef.set(asset.placeholder, refId)
          } catch (error) {
            this.warn(
              `[BeatUI] Failed to include Google Font asset ${asset.fileName}: ${String(
                error
              )}`
            )
          }
        }
      }
    },
    generateBundle(_, bundle) {
      if (!isBuildCommand) {
        return
      }
      if (!tailwindCssAssetRef) {
        return
      }
      const cssFileName = this.getFileName(tailwindCssAssetRef)
      const asset = bundle[cssFileName]
      if (
        !asset ||
        asset.type !== 'asset' ||
        typeof asset.source !== 'string'
      ) {
        return
      }
      let updated = asset.source
      for (const [placeholder, refId] of placeholderToBuildRef) {
        const fileName = this.getFileName(refId)
        updated = updated.split(placeholder).join(fileName)
      }
      asset.source = updated
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

      if (googleFontFallbackUrls.length > 0) {
        tags.push(
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://fonts.googleapis.com',
            },
            injectTo: 'head' as const,
          },
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://fonts.gstatic.com',
              crossorigin: '',
            },
            injectTo: 'head' as const,
          },
          ...googleFontFallbackUrls.map(url => ({
            tag: 'link',
            attrs: {
              rel: 'stylesheet',
              href: url,
              'data-beatui-google-font': '',
            },
            injectTo: 'head' as const,
          }))
        )
      }

      const syncScript = `
        (() => {
          const apply = () => {
            const root = document.documentElement
            const target = document.body
            if (!target) return
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
            attributeFilter: ['${rtlAttribute.replace(/'/g, "\\'")}'],
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
export type { GoogleFontRequest }
