import { Value, html, attr, OnDispose, computedOf } from '@tempots/dom'

export interface PDFJSPreviewOptions {
  /** PDF content as Blob, Uint8Array, ArrayBuffer, or URL string */
  content: Value<Blob> | Value<string> | Value<ArrayBuffer> | Value<Uint8Array>

  // Navigation & Display Options
  /** Initial page number to display (1-based) */
  page?: Value<number>
  /** Zoom level: 'auto', 'page-fit', 'page-width', or a percentage number (e.g., 150 for 150%) */
  zoom?: Value<'auto' | 'page-fit' | 'page-width' | number>
  /** Page mode: 'none', 'thumbs', 'bookmarks', 'attachments' */
  pagemode?: Value<'none' | 'thumbs' | 'bookmarks' | 'attachments'>
  /** Named destination to navigate to */
  nameddest?: Value<string>
  /** Search term to highlight */
  search?: Value<string>

  // Viewer Configuration Options
  /** Text layer mode: 0=disable, 1=enable, 2=enable for accessibility. Default: 1 */
  textLayerMode?: Value<0 | 1 | 2>
  /** Sidebar view on load: -1=default, 0=none, 1=thumbs, 2=outline, 3=attachments, 4=layers */
  sidebarViewOnLoad?: Value<-1 | 0 | 1 | 2 | 3 | 4>
  /** Scroll mode: -1=default, 0=vertical, 1=horizontal, 2=wrapped */
  scrollModeOnLoad?: Value<-1 | 0 | 1 | 2>
  /** Spread mode: -1=default, 0=none, 1=odd, 2=even */
  spreadModeOnLoad?: Value<-1 | 0 | 1 | 2>
  /** Enable JavaScript execution in PDFs. Default: true (security consideration) */
  enableScripting?: Value<boolean>
  /** Enable printing. Default: true */
  enablePrinting?: Value<boolean>

  // Component Options
  /** Custom viewer URL. Default: Mozilla's hosted viewer */
  viewerUrl?: Value<string | null>
  /** Allow fullscreen. Default: true */
  allowfullscreen?: Value<boolean>
  /** Custom CSS class for container */
  class?: Value<string | null>
}

export function PDFJSPreview({
  content,
  page,
  zoom,
  pagemode,
  nameddest,
  search,
  textLayerMode,
  sidebarViewOnLoad,
  scrollModeOnLoad,
  spreadModeOnLoad,
  enableScripting,
  enablePrinting,
  viewerUrl = null,
  allowfullscreen = true,
  class: customClass = null,
}: PDFJSPreviewOptions) {
  // Convert content to blob URL
  const fileUrl = Value.toSignal(
    content as Value<Blob | string | ArrayBuffer | Uint8Array>
  ).mapAsync(async payload => {
    if (payload instanceof Blob) {
      return URL.createObjectURL(payload)
    } else if (payload instanceof ArrayBuffer) {
      return URL.createObjectURL(
        new Blob([payload], { type: 'application/pdf' })
      )
    } else if (payload instanceof Uint8Array) {
      return URL.createObjectURL(
        new Blob([new Uint8Array(payload)], { type: 'application/pdf' })
      )
    } else if (typeof payload === 'string') {
      return payload
    }
  }, null)

  // Build viewer URL with parameters
  const viewerUrlWithParams = computedOf(
    fileUrl,
    viewerUrl,
    page,
    zoom,
    pagemode,
    nameddest,
    search,
    textLayerMode,
    sidebarViewOnLoad,
    scrollModeOnLoad,
    spreadModeOnLoad,
    enableScripting,
    enablePrinting
  )((url, customViewer, p, z, pm, nd, s, tlm, svol, scmol, spmol, es, ep) => {
    if (url == null) return null

    // Base viewer URL - use Mozilla's hosted viewer
    const baseUrl =
      customViewer ?? 'https://mozilla.github.io/pdf.js/web/viewer.html'

    // Build query parameters
    const params = new URLSearchParams()
    params.set('file', encodeURIComponent(url))

    // Build hash parameters for viewer options
    const hashParams: string[] = []

    // Navigation parameters
    if (p != null && p > 0) {
      hashParams.push(`page=${p}`)
    }

    if (z != null) {
      if (typeof z === 'string') {
        hashParams.push(`zoom=${z}`)
      } else {
        hashParams.push(`zoom=${z}`)
      }
    }

    if (pm != null) {
      hashParams.push(`pagemode=${pm}`)
    }

    if (nd != null) {
      hashParams.push(`nameddest=${encodeURIComponent(nd)}`)
    }

    if (s != null) {
      hashParams.push(`search=${encodeURIComponent(s)}`)
    }

    // Viewer configuration parameters
    if (tlm != null) {
      hashParams.push(`textLayer=${tlm}`)
    }

    if (svol != null) {
      hashParams.push(`sidebar=${svol}`)
    }

    if (scmol != null) {
      hashParams.push(`scrollMode=${scmol}`)
    }

    if (spmol != null) {
      hashParams.push(`spreadMode=${spmol}`)
    }

    if (es != null) {
      hashParams.push(`enableScripting=${es ? '1' : '0'}`)
    }

    if (ep != null) {
      hashParams.push(`enablePrinting=${ep ? '1' : '0'}`)
    }

    const hash = hashParams.length > 0 ? `#${hashParams.join('&')}` : ''
    return `${baseUrl}?${params.toString()}${hash}`
  })

  return html.div(
    OnDispose(
      viewerUrlWithParams,
      fileUrl.on((_, previous) => {
        if (previous == null) return
        // Only revoke if it's a blob URL (starts with 'blob:')
        if (previous.startsWith('blob:')) {
          URL.revokeObjectURL(previous)
        }
      }),
      () => {
        const url = fileUrl.value
        if (url == null) return
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      }
    ),
    attr.class('bc-pdfjs-preview h-full w-full'),
    attr.class(customClass),
    html.iframe(
      attr.class('h-full w-full'),
      attr.allowfullscreen(allowfullscreen),
      attr.title('PDF Preview'),
      attr.loading('lazy'),
      attr.src(viewerUrlWithParams)
    )
  )
}
