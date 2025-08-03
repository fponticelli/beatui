import {
  Link,
  LinkVariant,
  Stack,
  SegmentedControl,
  ScrollablePanel,
  Label,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

export const LinkPage = () => {
  const variant = prop<LinkVariant>('default')

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Variant'),
        SegmentedControl({
          value: variant,
          options: {
            default: 'Default',
            plain: 'Plain',
            hover: 'Hover',
          },
          onChange: variant.set,
        })
      )
    ),
    body: Stack(
      attr.class('bu-gap-6 bu-p-6'),

      // Basic example
      html.div(
        html.h3('Interactive Link'),
        html.p(
          'This is a paragraph with a ',
          Link(
            {
              href: '#',
              variant,
            },
            'sample link'
          ),
          ' that responds to the variant control above.'
        )
      ),

      // All variants
      html.div(
        html.h3('All Variants'),
        Stack(
          attr.class('bu-gap-2'),
          html.div(
            html.strong('Default: '),
            Link(
              { href: '#', variant: 'default' },
              'Link with default underline'
            )
          ),
          html.div(
            html.strong('Plain: '),
            Link({ href: '#', variant: 'plain' }, 'Link with no underline')
          ),
          html.div(
            html.strong('Hover: '),
            Link(
              { href: '#', variant: 'hover' },
              'Link with underline on hover'
            )
          )
        )
      ),

      // Note about additional features
      html.div(
        html.h3('Additional Features'),
        html.p(
          'The Link component also supports color and disabled properties, as well as a NavigationLink component for automatic active state management. These features are available but not shown in this demo due to TypeScript configuration issues.'
        )
      ),

      // External link example
      html.div(
        html.h3('External Link'),
        html.p(
          'Visit ',
          Link(
            {
              href: 'https://github.com/fponticelli/beatui',
              variant: 'hover',
              target: '_blank',
              rel: 'noopener noreferrer',
              withViewTransition: false,
            },
            'BeatUI on GitHub'
          ),
          ' for more information.'
        )
      )
    ),
  })
}
