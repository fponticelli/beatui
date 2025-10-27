import { Value, html, attr, computedOf, OnDispose } from '@tempots/dom'

export interface NativePdfPreviewOptions {
  /** PDF content blob */
  content: Value<Blob>
  /** Show/hide toolbar (Chrome only). Default: true */
  toolbar?: Value<boolean>
  /** Initial page number to display (Chrome, Firefox, Safari) */
  page?: Value<number>
  /** Zoom level in percentage (Chrome, Firefox). Example: 150 for 150% */
  zoom?: Value<number>
  /** Zoom fit mode (Chrome only). FitV=vertical, FitH=horizontal, Fit=both */
  view?: Value<'FitV' | 'FitH' | 'Fit'>
}

export function NativePdfPreview({
  content,
  toolbar = true,
  page,
  zoom,
  view,
}: NativePdfPreviewOptions) {
  const blob = Value.toSignal(content)
  const fileUrl = computedOf(blob)(blob => blob.arrayBuffer()).mapAsync(
    async buffer => {
      const blob = new Blob([await buffer], { type: 'application/pdf' })
      return URL.createObjectURL(blob)
    },
    null
  )

  // Build URL with PDF viewer parameters
  const urlWithParams = computedOf(
    fileUrl,
    toolbar,
    page,
    zoom,
    view
  )((url, tb, p, z, v) => {
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
    html.iframe(attr.class('h-full w-full'), attr.src(urlWithParams))
  )
}
