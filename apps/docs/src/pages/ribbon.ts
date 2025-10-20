import { html, attr } from '@tempots/dom'
import { Card, Ribbon, Icon, ScrollablePanel } from '@tempots/beatui'

export default function RibbonPage() {
  return ScrollablePanel({
    body: html.div(
      attr.class(
        'flex flex-row flex-wrap gap-12 p-12 items-start justify-center'
      ),

      // Basic ribbon on a card
      Card(
        {},
        attr.class(
          'w-80 h-40 p-4 flex items-center justify-center relative overflow-hidden'
        ),
        html.div(
          attr.class('text-center'),
          html.h3(attr.class('text-lg font-semibold'), 'Basic Ribbon'),
          html.p(attr.class('text-gray-500'), 'Top-right 45° band')
        ),
        Ribbon(
          {
            width: 120,
            offset: 40,
          },
          'Beta'
        )
      ),

      // Different color
      Card(
        {},
        attr.class('w-80 h-40 p-4 flex items-center justify-center relative'),
        html.div(
          attr.class('text-center'),
          html.h3(attr.class('text-lg font-semibold'), 'Accent Color'),
          html.p(attr.class('text-gray-500'), 'Custom color background')
        ),
        Ribbon({ color: 'white', offset: 20, width: 60 }, 'New')
      ),

      // Longer text and icon
      Card(
        {},
        attr.class('w-80 h-40 p-4 flex items-center justify-center relative'),
        html.div(
          attr.class('text-center'),
          html.h3(attr.class('text-lg font-semibold'), 'Rich Content'),
          html.p(attr.class('text-gray-500'), 'Icon + long label')
        ),
        Ribbon(
          {
            color: 'success',
            angle: 15,
            inset: -75,
            offset: 25,
            width: 200,
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
      ),

      // Top-left corner
      Card(
        {},
        attr.class(
          'w-80 h-40 p-4 flex items-center justify-center relative overflow-hidden'
        ),
        html.div(
          attr.class('text-center'),
          html.h3(attr.class('text-lg font-semibold'), 'Top-Left'),
          html.p(attr.class('text-gray-500'), 'Corner position')
        ),
        Ribbon(
          {
            corner: 'top-right',
            color: 'info',
            width: 120,
            offset: 40,
          },
          'Do it!'
        ),
        Ribbon(
          {
            corner: 'top-left',
            width: 120,
            offset: 40,
          },
          'Sale'
        ),
        Ribbon(
          {
            corner: 'bottom-right',
            color: 'warning',
            width: 120,
            offset: 40,
          },
          'Alert'
        ),
        Ribbon(
          {
            corner: 'bottom-left',
            color: 'danger',
            width: 120,
            offset: 40,
          },
          'Hot'
        )
      )
    ),
  })
}
