import { ControlsHeader } from '../elements/controls-header'
import {
  ScrollablePanel,
  PdfPageViewer,
  InputWrapper,
  NumberInput,
  TextInput,
  Group,
  Button,
  NativeSelect,
  Switch,
  Option,
  NotificationService,
} from '@tempots/beatui'
import { html, attr, prop, Value, computedOf } from '@tempots/dom'

export default function PdfPageViewerPage() {
  // Sample PDF URL (Mozilla's PDF.js test file)
  const pdfUrl = prop(
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
  )
  const page = prop(1)
  const totalPages = prop(0)
  const fit = prop<'none' | 'width' | 'height' | 'contain' | 'cover'>('contain')
  const scale = prop(1)
  const rotation = prop<0 | 90 | 180 | 270>(0)
  const quality = prop(2)
  const renderTextLayer = prop(true)
  const renderAnnotationLayer = prop(false)

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'PDF URL',
        content: TextInput({
          value: pdfUrl,
          onChange: v => pdfUrl.set(v),
          placeholder: 'Enter PDF URL',
        }),
      }),
      InputWrapper({
        label: 'Page',
        content: html.div(
          attr.class('flex items-center gap-2'),
          NumberInput({
            value: page,
            onChange: v => page.set(v),
            min: 1,
            max: totalPages,
            step: 1,
          }),
          html.span(
            attr.class(
              'text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap'
            ),
            '/',
            totalPages.map(String)
          )
        ),
      }),
      InputWrapper({
        label: 'Fit Mode',
        content: NativeSelect({
          value: fit as Value<string>,
          onChange: (v: string) =>
            fit.set(v as 'none' | 'width' | 'height' | 'contain' | 'cover'),
          options: [
            Option.value('width', 'Fit Width (default)'),
            Option.value('height', 'Fit Height'),
            Option.value('contain', 'Contain (fit entire page)'),
            Option.value('cover', 'Cover (fill, may crop)'),
            Option.value('none', 'None (use explicit scale)'),
          ],
        }),
      }),
      InputWrapper({
        label: 'Scale (when fit=none)',
        content: NumberInput({
          value: scale,
          onChange: v => scale.set(v),
          min: 0.1,
          max: 5,
          step: 0.1,
          disabled: computedOf(fit)(f => f !== 'none'),
        }),
      }),
      InputWrapper({
        label: 'Rotation',
        content: NativeSelect({
          value: rotation.map(String),
          onChange: (v: string) =>
            rotation.set(parseInt(v) as 0 | 90 | 180 | 270),
          options: [
            Option.value('0', '0°'),
            Option.value('90', '90°'),
            Option.value('180', '180°'),
            Option.value('270', '270°'),
          ],
        }),
      }),
      InputWrapper({
        label: 'Quality',
        content: NumberInput({
          value: quality,
          onChange: v => quality.set(v),
          min: 0.5,
          max: 4,
          step: 0.5,
        }),
      }),
      InputWrapper({
        label: 'Text Layer (Selection)',
        content: Switch({
          value: renderTextLayer,
          onChange: v => renderTextLayer.set(v),
        }),
      }),
      InputWrapper({
        label: 'Annotation Layer',
        content: Switch({
          value: renderAnnotationLayer,
          onChange: v => renderAnnotationLayer.set(v),
        }),
      }),
      Group(
        attr.class('gap-2'),
        Button(
          {
            onClick: () => page.set(Math.max(1, page.value - 1)),
            disabled: page.map(p => p <= 1),
          },
          'Previous'
        ),
        Button(
          {
            onClick: () => page.set(Math.min(totalPages.value, page.value + 1)),
            disabled: computedOf(page, totalPages)((p, tp) => p >= tp),
          },
          'Next'
        )
      )
    ),
    body: html.div(
      attr.class(
        'h-full w-full overflow-hidden bg-gray-100 dark:bg-gray-800 p-4'
      ),
      html.div(
        attr.class('h-full w-full flex justify-center items-center'),
        PdfPageViewer(
          {
            source: pdfUrl as Value<string | Uint8Array | ArrayBuffer>,
            page,
            fit,
            scale,
            rotation,
            quality,
            renderTextLayer,
            renderAnnotationLayer,
            onPageChange: p => {
              page.set(p)
              NotificationService.show(
                {
                  title: 'Page changed',
                  color: 'info',
                  withBorder: true,
                  withCloseButton: true,
                  dismissAfter: 3,
                },
                html.span(`Current page: ${p}`)
              )
            },
            onLoadComplete: ({ pdfDoc }) => {
              totalPages.set(pdfDoc.numPages)
            },
          },
          attr.class('shadow-md')
        )
      )
    ),
  })
}
