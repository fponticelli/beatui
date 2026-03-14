import { Card, CardHeader, CardBody, CardFooter, CardCoverImage, Button } from '@tempots/beatui'
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
    playground: autoPlayground(
      'Card',
      props =>
        Card(
          props,
          html.h3(attr.class('font-semibold mb-2'), 'Card Title'),
          html.p(
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            'This is the card body content. Cards are great for grouping related information.'
          )
        ),
      {
        childrenCode: `\n  html.h3(attr.class('font-semibold mb-2'), 'Card Title'),\n  html.p('Card body content goes here.')`,
        extraImports: ['CardHeader', 'CardBody', 'CardFooter'],
      }
    ),
    sections: [
      ...AutoSections('Card', props =>
        Card(
          props,
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
        'Structured Card',
        () =>
          html.div(
            attr.class('max-w-sm'),
            Card(
              {},
              CardHeader(
                {},
                html.h3(attr.class('font-semibold'), 'Project Settings')
              ),
              CardBody(
                {},
                html.p(
                  attr.class('text-sm text-gray-600 dark:text-gray-400'),
                  'Configure your project name, description, and visibility. Changes are saved automatically.'
                )
              ),
              CardFooter(
                {},
                Button({ variant: 'default', size: 'sm' }, 'Cancel'),
                Button({ variant: 'filled', color: 'primary', size: 'sm' }, 'Save')
              )
            )
          ),
        'Use CardHeader, CardBody, and CardFooter for structured layouts with built-in borders and padding.'
      ),
      Section(
        'Cover Image',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            html.div(
              attr.class('max-w-xs'),
              Card(
                {},
                CardCoverImage({
                  src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=200&fit=crop',
                  alt: 'Landscape',
                  height: '180px',
                }),
                CardBody(
                  {},
                  html.h3(attr.class('font-semibold mb-1'), 'Mountain Lake'),
                  html.p(
                    attr.class('text-sm text-gray-500 dark:text-gray-400'),
                    'A beautiful alpine lake surrounded by mountains.'
                  )
                )
              )
            ),
            html.div(
              attr.class('max-w-xs'),
              Card(
                {},
                CardBody(
                  {},
                  html.h3(attr.class('font-semibold mb-1'), 'Ocean Sunset'),
                  html.p(
                    attr.class('text-sm text-gray-500 dark:text-gray-400'),
                    'Golden hour over the Pacific coast.'
                  )
                ),
                CardCoverImage({
                  src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop',
                  alt: 'Sunset',
                  height: '180px',
                })
              )
            )
          ),
        'CardCoverImage renders a full-bleed image that inherits the card border radius. Place it first for top images or last for bottom images.'
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
                  'w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0'
                ),
                html.span(attr.class('text-xl'), 'U')
              ),
              html.div(
                html.h3(attr.class('font-semibold'), 'User Profile'),
                html.p(
                  attr.class('text-sm text-gray-500 dark:text-gray-400 mt-1'),
                  'Cards without sub-components use the card\'s own padding directly.'
                )
              )
            )
          ),
        'Without sub-components, Card works as a simple padded container.'
      ),
    ],
  })
}
