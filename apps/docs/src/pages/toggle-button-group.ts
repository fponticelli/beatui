import {
  ToggleButtonGroup,
  ControlSize,
  ButtonVariant,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  InputWrapper,
  Switch,
  Group,
  Icon,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

const allColors = [
  'primary',
  'red',
  'green',
  'blue',
  'orange',
  'violet',
] as const

export default function ToggleButtonGroupPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)
  const variant = prop<ButtonVariant>('outline')

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Size',
        content: SegmentedInput({
          options: { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' },
          value: size,
          onChange: v => size.set(v),
        }),
      }),
      InputWrapper({
        label: 'Variant (unpressed)',
        content: SegmentedInput({
          options: {
            outline: 'Outline',
            filled: 'Filled',
            light: 'Light',
            dashed: 'Dashed',
            default: 'Default',
            text: 'Text',
          },
          value: variant,
          onChange: v => variant.set(v),
        }),
      }),
      InputWrapper({
        label: 'Disabled',
        content: Switch({
          value: disabled,
          onChange: v => disabled.set(v),
        }),
      })
    ),
    body: Stack(
      attr.class('items-start gap-6 p-4'),

      // Single selection
      html.h3(attr.class('text-lg font-semibold'), 'Single Selection'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Only one item can be active at a time. Clicking the active item deselects it.'
      ),
      ...(() => {
        const alignment = prop<string[]>(['center'])
        return [
          ToggleButtonGroup({
            items: [
              {
                key: 'left',
                label: Icon({ icon: 'lucide:align-left', size: size.value }),
              },
              {
                key: 'center',
                label: Icon({ icon: 'lucide:align-center', size: size.value }),
              },
              {
                key: 'right',
                label: Icon({ icon: 'lucide:align-right', size: size.value }),
              },
              {
                key: 'justify',
                label: Icon({ icon: 'lucide:align-justify', size: size.value }),
              },
            ],
            value: alignment,
            onChange: v => alignment.set(v),
            variant,
            size,
            disabled,
          }),
          html.p(
            attr.class('text-xs text-gray-500 dark:text-gray-400'),
            'Selected: ',
            alignment.map(v => (v.length ? v.join(', ') : '(none)'))
          ),
        ]
      })(),

      // Multiple selection
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Multiple Selection'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Multiple items can be active simultaneously, like a text formatting toolbar.'
      ),
      ...(() => {
        const formats = prop<string[]>(['bold'])
        return [
          ToggleButtonGroup({
            items: [
              { key: 'bold', label: html.strong('B') },
              { key: 'italic', label: html.em('I') },
              {
                key: 'underline',
                label: html.span(attr.class('underline'), 'U'),
              },
              {
                key: 'strikethrough',
                label: html.span(attr.class('line-through'), 'S'),
              },
            ],
            value: formats,
            onChange: v => formats.set(v),
            multiple: true,
            variant,
            size,
            disabled,
          }),
          html.p(
            attr.class('text-xs text-gray-500 dark:text-gray-400'),
            'Selected: ',
            formats.map(v => (v.length ? v.join(', ') : '(none)'))
          ),
        ]
      })(),

      // Vertical orientation
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Vertical Orientation'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Buttons stacked vertically with connected borders.'
      ),
      ...(() => {
        const view = prop<string[]>(['list'])
        return [
          ToggleButtonGroup({
            items: [
              {
                key: 'list',
                label: Group(
                  attr.class('gap-1'),
                  Icon({ icon: 'lucide:list', size: size.value }),
                  'List'
                ),
              },
              {
                key: 'grid',
                label: Group(
                  attr.class('gap-1'),
                  Icon({ icon: 'lucide:layout-grid', size: size.value }),
                  'Grid'
                ),
              },
              {
                key: 'kanban',
                label: Group(
                  attr.class('gap-1'),
                  Icon({ icon: 'lucide:columns-3', size: size.value }),
                  'Kanban'
                ),
              },
            ],
            value: view,
            onChange: v => view.set(v),
            orientation: 'vertical',
            variant,
            size,
            disabled,
          }),
        ]
      })(),

      // Colors
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Colors'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'The pressed state uses the specified theme color.'
      ),
      Stack(
        attr.class('gap-3'),
        ...allColors.map(color => {
          const selected = prop<string[]>(['b'])
          return Group(
            attr.class('gap-3 items-center'),
            html.span(attr.class('text-sm w-16'), color),
            ToggleButtonGroup({
              items: [
                { key: 'a', label: 'A' },
                { key: 'b', label: 'B' },
                { key: 'c', label: 'C' },
              ],
              value: selected,
              onChange: v => selected.set(v),
              color,
              variant,
              size,
              disabled,
            })
          )
        })
      ),

      // Roundedness
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Roundedness'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'The outer corners of the group can use any radius preset.'
      ),
      Stack(
        attr.class('gap-3'),
        ...(['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map(r => {
          const selected = prop<string[]>(['b'])
          return Group(
            attr.class('gap-3 items-center'),
            html.span(attr.class('text-sm w-12 font-mono'), r),
            ToggleButtonGroup({
              items: [
                { key: 'a', label: 'A' },
                { key: 'b', label: 'B' },
                { key: 'c', label: 'C' },
              ],
              value: selected,
              onChange: v => selected.set(v),
              roundedness: r,
              variant,
              size,
              disabled,
            })
          )
        })
      ),

      // Disabled items
      html.h3(
        attr.class('text-lg font-semibold mt-4'),
        'Individual Disabled Items'
      ),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Specific items within the group can be disabled independently.'
      ),
      ...(() => {
        const selected = prop<string[]>(['a'])
        return [
          ToggleButtonGroup({
            items: [
              { key: 'a', label: 'Enabled' },
              { key: 'b', label: 'Disabled', disabled: true },
              { key: 'c', label: 'Enabled' },
            ],
            value: selected,
            onChange: v => selected.set(v),
            variant,
            size,
          }),
        ]
      })()
    ),
  })
}
