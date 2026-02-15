import { html, attr, prop, When } from '@tempots/dom'
import { InputWrapper, ScrollablePanel, Switch } from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export default function ScrollablePanelPage() {
  const displayShadows = prop(true)
  const displayHeader = prop(true)
  const displayFooter = prop(true)

  const header = html.div(
    attr.class('p-2 bg-gray-200 dark:bg-gray-700 border-b'),
    html.h3(attr.class('font-semibold'), 'Header Content'),
    html.p(
      attr.class('text-sm text-gray-600 dark:text-gray-400'),
      'This header stays at the top'
    )
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
    attr.class('p-2 bg-gray-100 dark:bg-gray-800 border-t'),
    html.p(
      attr.class('text-sm text-gray-600 dark:text-gray-400'),
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
    body: When(
      displayHeader,
      () =>
        When(
          displayFooter,
          () =>
            ScrollablePanel({
              shadowOnScroll: displayShadows,
              header,
              body,
              footer,
            }),
          () =>
            ScrollablePanel({
              shadowOnScroll: displayShadows,
              header,
              body,
            })
        ),
      () =>
        When(
          displayFooter,
          () =>
            ScrollablePanel({
              shadowOnScroll: displayShadows,
              body,
              footer,
            }),
          () =>
            ScrollablePanel({
              shadowOnScroll: displayShadows,
              body,
            })
        )
    ),
  })
}
