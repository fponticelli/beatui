import { Center, CenterH, Button, Card } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Center',
  category: 'Layout',
  component: 'Center',
  description:
    'Centers its children both horizontally and vertically within a container, with configurable gap spacing.',
  icon: 'lucide:align-center',
  order: 6,
}

export default function CenterPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Center', props =>
      html.div(
        attr.class('h-48 p-4 border rounded-lg border-gray-200 dark:border-gray-700'),
        Center(
          props,
          html.div(
            attr.class('text-sm font-medium text-gray-600 dark:text-gray-400'),
            'Centered Content'
          )
        )
      )
    ),
    sections: [
      ...AutoSections('Center', props =>
        html.div(
          attr.class('h-32 p-4 border rounded-lg border-gray-200 dark:border-gray-700'),
          Center(
            props,
            html.span(attr.class('text-sm text-gray-500'), 'Content')
          )
        )
      ),
      Section(
        'Center (both axes)',
        () =>
          html.div(
            attr.class('h-48 border rounded-lg border-gray-200 dark:border-gray-700'),
            Center(
              {},
              Card(
                { variant: 'elevated', size: 'sm' },
                html.p(attr.class('text-sm'), 'Centered on both axes')
              )
            )
          ),
        'Center positions content in the middle of the container horizontally and vertically.'
      ),
      Section(
        'CenterH (horizontal only)',
        () =>
          html.div(
            attr.class('py-6 border rounded-lg border-gray-200 dark:border-gray-700'),
            CenterH(
              html.div(
                attr.class('max-w-xs'),
                Card(
                  { variant: 'outlined' },
                  html.h3(attr.class('font-semibold mb-1'), 'Horizontally Centered'),
                  html.p(
                    attr.class('text-sm text-gray-500'),
                    'This card is centered horizontally only.'
                  )
                )
              )
            )
          ),
        'CenterH centers content horizontally while keeping normal vertical flow.'
      ),
      Section(
        'Loading State',
        () =>
          html.div(
            attr.class('h-48 border rounded-lg border-gray-200 dark:border-gray-700'),
            Center(
              {},
              html.div(
                attr.class('flex flex-col items-center gap-3'),
                html.div(
                  attr.class(
                    'w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin'
                  )
                ),
                html.p(
                  attr.class('text-sm text-gray-500 dark:text-gray-400'),
                  'Loading…'
                )
              )
            )
          ),
        'Center is ideal for loading spinners and empty state indicators.'
      ),
      Section(
        'Page Hero',
        () =>
          html.div(
            attr.class(
              'h-48 rounded-lg bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900'
            ),
            Center(
              { gap: 'md' },
              html.div(
                attr.class('text-center'),
                html.h2(
                  attr.class('text-xl font-bold text-sky-700 dark:text-sky-300 mb-2'),
                  'Welcome to BeatUI'
                ),
                html.p(
                  attr.class('text-sm text-sky-600 dark:text-sky-400 mb-4'),
                  'Build beautiful interfaces with Tempo reactivity.'
                ),
                Button({ variant: 'filled', color: 'primary' }, 'Get Started')
              )
            )
          ),
        'Center works great for hero sections and splash screens.'
      ),
    ],
  })
}
