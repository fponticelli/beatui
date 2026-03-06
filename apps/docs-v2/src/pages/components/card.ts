import { Card } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Card',
  category: 'Layout',
  component: 'Card',
  description:
    'A content container with visual separation using elevation, borders, or background depending on the variant.',
  icon: 'lucide:square',
  order: 1,
}

export default function CardPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Card', props =>
      Card(
        props as never,
        html.h3(attr.class('font-semibold mb-2'), 'Card Title'),
        html.p(
          attr.class('text-sm text-gray-500 dark:text-gray-400'),
          'This is the card body content. Cards are great for grouping related information.'
        )
      )
    ),
    sections: [
      ...AutoSections('Card', props =>
        Card(
          props as never,
          html.p('Sample card content.')
        )
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ...(['default', 'elevated', 'flat', 'outlined'] as const).map(
              variant =>
                Card(
                  { variant },
                  html.div(
                    attr.class('text-xs font-mono text-gray-500 mb-2'),
                    variant
                  ),
                  html.p(
                    attr.class('text-sm'),
                    'Card content with different visual weight.'
                  )
                )
            )
          ),
        'Cards support default, elevated, filled, and outline visual variants.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              Card(
                { size },
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  `size: ${size}`
                ),
                html.p(attr.class('text-sm'), 'Internal padding scales with size.')
              )
            )
          ),
        'The size prop controls internal padding.'
      ),
      Section(
        'Border Radius',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ...(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map(
              roundedness =>
                Card(
                  { variant: 'outlined', roundedness },
                  html.div(
                    attr.class('text-xs font-mono text-gray-500 mb-1'),
                    roundedness
                  ),
                  html.p(attr.class('text-sm'), 'Rounded corners.')
                )
            )
          ),
        'Control the corner radius with the roundedness prop.'
      ),
      Section(
        'As Content Container',
        () =>
          Card(
            { variant: 'elevated', size: 'lg' },
            html.div(
              attr.class('flex items-start gap-4'),
              html.div(
                attr.class(
                  'w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0'
                ),
                html.span(attr.class('text-xl'), 'U')
              ),
              html.div(
                html.h3(attr.class('font-semibold'), 'User Profile'),
                html.p(
                  attr.class('text-sm text-gray-500 dark:text-gray-400 mt-1'),
                  'Cards are ideal for displaying structured content like profiles, articles, and data summaries.'
                )
              )
            )
          ),
        'Cards are flexible containers for any kind of structured content.'
      ),
    ],
  })
}
