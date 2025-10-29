import {
  Value,
  html,
  attr,
  computedOf,
  OnDispose,
  WithElement,
} from '@tempots/dom'

export interface NativePdfPreviewOptions {
  /** PDF content blob */
  content: Value<Blob> | Value<string> | Value<ArrayBuffer> | Value<Uint8Array>
  /** Show/hide toolbar (Chrome only). Default: true */
  toolbar?: Value<boolean>
  /** Initial page number to display (Chrome, Firefox, Safari) */
  page?: Value<number>
  /** Zoom level in percentage (Chrome, Firefox). Example: 150 for 150% */
  zoom?: Value<number>
  /** Zoom fit mode (Chrome only). FitV=vertical, FitH=horizontal, Fit=both */
  view?: Value<'FitV' | 'FitH' | 'Fit'>
  /** Page mode (Chrome only). none=normal, thumbs=thumbnail, bookmarks=bookmarks */
  pagemode?: Value<
    | 'none'
    | 'thumbs'
    | 'bookmarks'
    | 'attachments'
    | 'full-screen'
    | 'optionalcontent'
  >
  /** Show/hide scrollbar (Chrome only). Default: true */
  scrollbar?: Value<boolean>
  /** Show/hide navigation panes (Chrome only). Default: true */
  navpanes?: Value<boolean>
  /** Search term (Chrome only) */
  search?: Value<string>
  /** Named destination (Chrome only) */
  nameddest?: Value<string>
  /** View rectangle (Chrome only) */
  viewrect?: Value<string>
  /** Highlight search term (Chrome only) */
  highlight?: Value<string>
  /** Allow fullscreen (Chrome only). Default: true */
  allowfullscreen?: Value<boolean>
}

export function NativePdfPreview({
  content,
  toolbar = true,
  page,
  zoom,
  view,
  pagemode,
  scrollbar = true,
  navpanes = true,
  search,
  nameddest,
  viewrect,
  highlight,
  allowfullscreen = false,
}: NativePdfPreviewOptions) {
  const fileUrl = Value.toSignal(
    content as Value<Blob | string | ArrayBuffer | Uint8Array>
  ).mapAsync(async payload => {
    if (payload instanceof Blob) {
      // Ensure the Blob has the correct content type for native PDF preview
      const buffer = await payload.arrayBuffer()
      const blob = new Blob([buffer], { type: 'application/pdf' })
      return URL.createObjectURL(blob)
    } else if (payload instanceof ArrayBuffer) {
      return URL.createObjectURL(
        new Blob([payload], { type: 'application/pdf' })
      )
    } else if (payload instanceof Uint8Array) {
      return URL.createObjectURL(
        new Blob([new Uint8Array(payload)], { type: 'application/pdf' })
      )
    } else if (typeof payload === 'string') {
      // Fetch the PDF and ensure it has the correct content type for inline rendering
      const response = await fetch(payload)
      const buffer = await response.arrayBuffer()
      const blob = new Blob([buffer], { type: 'application/pdf' })
      return URL.createObjectURL(blob)
    }
  }, null)

  // Build URL with PDF viewer parameters
  const urlWithParams = computedOf(
    fileUrl,
    toolbar,
    page,
    zoom,
    view,
    pagemode,
    scrollbar,
    navpanes,
    search,
    nameddest,
    viewrect,
    highlight
  )((url, tb, p, z, v, pm, sb, np, s, nd, vr, hl) => {
    if (url == null) return null

    const params: string[] = []

    // Add toolbar parameter (Chrome only)
    if (tb === false) {
      params.push('toolbar=0')
    }

    // Add page parameter (Chrome, Firefox, Safari)
    if (p != null && p > 0) {
      params.push(`page=${p}`)
    }

    // Add zoom parameter (Chrome, Firefox)
    if (z != null && z > 0) {
      params.push(`zoom=${z}`)
    }

    // Add view parameter (Chrome only)
    if (v != null) {
      params.push(`view=${v}`)
    }

    // Add pagemode parameter (Chrome only)
    if (pm != null) {
      params.push(`pagemode=${pm}`)
    }

    // Add scrollbar parameter (Chrome only)
    if (sb === false) {
      params.push('scrollbar=0')
    }

    // Add navpanes parameter (Chrome only)
    if (np === false) {
      params.push('navpanes=0')
    }

    // Add search parameter (Chrome only)
    if (s != null) {
      params.push(`search=${encodeURIComponent(s)}`)
    }

    // Add nameddest parameter (Chrome only)
    if (nd != null) {
      params.push(`nameddest=${encodeURIComponent(nd)}`)
    }

    // Add viewrect parameter (Chrome only)
    if (vr != null) {
      params.push(`viewrect=${encodeURIComponent(vr)}`)
    }

    // Add highlight parameter (Chrome only)
    if (hl != null) {
      params.push(`highlight=${encodeURIComponent(hl)}`)
    }

    const fragment = params.join('&')
    return fragment ? `${url}#${fragment}` : url
  })

  return html.div(
    OnDispose(
      urlWithParams,
      fileUrl.on((_, previous) => {
        if (previous == null) return
        URL.revokeObjectURL(previous)
      }),
      () => {
        const url = fileUrl.value
        if (url == null) return
        URL.revokeObjectURL(url)
      }
    ),
    attr.class('h-full w-full'),
    // could also use embed or object. IFrame seems to work on Safari.
    html.iframe(
      attr.class('h-full w-full'),
      attr.allowfullscreen(allowfullscreen),
      attr.title('PDF Preview'),
      attr.loading('lazy'),
      // Force iframe reload when URL changes (including fragment changes)
      // by manually updating src instead of using attr.src
      WithElement(iframe => {
        const iframeEl = iframe as HTMLIFrameElement
        let isInitial = true
        // Update src whenever URL changes
        return OnDispose(
          urlWithParams.on(url => {
            if (url == null) return

            if (isInitial) {
              // On initial load, just set the src
              iframeEl.src = url
              isInitial = false
            } else {
              // On subsequent changes, force reload by clearing and resetting src
              // This ensures the iframe reloads even when only the fragment changes
              iframeEl.src = 'about:blank'
              // Use setTimeout to ensure the blank page loads before setting new URL
              setTimeout(() => {
                iframeEl.src = url
              }, 50)
            }
          })
        )
      })
    )
  )
}
