import { ToggleButtonGroup, Icon } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ToggleButtonGroup',
  category: 'Buttons',
  component: 'ToggleButtonGroup',
  description:
    'A group of connected toggle buttons supporting single or multiple selection with shared borders and coordinated styling.',
  icon: 'lucide:group',
  order: 8,
}

export default function ToggleButtonGroupPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('ToggleButtonGroup', _signals => {
      const value = prop<string[]>(['left'])
      return ToggleButtonGroup({
        items: [
          { key: 'left', label: 'Left' },
          { key: 'center', label: 'Center' },
          { key: 'right', label: 'Right' },
        ],
        value,
        onChange: v => value.set(v),
      })
    }),
    sections: [
      Section(
        'Single Selection',
        () => {
          const alignment = prop<string[]>(['left'])
          return html.div(
            attr.class('flex flex-col items-start gap-3'),
            ToggleButtonGroup({
              items: [
                { key: 'left', label: 'Left' },
                { key: 'center', label: 'Center' },
                { key: 'right', label: 'Right' },
                { key: 'justify', label: 'Justify' },
              ],
              value: alignment,
              onChange: v => alignment.set(v),
            })
          )
        },
        'In single-selection mode (default), selecting a button deselects all others.'
      ),
      Section(
        'Multiple Selection',
        () => {
          const formats = prop<string[]>([])
          return ToggleButtonGroup({
            items: [
              {
                key: 'bold',
                label: Icon({ icon: 'lucide:bold', size: 'sm', accessibility: 'decorative' }),
              },
              {
                key: 'italic',
                label: Icon({ icon: 'lucide:italic', size: 'sm', accessibility: 'decorative' }),
              },
              {
                key: 'underline',
                label: Icon({ icon: 'lucide:underline', size: 'sm', accessibility: 'decorative' }),
              },
              {
                key: 'strikethrough',
                label: Icon({ icon: 'lucide:strikethrough', size: 'sm', accessibility: 'decorative' }),
              },
            ],
            value: formats,
            onChange: v => formats.set(v),
            multiple: true,
          })
        },
        'Set multiple to true to allow any combination of buttons to be active simultaneously.'
      ),
      Section(
        'Icon Buttons',
        () => {
          const view = prop<string[]>(['grid'])
          return ToggleButtonGroup({
            items: [
              {
                key: 'grid',
                label: Icon({ icon: 'lucide:layout-grid', size: 'sm', accessibility: 'decorative' }),
              },
              {
                key: 'list',
                label: Icon({ icon: 'lucide:list', size: 'sm', accessibility: 'decorative' }),
              },
              {
                key: 'columns',
                label: Icon({ icon: 'lucide:columns-3', size: 'sm', accessibility: 'decorative' }),
              },
            ],
            value: view,
            onChange: v => view.set(v),
          })
        },
        'Items accept any TNode as their label, including Icon components.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col items-start gap-4'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const val = prop<string[]>(['a'])
              return html.div(
                attr.class('flex items-center gap-3'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400 w-6'),
                  size
                ),
                ToggleButtonGroup({
                  items: [
                    { key: 'a', label: 'Option A' },
                    { key: 'b', label: 'Option B' },
                    { key: 'c', label: 'Option C' },
                  ],
                  value: val,
                  onChange: v => val.set(v),
                  size,
                })
              )
            })
          ),
        'Five sizes are available to match the surrounding layout density.'
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-col items-start gap-4'),
            ...(['filled', 'outline', 'light', 'default'] as const).map(variant => {
              const val = prop<string[]>(['yes'])
              return html.div(
                attr.class('flex items-center gap-3'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400 w-16'),
                  variant
                ),
                ToggleButtonGroup({
                  items: [
                    { key: 'yes', label: 'Yes' },
                    { key: 'no', label: 'No' },
                    { key: 'maybe', label: 'Maybe' },
                  ],
                  value: val,
                  onChange: v => val.set(v),
                  variant,
                })
              )
            })
          ),
        'All standard button variants are supported and applied uniformly across the group.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col items-start gap-4'),
            ...(
              ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const
            ).map(color => {
              const val = prop<string[]>(['1'])
              return html.div(
                attr.class('flex items-center gap-3'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400 w-20'),
                  color
                ),
                ToggleButtonGroup({
                  items: [
                    { key: '1', label: 'One' },
                    { key: '2', label: 'Two' },
                    { key: '3', label: 'Three' },
                  ],
                  value: val,
                  onChange: v => val.set(v),
                  color,
                })
              )
            })
          ),
        'The color prop controls the pressed state highlight color.'
      ),
      Section(
        'Vertical Orientation',
        () => {
          const value = prop<string[]>(['option1'])
          return ToggleButtonGroup({
            items: [
              { key: 'option1', label: 'Option 1' },
              { key: 'option2', label: 'Option 2' },
              { key: 'option3', label: 'Option 3' },
            ],
            value,
            onChange: v => value.set(v),
            orientation: 'vertical',
          })
        },
        'Set orientation to "vertical" to stack the buttons column-wise.'
      ),
      Section(
        'Disabled State',
        () =>
          html.div(
            attr.class('flex flex-col items-start gap-4'),
            ToggleButtonGroup({
              items: [
                { key: 'a', label: 'All Disabled' },
                { key: 'b', label: 'Option B' },
                { key: 'c', label: 'Option C' },
              ],
              value: prop<string[]>(['a']),
              disabled: true,
            }),
            ToggleButtonGroup({
              items: [
                { key: 'x', label: 'Enabled' },
                { key: 'y', label: 'Item Disabled', disabled: true },
                { key: 'z', label: 'Enabled' },
              ],
              value: prop<string[]>(['x']),
            })
          ),
        'The entire group can be disabled, or individual items can be disabled independently.'
      ),
    ],
  })
}
