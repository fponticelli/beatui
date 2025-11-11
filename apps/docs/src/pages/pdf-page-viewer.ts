import { ControlsHeader } from '../elements/controls-header'
import {
  ScrollablePanel,
  PdfPageViewer,
  InputWrapper,
  NumberInput,
  TextInput,
  Group,
  Button,
} from '@tempots/beatui'
import { html, attr, prop, Value } from '@tempots/dom'

export default function PdfPageViewerPage() {
  // Sample PDF URL (Mozilla's PDF.js test file)
  const pdfUrl = prop(
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
  )
  const page = prop(1)
  const scale = prop(2)

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'PDF URL',
        content: TextInput({
          value: pdfUrl,
          onChange: pdfUrl.set,
          placeholder: 'Enter PDF URL',
        }),
      }),
      InputWrapper({
        label: 'Page',
        content: NumberInput({
          value: page,
          onChange: page.set,
          min: 1,
          step: 1,
        }),
      }),
      InputWrapper({
        label: 'Scale',
        content: NumberInput({
          value: scale,
          onChange: scale.set,
          min: 0.5,
          max: 3,
          step: 0.1,
        }),
      }),
      Group(
        attr.class('gap-2'),
        Button(
          {
            onClick: () => page.set(Math.max(1, page.value - 1)),
          },
          'Previous'
        ),
        Button(
          {
            onClick: () => page.set(page.value + 1),
          },
          'Next'
        )
      )
    ),
    body: html.div(
      attr.class(
        'h-full overflow-hidden bg-gray-100 p-4 flex justify-center items-center'
      ),
      PdfPageViewer(
        {
          source: pdfUrl as Value<string | Uint8Array | ArrayBuffer>,
          page,
          scale,
        },
        attr.class('shadow-md')
      )
    ),
  })
}
