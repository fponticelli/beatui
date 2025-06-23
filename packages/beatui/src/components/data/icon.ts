import { aria, attr, computedOf, html, style, TNode, Value } from '@tempots/dom'
import { IconSize } from '../theme'
import { Resource, WhenInViewport } from '@tempots/ui'
import { ThemeColorName } from '@/tokens'

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
  title?: Value<string>
}

function generateIconClasses(size: IconSize, color?: string): string {
  const classes = ['bc-icon', `bc-icon--${size}`]
  if (color) {
    classes.push(`bu-fg--${color}`)
  }
  return classes.join(' ')
}

export function Icon(
  { icon, size = 'md', color, title }: IconOptions,
  ...children: TNode[]
) {
  return html.span(
    attr.class(
      computedOf(
        size,
        color
      )((size, color) => generateIconClasses(size ?? 'md', color))
    ),
    aria.label(title),
    WhenInViewport({ once: true }, () =>
      Resource<string, string, string>({
        request: icon,
        load: ({ request }) => loadIconSvg(request),
        mapError: String,
      })({
        success: svg =>
          html.span(
            style.width('100%'),
            style.height('100%'),
            attr.innerHTML(svg)
          ),
        loading: () => html.span(attr.class('animate-spin'), '↻'),
        failure: err =>
          html.span(attr.title(err), attr.class('text-red-500'), '🚫'),
      })
    ),
    ...children
  )
}
