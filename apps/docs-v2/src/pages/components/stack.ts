import { Stack, Button, Card } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Stack',
  category: 'Layout',
  component: 'Stack',
  description:
    'Vertical stack layout that arranges children in a column with consistent spacing using flexbox.',
  icon: 'lucide:rows-3',
  order: 4,
}

export default function StackPage() {
  return ComponentPage(meta, {
    playground: (() =>
      Stack(
        html.div(
          attr.class(
            'p-3 rounded bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium'
          ),
          'First item'
        ),
        html.div(
          attr.class(
            'p-3 rounded bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium'
          ),
          'Second item'
        ),
        html.div(
          attr.class(
            'p-3 rounded bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium'
          ),
          'Third item'
        )
      ))(),
    sections: [
      Section(
        'Basic Stack',
        () =>
          Stack(
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Stack arranges children vertically with uniform spacing.'
            ),
            Button({ variant: 'filled', color: 'primary' }, 'Primary Action'),
            Button({ variant: 'outline' }, 'Secondary Action')
          ),
        'Children are stacked vertically using the bc-stack CSS class.'
      ),
      Section(
        'With Cards',
        () =>
          Stack(
            Card(
              {},
              html.h3(attr.class('font-semibold mb-1'), 'Card One'),
              html.p(
                attr.class('text-sm text-gray-500'),
                'First card in the stack.'
              )
            ),
            Card(
              {},
              html.h3(attr.class('font-semibold mb-1'), 'Card Two'),
              html.p(
                attr.class('text-sm text-gray-500'),
                'Second card in the stack.'
              )
            ),
            Card(
              {},
              html.h3(attr.class('font-semibold mb-1'), 'Card Three'),
              html.p(
                attr.class('text-sm text-gray-500'),
                'Third card in the stack.'
              )
            )
          ),
        'Stack is ideal for stacking card components vertically.'
      ),
      Section(
        'Form Layout',
        () =>
          html.div(
            attr.class('max-w-sm'),
            Stack(
              html.div(
                html.label(
                  attr.class(
                    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  ),
                  'Full Name'
                ),
                html.input(
                  attr.type('text'),
                  attr.placeholder('John Doe'),
                  attr.class(
                    'w-full px-3 py-2 border rounded-md text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  )
                )
              ),
              html.div(
                html.label(
                  attr.class(
                    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  ),
                  'Email'
                ),
                html.input(
                  attr.type('email'),
                  attr.placeholder('john@example.com'),
                  attr.class(
                    'w-full px-3 py-2 border rounded-md text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  )
                )
              ),
              Button({ variant: 'filled', color: 'primary', fullWidth: true }, 'Submit')
            )
          ),
        'Stack is perfect for vertically-oriented form layouts.'
      ),
    ],
  })
}
