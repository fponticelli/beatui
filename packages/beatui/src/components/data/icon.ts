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
import { ThemeColorName } from '@/tokens'
import { BeatUII18n } from '@/beatui-i18n'
import {
  foregroundColorValue,
  ForegroundTone,
} from '../theme/style-utils'

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

export function storeIconLocally(id: string, svgString: string) {
  return new Promise(async (resolve, reject) => {
    try {
      if (dbPromise) {
        const db = await dbPromise
        const tx = db.transaction('icons', 'readwrite')
        const store = tx.objectStore('icons')
        store.put(svgString, id)
        tx.oncomplete = resolve
        tx.onerror = reject
      } else {
        // Fallback to in-memory cache
        memoryCache.set(id, svgString)
        resolve(undefined)
      }
    } catch (_error) {
      // If IndexedDB fails, fallback to memory cache
      memoryCache.set(id, svgString)
      resolve(undefined)
    }
  })
}

export function getIconLocally(id: string) {
  return new Promise<string | null>(async (resolve, reject) => {
    try {
      if (dbPromise) {
        const db = await dbPromise
        const tx = db.transaction('icons', 'readonly')
        const store = tx.objectStore('icons')
        const request = store.get(id)
        request.onsuccess = function () {
          resolve(request.result as string | null)
        }
        request.onerror = reject
      } else {
        // Fallback to in-memory cache
        resolve(memoryCache.get(id) || null)
      }
    } catch (_error) {
      // If IndexedDB fails, fallback to memory cache
      resolve(memoryCache.get(id) || null)
    }
  })
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

export interface IconOptions {
  icon: Value<string>
  size?: Value<IconSize>
  color?: Value<ThemeColorName>
  title?: Value<string | undefined>
  /**
   * Whether this icon is decorative (hidden from screen readers) or informative.
   * - 'decorative': Icon is purely visual, hidden from screen readers with aria-hidden="true"
   * - 'informative': Icon conveys meaning, gets aria-label and role="img"
   * - 'auto': Automatically determined based on presence of title prop
   * @default 'auto'
   */
  accessibility?: Value<'decorative' | 'informative' | 'auto'>
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
        computedOf(
          size,
          color
        )((size) => generateIconClasses(size ?? 'md'))
      ),
      attr.style(
        computedOf(color, tone)((color, tone) =>
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
