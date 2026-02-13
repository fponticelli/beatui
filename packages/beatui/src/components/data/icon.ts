import {
  aria,
  attr,
  computedOf,
  html,
  style,
  TNode,
  Value,
  Fragment,
  When,
  Use,
  coalesce,
} from '@tempots/dom'
import { IconSize } from '../theme'
import { Query, WhenInViewport } from '@tempots/ui'
import { ThemeColorName } from '../../tokens'
import { BeatUII18n } from '../../beatui-i18n'
import { foregroundColorValue, ForegroundTone } from '../theme/style-utils'

const dbName = 'bui-icons'

// In-memory fallback cache
const memoryCache = new Map<string, string>()

// Check if indexedDB is available
export const isIndexedDBAvailable = (() => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
})()

function openIconDB() {
  if (!isIndexedDBAvailable) {
    return Promise.reject(new Error('IndexedDB not available'))
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('icons')) {
        db.createObjectStore('icons') // key is the icon ID
      }
    }

    request.onsuccess = function () {
      resolve(request.result)
    }

    request.onerror = function () {
      reject(request.error)
    }
  })
}

const dbPromise = isIndexedDBAvailable ? openIconDB() : null

/**
 * Stores an icon SVG string in the local cache (IndexedDB or in-memory fallback).
 *
 * @param id - The icon identifier (e.g., `'mdi/home'`)
 * @param svgString - The raw SVG markup to cache
 */
export async function storeIconLocally(id: string, svgString: string) {
  try {
    if (dbPromise) {
      const db = await dbPromise
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('icons', 'readwrite')
        const store = tx.objectStore('icons')
        store.put(svgString, id)
        tx.oncomplete = () => resolve()
        tx.onerror = reject
      })
    } else {
      // Fallback to in-memory cache
      memoryCache.set(id, svgString)
    }
  } catch (_error) {
    // If IndexedDB fails, fallback to memory cache
    memoryCache.set(id, svgString)
  }
}

/**
 * Retrieves a cached icon SVG string from local storage (IndexedDB or in-memory fallback).
 *
 * @param id - The icon identifier (e.g., `'mdi/home'`)
 * @returns The cached SVG string, or `null` if not found
 */
export async function getIconLocally(id: string): Promise<string | null> {
  try {
    if (dbPromise) {
      const db = await dbPromise
      return new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction('icons', 'readonly')
        const store = tx.objectStore('icons')
        const request = store.get(id)
        request.onsuccess = function () {
          resolve(request.result as string | null)
        }
        request.onerror = reject
      })
    } else {
      // Fallback to in-memory cache
      return memoryCache.get(id) || null
    }
  } catch (_error) {
    // If IndexedDB fails, fallback to memory cache
    return memoryCache.get(id) || null
  }
}

async function loadRemoteIconSvg(iconName: string): Promise<string> {
  const path = `https://api.iconify.design/${iconName}.svg`
  return fetch(path).then(res => {
    if (res.status === 200) {
      return res.text()
    }
    throw new Error(`Failed to load icon: ${iconName}`)
  })
}

async function loadIconSvg(iconName: string): Promise<string> {
  const id = iconName.replace(':', '/')
  const local = await getIconLocally(id)
  if (local) {
    return local
  }
  const svg = await loadRemoteIconSvg(id)
  await storeIconLocally(id, svg)
  return svg
}

/**
 * Configuration options for the {@link Icon} component.
 */
export interface IconOptions {
  /** Icon name in Iconify format (e.g., `'mdi:home'`, `'line-md:loading-twotone-loop'`). */
  icon: Value<string>
  /** Size of the icon. @default 'md' */
  size?: Value<IconSize>
  /** Theme color applied to the icon. Uses foreground color values. */
  color?: Value<ThemeColorName>
  /** Accessible title for informative icons. Also sets the tooltip. */
  title?: Value<string | undefined>
  /**
   * Accessibility mode for the icon.
   * - `'decorative'`: Hidden from screen readers with `aria-hidden="true"`
   * - `'informative'`: Gets `aria-label` and `role="img"` for screen readers
   * - `'auto'`: Determined by the presence of a `title` prop
   * @default 'auto'
   */
  accessibility?: Value<'decorative' | 'informative' | 'auto'>
  /** Foreground color tone: `'solid'` for vibrant or `'soft'` for muted. @default 'solid' */
  tone?: Value<ForegroundTone>
}

function generateIconClasses(size: IconSize): string {
  return ['bc-icon', `bc-icon--${size}`].join(' ')
}

function generateIconStyles(
  color?: ThemeColorName,
  tone: ForegroundTone = 'solid'
): string {
  if (!color) return ''
  const light = foregroundColorValue(color, tone, 'light')
  const dark = foregroundColorValue(color, tone, 'dark')
  return `--icon-color: ${light}; --icon-color-dark: ${dark}`
}

/**
 * Renders an SVG icon from the Iconify icon library with lazy-loading and caching.
 *
 * Icons are fetched from the Iconify API on first use and cached in IndexedDB
 * (with an in-memory fallback) for subsequent loads. The icon is only loaded when
 * it enters the viewport (`WhenInViewport`), preventing unnecessary network requests.
 *
 * The component handles three states: pending (spinning placeholder), success (rendered SVG),
 * and failure (error indicator). Accessibility is configurable: decorative icons are hidden
 * from screen readers, while informative icons receive proper ARIA attributes.
 *
 * @param options - Configuration for icon name, size, color, and accessibility
 * @param children - Additional child nodes appended to the icon container
 * @returns A span element containing the rendered icon
 *
 * @example
 * ```typescript
 * Icon({ icon: 'mdi:home', size: 'lg', color: 'primary' })
 * ```
 *
 * @example
 * ```typescript
 * // Informative icon with accessible label
 * Icon({
 *   icon: 'mdi:alert',
 *   color: 'warning',
 *   title: 'Warning: unsaved changes',
 *   accessibility: 'informative'
 * })
 * ```
 */
export function Icon(
  {
    icon,
    size = 'md',
    color,
    title,
    accessibility = 'auto',
    tone = 'solid',
  }: IconOptions,
  ...children: TNode[]
) {
  // Determine if icon is decorative or informative
  const isInformative = computedOf(
    accessibility,
    title
  )((acc, title) => {
    if (acc === 'decorative') return false
    if (acc === 'informative') return true
    // Auto mode: informative if title is provided
    return title != null && title !== ''
  })

  return Use(BeatUII18n, t =>
    html.span(
      attr.class(
        computedOf(size, color)(size => generateIconClasses(size ?? 'md'))
      ),
      attr.style(
        computedOf(
          color,
          tone
        )((color, tone) =>
          generateIconStyles(color ?? undefined, tone ?? 'solid')
        )
      ),
      // Add accessibility attributes based on icon type
      When(
        isInformative,
        () =>
          Fragment(
            attr.role('img'),
            aria.label(coalesce(title, t.$.iconDescription))
          ),
        () => aria.hidden(true)
      ),
      WhenInViewport({ once: true }, () =>
        Query<string, string, string>({
          request: icon,
          load: ({ request }) => loadIconSvg(request),
          convertError: String,
          success: ({ value: svg }) =>
            html.span(
              style.width('100%'),
              style.height('100%'),
              attr.innerHTML(svg)
            ),
          pending: () =>
            html.span(
              attr.class('animate-spin'),
              // Loading state accessibility
              When(
                isInformative,
                () => Fragment(attr.role('img'), aria.label(t.$.loadingIcon)),
                () => aria.hidden(true)
              ),
              '↻'
            ),
          failure: ({ error }) =>
            html.span(
              attr.title(error),
              attr.class('text-red-500'),
              // Error state accessibility
              When(
                isInformative,
                () =>
                  Fragment(attr.role('img'), aria.label(t.$.failedToLoadIcon)),
                () => aria.hidden(true)
              ),
              '🚫'
            ),
        })
      ),
      ...children
    )
  )
}
