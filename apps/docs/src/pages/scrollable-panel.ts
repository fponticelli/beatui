import { html, attr, prop, merge, MapSignal } from '@tempots/dom'
import { ScrollablePanel, Switch } from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export const ScrollablePanelPage = () => {
  const displayShadows = prop(true)
  const displayHeader = prop(true)
  const displayFooter = prop(true)

  const header = html.div(
    attr.class('bu-p-2 bu-bg--light-gray bu-border-b'),
    html.h3(attr.class('bu-font-semibold'), 'Header Content'),
    html.p(
      attr.class('bu-text-sm bu-text-gray-600'),
      'This header stays at the top'
    )
  )

  const body = html.div(
    attr.class('bu-p-2'),
    html.h4(attr.class('bu-font-medium bu-mb-2'), 'Scrollable Content'),
    ...Array.from({ length: 20 }, (_, i) =>
      html.p(
        attr.class('bu-mb-2'),
        `This is paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
      )
    )
  )

  const footer = html.div(
    attr.class('bu-p-2 bu-bg--lighter-gray bu-border-t'),
    html.p(
      attr.class('bu-text-sm bu-text-gray-600'),
      'This footer stays at the bottom'
    )
  )

  return ScrollablePanel({
    header: ControlsHeader(
      Switch({
        label: 'Display Shadows',
        value: displayShadows,
        onChange: displayShadows.set,
      }),
      Switch({
        label: 'Display Header',
        value: displayHeader,
        onChange: displayHeader.set,
      }),
      Switch({
        label: 'Display Footer',
        value: displayFooter,
        onChange: displayFooter.set,
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
