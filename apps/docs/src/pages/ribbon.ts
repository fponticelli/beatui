import { html, attr, style } from '@tempots/dom'
import {
  Card,
  Group,
  Stack,
  Ribbon,
  Icon,
  ScrollablePanel,
} from '@tempots/beatui'

export default function RibbonPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-8 p-8 items-start justify-center'),

      // Basic ribbon on a card
      html.div(
        style.position('relative'),
        Card(
          {},
          attr.class('w-80 h-40 p-4 flex items-center justify-center'),
          html.div(
            attr.class('text-center'),
            html.h3(attr.class('text-lg font-semibold'), 'Basic Ribbon'),
            html.p(attr.class('text-gray-500'), 'Top-right 45° band')
          )
        ),
        Ribbon(
          {
            minWidth: '120px',
            offset: '40px',
          },
          'Beta'
        )
      ),

      // Different color
      html.div(
        style.position('relative'),
        Card(
          {},
          attr.class('w-80 h-40 p-4 flex items-center justify-center'),
          html.div(
            attr.class('text-center'),
            html.h3(attr.class('text-lg font-semibold'), 'Accent Color'),
            html.p(attr.class('text-gray-500'), 'Custom color background')
          )
        ),
        Ribbon({ color: 'white', offset: '20px', minWidth: 60 }, 'New')
      ),

      // Longer text and icon
      html.div(
        style.position('relative'),
        Card(
          {},
          attr.class('w-80 h-40 p-4 flex items-center justify-center'),
          html.div(
            attr.class('text-center'),
            html.h3(attr.class('text-lg font-semibold'), 'Rich Content'),
            html.p(attr.class('text-gray-500'), 'Icon + long label')
          )
        ),
        Ribbon(
          {
            color: 'success',
            offset: '80px',
            thickness: '48px',
            minWidth: 200,
          },
          html.div(
            attr.class(
              'border-y-white border-y-dashed border-dotted border-y-3 py-1 m-1 w-full'
            ),
            attr.class('flex justify-center items-center gap-2'),
            Icon({ icon: 'lucide:award', size: 'sm', color: 'white' }),
            html.span('Featured Release')
          )
        )
      )
    ),
  })
}
