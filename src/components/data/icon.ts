import { aria, attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { IconSize, Theme } from '../theme'
import { Resource, WhenInViewport } from '@tempots/ui'

const dbName = 'bui-icons'
function openIconDB() {
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
const dbPromise = openIconDB()

function storeIconLocally(id: string, svgString: string) {
  return new Promise(async (resolve, reject) => {
    const db = await dbPromise
    const tx = db.transaction('icons', 'readwrite')
    const store = tx.objectStore('icons')
    store.put(svgString, id)
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

function getIconLocally(id: string) {
  return new Promise<string | null>(async (resolve, reject) => {
    const db = await dbPromise
    const tx = db.transaction('icons', 'readonly')
    const store = tx.objectStore('icons')
    const request = store.get(id)
    request.onsuccess = function () {
      resolve(request.result as string | null)
    }
    request.onerror = reject
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
  color?: Value<string>
  title?: Value<string>
}

export function Icon(
  { icon, size = 'md', color, title }: IconOptions,
  ...children: TNode[]
) {
  return Use(Theme, ({ theme }) => {
    return html.span(
      attr.class(
        computedOf(
          theme,
          size,
          color
        )((theme, size, color) => theme.icon({ size, color }))
      ),
      aria.label(title),
      WhenInViewport({ once: true }, () =>
        Resource<string, string, string>({
          request: icon,
          load: ({ request }) => loadIconSvg(request),
          mapError: String,
        })({
          success: svg => html.span(attr.innerHTML(svg)),
          loading: () => html.span(attr.class('animate-spin'), '↻'),
          failure: err =>
            html.span(attr.title(err), attr.class('text-red-500'), '🚫'),
        })
      ),
      ...children
    )
  })
}
