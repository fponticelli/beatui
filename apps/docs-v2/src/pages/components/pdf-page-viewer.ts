import { PdfPageViewer, Button, Icon } from '@tempots/beatui'
import { html, attr, prop, style } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'PdfPageViewer',
  category: 'Media',
  component: 'PdfPageViewer',
  description:
    'A PDF.js-powered page viewer with fit modes, rotation, text selection layer, and annotation support. Renders a single page at a time.',
  icon: 'lucide:file-text',
  order: 5,
}

const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/WCAG21/wcag21.pdf'

export default function PdfPageViewerPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('PdfPageViewer', signals => {
      return html.div(
        attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
        style.height('480px'),
        PdfPageViewer({
          source: SAMPLE_PDF_URL,
          page: signals.page as never,
          fit: signals.fit as never,
          rotation: signals.rotation as never,
          quality: signals.quality as never,
          renderTextLayer: signals.renderTextLayer as never,
          renderAnnotationLayer: signals.renderAnnotationLayer as never,
        })
      )
    }),
    sections: [
      Section(
        'Fit Modes',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...(['width', 'height', 'contain'] as const).map(fit =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), `fit: '${fit}'`),
                html.div(
                  attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
                  style.height('300px'),
                  PdfPageViewer({ source: SAMPLE_PDF_URL, fit })
                )
              )
            )
          ),
        'Fit modes control how the page scales within its container: width (fills width), height (fills height), contain (largest that fits).'
      ),
      Section(
        'Page Navigation',
        () => {
          const page = prop(1)
          return html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              attr.class('flex items-center gap-2'),
              Button(
                { size: 'sm', variant: 'outline', onClick: () => page.set(Math.max(1, page.value - 1)) },
                Icon({ icon: 'lucide:chevron-left', size: 'sm' })
              ),
              html.span(
                attr.class('text-sm text-gray-600 dark:text-gray-400'),
                page.map(p => `Page ${p}`)
              ),
              Button(
                { size: 'sm', variant: 'outline', onClick: () => page.set(page.value + 1) },
                Icon({ icon: 'lucide:chevron-right', size: 'sm' })
              )
            ),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
              style.height('400px'),
              PdfPageViewer({ source: SAMPLE_PDF_URL, page, fit: 'width' })
            )
          )
        },
        'Use the page prop (1-based) to navigate between pages. The PDF document is cached across page changes.'
      ),
      Section(
        'Rotation',
        () => {
          const rotation = prop<0 | 90 | 180 | 270>(0)
          return html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              attr.class('flex gap-2'),
              ...([0, 90, 180, 270] as const).map(r =>
                Button(
                  {
                    size: 'sm',
                    variant: rotation.map(v => v === r ? 'filled' : 'outline') as never,
                    color: 'primary',
                    onClick: () => rotation.set(r),
                  },
                  `${r}\u00B0`
                )
              )
            ),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
              style.height('400px'),
              PdfPageViewer({
                source: SAMPLE_PDF_URL,
                rotation,
                fit: 'contain',
              })
            )
          )
        },
        'Rotate the page in 90-degree increments using the rotation prop (0, 90, 180, 270).'
      ),
    ],
  })
}
