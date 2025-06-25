import { html, attr, prop } from '@tempots/dom'
import { ScrollablePanel, Stack, Label, Switch } from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export const ScrollablePanelPage = () => {
  const displayShadows = prop(true)

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Display Shadows'),
        Switch({ value: displayShadows, onChange: displayShadows.set })
      )
    ),
    body: ScrollablePanel({
      shadowOnScroll: displayShadows,
      header: html.div(
        attr.class('bu-p-2 bu-bg--light-gray bu-border-b'),
        html.h3(attr.class('bu-font-semibold'), 'Header Content'),
        html.p(
          attr.class('bu-text-sm bu-text-gray-600'),
          'This header stays at the top'
        )
      ),
      body: html.div(
        attr.class('bu-p-2'),
        html.h4(attr.class('bu-font-medium bu-mb-2'), 'Scrollable Content'),
        ...Array.from({ length: 20 }, (_, i) =>
          html.p(
            attr.class('bu-mb-2'),
            `This is paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
          )
        )
      ),
      footer: html.div(
        attr.class('bu-p-2 bu-bg--lighter-gray bu-border-t'),
        html.p(
          attr.class('bu-text-sm bu-text-gray-600'),
          'This footer stays at the bottom'
        )
      ),
    }),
  })
}
