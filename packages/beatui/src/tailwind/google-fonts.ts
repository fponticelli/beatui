import fs from 'node:fs'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

export type GoogleFontStyle = 'normal' | 'italic'

export type GoogleFontDisplay =
  | 'auto'
  | 'block'
  | 'swap'
  | 'fallback'
  | 'optional'

export interface GoogleFontRequest {
  family: string
  /**
   * List of numeric font weights to request from Google Fonts (e.g., [400, 500, 700]).
   * When omitted, Google Fonts will serve the default variation (usually 400).
   */
  weights?: readonly number[]
  /**
   * Font styles to request. Defaults to ['normal'].
   */
  styles?: readonly GoogleFontStyle[]
  /**
   * Optional font-display strategy to pass to Google Fonts.
   */
  display?: GoogleFontDisplay
  /**
   * Target subsets (e.g., ['latin', 'latin-ext']).
   */
  subsets?: readonly string[]
  /**
   * Optional `text=` filter passed to Google Fonts to trim the character set.
   */
  text?: string
}

export interface GoogleFontAsset {
  url: string
  fileName: string
  localPath: string
  placeholder: string
}

export interface GoogleFontPreparationResult {
  cssText: string
  assets: GoogleFontAsset[]
}

interface PrepareGoogleFontsOptions {
  projectRoot: string
  requests: readonly GoogleFontRequest[]
  cacheDir?: string
  logger?: (message: string) => void
}

const GOOGLE_CSS_ENDPOINT = 'https://fonts.googleapis.com/css2'
const DEFAULT_STYLE: GoogleFontStyle = 'normal'
const DEFAULT_WEIGHT = 400
const USER_AGENT =
  'Mozilla/5.0 (compatible; BeatUI Tailwind Plugin; +https://tempots.com)'

export async function prepareGoogleFonts(
  options: PrepareGoogleFontsOptions
): Promise<GoogleFontPreparationResult | null> {
  const { projectRoot, requests, logger } = options
  if (!requests || requests.length === 0) {
    return null
  }

  const cacheRoot = options.cacheDir
    ? path.resolve(options.cacheDir)
    : path.join(projectRoot, 'node_modules', '.beatui', 'google-fonts')

  const cssFragments: string[] = []
  const assetMap = new Map<string, GoogleFontAsset>()

  await mkdir(cacheRoot, { recursive: true }).catch(error => {
    logger?.(`Unable to create BeatUI Google Fonts cache directory: ${error}`)
  })

  for (const request of requests) {
    try {
      const cssUrl = buildGoogleFontCssUrl(request)
      const cssText = await fetchCssWithCache({
        request,
        cssUrl,
        cacheRoot,
        logger,
      })
      if (!cssText) {
        continue
      }
      const processedCss = await rewriteCssWithPlaceholders({
        cssText,
        cacheRoot,
        assetMap,
        logger,
      })
      cssFragments.push(processedCss)
    } catch (error) {
      logger?.(
        `Unexpected error while downloading Google Font "${request.family}": ${String(error)}`
      )
    }
  }

  if (cssFragments.length === 0 || assetMap.size === 0) {
    return null
  }

  return {
    cssText: cssFragments.join('\n'),
    assets: Array.from(assetMap.values()),
  }
}

async function fetchCssWithCache({
  request,
  cssUrl,
  cacheRoot,
  logger,
}: {
  request: GoogleFontRequest
  cssUrl: string
  cacheRoot: string
  logger?: (message: string) => void
}): Promise<string | null> {
  const cacheFile = path.join(cacheRoot, getCssCacheFileName(request, cssUrl))

  try {
    const cssResponse = await fetch(cssUrl, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!cssResponse.ok) {
      throw new Error(
        `Failed to download Google Font CSS: ${cssResponse.status} ${cssResponse.statusText}`
      )
    }

    const cssText = await cssResponse.text()
    await writeFile(cacheFile, cssText)
    return cssText
  } catch (error) {
    if (fs.existsSync(cacheFile)) {
      try {
        const cssText = await readFile(cacheFile, 'utf8')
        logger?.(
          `Using cached Google Font CSS for ${request.family} because download failed.`
        )
        return cssText
      } catch (readError) {
        logger?.(
          `Failed to read cached Google Font CSS for ${request.family}: ${readError}`
        )
      }
    }
    logger?.(
      `Unable to download Google Font CSS for ${request.family}: ${error}`
    )
    return null
  }
}

function getCssCacheFileName(
  request: GoogleFontRequest,
  cssUrl: string
): string {
  const hash = createHash('sha1').update(cssUrl).digest('hex').slice(0, 10)
  const slug = request.family
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
  return `${slug || 'font'}-${hash}.css`
}

export function buildGoogleFontCssUrl(request: GoogleFontRequest): string {
  const { family } = request
  const normalizedFamily = family.trim().replace(/\s+/g, '+')
  const weights = normalizeWeights(request.weights)
  const styles = normalizeStyles(request.styles)

  const params = new URLSearchParams()
  params.append('family', buildFamilyQuery(normalizedFamily, weights, styles))

  if (request.display) {
    params.append('display', request.display)
  }

  if (request.subsets && request.subsets.length > 0) {
    params.append('subset', request.subsets.join(','))
  }

  if (request.text) {
    params.append('text', request.text)
  }

  return `${GOOGLE_CSS_ENDPOINT}?${params.toString()}`
}

function normalizeWeights(weights?: readonly number[]): number[] {
  if (!weights || weights.length === 0) {
    return []
  }
  return Array.from(new Set(weights)).sort((a, b) => a - b)
}

function normalizeStyles(
  styles?: readonly GoogleFontStyle[]
): GoogleFontStyle[] {
  if (!styles || styles.length === 0) {
    return [DEFAULT_STYLE]
  }
  const unique = Array.from(new Set(styles))
  const hasItalic = unique.includes('italic')
  const hasNormal = unique.includes('normal')

  if (!hasItalic && !hasNormal) {
    unique.push(DEFAULT_STYLE)
  }

  return unique.sort((a, b) => (a === b ? 0 : a === 'normal' ? -1 : 1))
}

function buildFamilyQuery(
  normalizedFamily: string,
  weights: number[],
  styles: GoogleFontStyle[]
): string {
  if (weights.length === 0 && styles.every(style => style === 'normal')) {
    return normalizedFamily
  }

  const hasItalic = styles.includes('italic')
  const hasNormal = styles.includes('normal')

  const effectiveWeights = weights.length > 0 ? weights : [DEFAULT_WEIGHT]

  if (!hasItalic) {
    return `${normalizedFamily}:wght@${effectiveWeights.join(';')}`
  }

  const pairs = new Set<string>()
  if (hasNormal) {
    effectiveWeights.forEach(weight => {
      pairs.add(`0,${weight}`)
    })
  }
  effectiveWeights.forEach(weight => {
    pairs.add(`1,${weight}`)
  })

  const orderedPairs = Array.from(pairs).sort((a, b) => {
    const [aItal, aWeight] = a.split(',').map(Number)
    const [bItal, bWeight] = b.split(',').map(Number)
    return aItal - bItal || aWeight - bWeight
  })

  return `${normalizedFamily}:ital,wght@${orderedPairs.join(';')}`
}

const FONT_URL_REGEX = /url\(([^)]+)\)/g

async function rewriteCssWithPlaceholders({
  cssText,
  cacheRoot,
  assetMap,
  logger,
}: {
  cssText: string
  cacheRoot: string
  assetMap: Map<string, GoogleFontAsset>
  logger?: (message: string) => void
}): Promise<string> {
  let result = cssText
  const urls = new Set<string>()

  let match: RegExpExecArray | null
  while ((match = FONT_URL_REGEX.exec(cssText)) !== null) {
    const rawUrl = match[1]
    const cleanedUrl = rawUrl.trim().replace(/^['"]|['"]$/g, '')
    if (!cleanedUrl.startsWith('http')) {
      continue
    }
    urls.add(cleanedUrl)
  }

  for (const url of urls) {
    const asset = await ensureFontAsset(url, cacheRoot, assetMap, logger)
    if (!asset) {
      continue
    }
    const escapedUrl = url.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const pattern = new RegExp(`url\\((['"])${escapedUrl}\\1\\)`, 'g')
    const unquotedPattern = new RegExp(`url\\(${escapedUrl}\\)`, 'g')
    result = result.replace(pattern, `url(${asset.placeholder})`)
    result = result.replace(unquotedPattern, `url(${asset.placeholder})`)
  }

  return result
}

async function ensureFontAsset(
  url: string,
  cacheRoot: string,
  assetMap: Map<string, GoogleFontAsset>,
  logger?: (message: string) => void
): Promise<GoogleFontAsset | null> {
  const existing = assetMap.get(url)
  if (existing) {
    return existing
  }

  let fileName: string
  try {
    const parsed = new URL(url)
    fileName = path.basename(parsed.pathname)
  } catch (error) {
    logger?.(`Invalid Google Font URL skipped: ${url} (${error})`)
    return null
  }

  if (!fileName) {
    logger?.(`Unable to derive file name for Google Font URL: ${url}`)
    return null
  }

  const localPath = path.join(cacheRoot, fileName)
  const placeholder = `__BEATUI_GOOGLE_FONT_${assetMap.size}__`

  if (!fs.existsSync(localPath)) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      })
      if (!response.ok) {
        logger?.(
          `Failed to download Google Font asset ${fileName}: ${response.status} ${response.statusText}`
        )
        return null
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      await writeFile(localPath, buffer)
    } catch (error) {
      logger?.(
        `Unexpected error while downloading Google Font asset ${fileName}: ${String(error)}`
      )
      return null
    }
  }

  const asset: GoogleFontAsset = {
    url,
    fileName,
    localPath,
    placeholder,
  }

  assetMap.set(url, asset)
  return asset
}
