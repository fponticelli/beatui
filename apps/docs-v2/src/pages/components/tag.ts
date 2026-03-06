import { Tag } from '@tempots/beatui'
import { html, attr, prop, MapSignal, on } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Tag',
  category: 'Data Display',
  component: 'Tag',
  description:
    'A small pill-shaped label for categorization, filtering, or displaying metadata. Supports optional removal.',
  icon: 'lucide:tag',
  order: 8,
}

export default function TagPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('flex flex-wrap gap-2 items-center'),
      Tag({ value: 'TypeScript', color: 'primary' }),
      Tag({ value: 'React', color: 'info' }),
      Tag({ value: 'Design System', color: 'secondary' }),
      Tag({ value: 'Accessible', color: 'success' })
    ),
    sections: [
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2 items-center'),
            Tag({ value: 'Base', color: 'base' }),
            Tag({ value: 'Primary', color: 'primary' }),
            Tag({ value: 'Secondary', color: 'secondary' }),
            Tag({ value: 'Success', color: 'success' }),
            Tag({ value: 'Warning', color: 'warning' }),
            Tag({ value: 'Danger', color: 'danger' }),
            Tag({ value: 'Info', color: 'info' })
          ),
        'Tags automatically adapt to light and dark themes using CSS custom properties.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2 items-center'),
            Tag({ value: 'Extra Small', size: 'xs' }),
            Tag({ value: 'Small', size: 'sm' }),
            Tag({ value: 'Medium', size: 'md' }),
            Tag({ value: 'Large', size: 'lg' }),
            Tag({ value: 'Extra Large', size: 'xl' })
          ),
        'Tags scale across five sizes: xs, sm, md (default), lg, and xl.'
      ),
      Section(
        'Removable Tags',
        () => {
          const tags = prop(['React', 'Vue', 'Solid', 'Svelte', 'Angular'])
          return html.div(
            attr.class('flex flex-wrap gap-2 items-center min-h-[32px]'),
            MapSignal(tags, items =>
              html.div(
                attr.class('flex flex-wrap gap-2 items-center'),
                ...items.map(item =>
                  Tag({
                    value: item,
                    color: 'primary',
                    onClose: v => tags.set(tags.value.filter(t => t !== v)),
                  })
                )
              )
            )
          )
        },
        'When onClose is provided, a close button appears. Click the X to remove a tag.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2 items-center'),
            Tag({ value: 'Disabled', color: 'base', disabled: true }),
            Tag({ value: 'Disabled Primary', color: 'primary', disabled: true }),
            Tag({
              value: 'Disabled with Close',
              color: 'danger',
              disabled: true,
              onClose: () => {},
            })
          ),
        'Disabled tags and their close buttons cannot be interacted with.'
      ),
      Section(
        'Reactive Value',
        () => {
          const label = prop('Dynamic Tag')
          return html.div(
            attr.class('flex flex-col gap-3'),
            Tag({ value: label, color: 'info' }),
            html.div(
              attr.class('flex gap-2'),
              html.button(
                attr.class(
                  'px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                ),
                attr.type('button'),
                on.click(() => label.set('Updated')),
                html.span('Rename to "Updated"')
              ),
              html.button(
                attr.class(
                  'px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                ),
                attr.type('button'),
                on.click(() => label.set('Dynamic Tag')),
                html.span('Rename to "Dynamic Tag"')
              )
            )
          )
        },
        'The value prop is reactive — updating the signal updates the tag label without re-mounting.'
      ),
    ],
  })
}
