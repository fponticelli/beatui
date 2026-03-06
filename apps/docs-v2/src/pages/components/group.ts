import { Group, Button, Badge } from '@tempots/beatui'
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

export default function GroupPage() {
  return ComponentPage(meta, {
    playground: (() =>
      Group(
        html.div(
          attr.class(
            'p-3 rounded bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium'
          ),
          'First'
        ),
        html.div(
          attr.class(
            'p-3 rounded bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium'
          ),
          'Second'
        ),
        html.div(
          attr.class(
            'p-3 rounded bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium'
          ),
          'Third'
        )
      ))(),
    sections: [
      Section(
        'Button Group',
        () =>
          Group(
            Button({ variant: 'outline' }, 'Cancel'),
            Button({ variant: 'filled', color: 'primary' }, 'Save')
          ),
        'Group is commonly used to lay out action buttons in a row.'
      ),
      Section(
        'Inline Items',
        () =>
          Group(
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
