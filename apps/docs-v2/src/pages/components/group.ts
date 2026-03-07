import { Group, Button, Badge, Gap, Justify, Wrap } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Group',
  category: 'Layout',
  component: 'Group',
  description:
    'Horizontal group layout that arranges children in a row with consistent spacing using flexbox.',
  icon: 'lucide:columns-3',
  order: 5,
}

const itemClass =
  'p-3 rounded border border-gray-200 dark:border-gray-700 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium'

export default function GroupPage() {
  return ComponentPage(meta, {
    playground: (() =>
      Group(
        Gap('md'),
        html.div(attr.class(itemClass), 'First'),
        html.div(attr.class(itemClass), 'Second'),
        html.div(attr.class(itemClass), 'Third')
      ))(),
    sections: [
      Section(
        'Gap Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-6'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  `Gap('${size}')`
                ),
                Group(
                  Gap(size),
                  html.div(attr.class(itemClass), 'A'),
                  html.div(attr.class(itemClass), 'B'),
                  html.div(attr.class(itemClass), 'C')
                )
              )
            )
          ),
        'Control spacing between items with Gap().'
      ),
      Section(
        'Justify Content',
        () =>
          html.div(
            attr.class('flex flex-col gap-6'),
            ...(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map(
              justify =>
                html.div(
                  html.div(
                    attr.class('text-xs font-mono text-gray-500 mb-1'),
                    `Justify('${justify}')`
                  ),
                  html.div(
                    attr.class('border rounded-lg border-gray-200 dark:border-gray-700 p-2'),
                    Group(
                      Justify(justify),
                      html.div(attr.class(itemClass), 'A'),
                      html.div(attr.class(itemClass), 'B'),
                      html.div(attr.class(itemClass), 'C')
                    )
                  )
                )
            )
          ),
        'Control distribution along the main axis with Justify().'
      ),
      Section(
        'Wrap',
        () =>
          html.div(
            attr.class('max-w-xs border rounded-lg border-gray-200 dark:border-gray-700 p-2'),
            Group(
              Gap('sm'),
              Wrap,
              ...Array.from({ length: 8 }, (_, i) =>
                html.div(attr.class(itemClass), `Item ${i + 1}`)
              )
            )
          ),
        'Use Wrap to allow items to flow to the next line.'
      ),
      Section(
        'Button Group',
        () =>
          Group(
            Gap('sm'),
            Button({ variant: 'outline' }, 'Cancel'),
            Button({ variant: 'filled', color: 'primary' }, 'Save')
          ),
        'Group is commonly used to lay out action buttons in a row.'
      ),
      Section(
        'Inline Items',
        () =>
          Group(
            Gap('sm'),
            html.span(
              attr.class('text-sm font-medium text-gray-700 dark:text-gray-300'),
              'Status:'
            ),
            Badge({ color: 'success' }, 'Active'),
            Badge({ color: 'info' }, 'Verified')
          ),
        'Group aligns inline elements like labels and badges horizontally.'
      ),
      Section(
        'Toolbar-style Layout',
        () =>
          html.div(
            attr.class(
              'p-3 border rounded-lg border-gray-200 dark:border-gray-700'
            ),
            Group(
              Gap('xs'),
              Button({ variant: 'light', size: 'sm', color: 'base' }, 'Bold'),
              Button({ variant: 'light', size: 'sm', color: 'base' }, 'Italic'),
              Button(
                { variant: 'light', size: 'sm', color: 'base' },
                'Underline'
              ),
              html.div(
                attr.class(
                  'w-px self-stretch bg-gray-200 dark:bg-gray-700 mx-1'
                )
              ),
              Button({ variant: 'light', size: 'sm', color: 'base' }, 'Left'),
              Button(
                { variant: 'light', size: 'sm', color: 'base' },
                'Center'
              ),
              Button({ variant: 'light', size: 'sm', color: 'base' }, 'Right')
            )
          ),
        'Group works well for toolbar and control bar patterns.'
      ),
      Section(
        'Mixed Content',
        () =>
          Group(
            Gap('sm'),
            html.div(
              attr.class(
                'w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold'
              ),
              'JD'
            ),
            html.div(
              html.p(attr.class('text-sm font-medium'), 'Jane Doe'),
              html.p(
                attr.class('text-xs text-gray-500 dark:text-gray-400'),
                'Administrator'
              )
            )
          ),
        'Group can combine avatars, text, and other elements in a row.'
      ),
    ],
  })
}
