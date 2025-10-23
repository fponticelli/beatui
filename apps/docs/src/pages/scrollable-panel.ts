import { html, attr, prop, merge, MapSignal } from '@tempots/dom'
import { InputWrapper, ScrollablePanel, Switch } from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export default function ScrollablePanelPage() {
  const displayShadows = prop(true)
  const displayHeader = prop(true)
  const displayFooter = prop(true)

  const header = html.div(
    attr.class('p-2 bg-gray-200 border-b'),
    html.h3(attr.class('font-semibold'), 'Header Content'),
    html.p(attr.class('text-sm text-gray-600'), 'This header stays at the top')
  )

  const body = html.div(
    attr.class('p-4'),
    html.h4(attr.class('font-medium mb-2'), 'Scrollable Content'),
    ...Array.from({ length: 20 }, (_, i) =>
      html.p(
        attr.class('mb-2'),
        `This is paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
      )
    )
  )

  const footer = html.div(
    attr.class('p-2 bg-gray-100 border-t'),
    html.p(
      attr.class('text-sm text-gray-600'),
      'This footer stays at the bottom'
    )
  )

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Display Shadows',
        content: Switch({
          value: displayShadows,
          onChange: displayShadows.set,
        }),
      }),
      InputWrapper({
        label: 'Display Header',
        content: Switch({
          value: displayHeader,
          onChange: displayHeader.set,
        }),
      }),
      InputWrapper({
        label: 'Display Footer',
        content: Switch({
          value: displayFooter,
          onChange: displayFooter.set,
        }),
      })
    ),
    body: MapSignal(
      merge({ displayHeader, displayFooter }),
      ({ displayHeader, displayFooter }) => {
        if (displayHeader && displayFooter) {
          return ScrollablePanel({
            shadowOnScroll: displayShadows,
            header,
            body,
            footer,
          })
        } else if (displayHeader) {
          return ScrollablePanel({
            shadowOnScroll: displayShadows,
            header,
            body,
          })
        } else if (displayFooter) {
          return ScrollablePanel({
            shadowOnScroll: displayShadows,
            body,
            footer,
          })
        } else {
          return ScrollablePanel({
            shadowOnScroll: displayShadows,
            body,
          })
        }
      }
    ),
  })
}
