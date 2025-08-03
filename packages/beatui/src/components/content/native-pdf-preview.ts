import { Value, html, attr, computedOf, OnDispose } from '@tempots/dom'

export function NativePdfPreview({ content }: { content: Value<Blob> }) {
  const blob = Value.toSignal(content)
  const fileUrl = computedOf(blob)(blob => blob.arrayBuffer()).mapAsync(
    async buffer => {
      const blob = new Blob([await buffer], { type: 'application/pdf' })
      return URL.createObjectURL(blob)
    },
    null
  )
  return html.div(
    OnDispose(
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
    html.iframe(attr.class('h-full w-full'), attr.src(fileUrl))
  )
}
