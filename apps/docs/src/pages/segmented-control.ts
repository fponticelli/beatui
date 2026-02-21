import {
  ControlSize,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  TextInput,
  InputWrapper,
  Group,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colorOptions = [
  undefined,
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const

export default function SegmentedControlPage() {
  const disabled = prop(false)
  const options = {
    first: 'First',
    second: 'Second',
    third: 'Third',
  }
  const value = prop<keyof typeof options>('second')
  const valuePill = prop<keyof typeof options>('first')
  const valueSquared = prop<keyof typeof options>('first')
  const textValue = prop('')

  return ScrollablePanel({
    header: ControlsHeader(DisabledSelector({ disabled })),
    body: Stack(
      attr.class('items-center gap-4 p-4'),

      // Pill vs Squared comparison
      html.h3(attr.class('text-lg font-semibold'), 'Pill vs Squared'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'The squared variant uses control-like border-radius and matches TextInput height.'
      ),
      Group(
        attr.class('items-end gap-4 flex-wrap'),
        InputWrapper({
          label: 'Pill (default)',
          content: SegmentedInput({
            options,
            value: valuePill,
            onChange: v => valuePill.set(v),
            disabled,
          }),
        }),
        InputWrapper({
          label: 'Squared',
          content: SegmentedInput({
            options,
            variant: 'squared',
            value: valueSquared,
            onChange: v => valueSquared.set(v),
            disabled,
          }),
        }),
        InputWrapper({
          label: 'TextInput (for height comparison)',
          content: TextInput({
            value: textValue,
            placeholder: 'Same height?',
            onChange: v => textValue.set(v),
          }),
        })
      ),

      // Color variations
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Color Variations'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'The color option applies solid button-style coloring to the active indicator.'
      ),
      Stack(
        attr.class('gap-3 items-center'),
        ...colorOptions.map(color => {
          const v = prop<keyof typeof options>('first')
          return Group(
            attr.class('items-center gap-3'),
            html.span(
              attr.class('text-sm font-medium w-20'),
              color ?? 'default'
            ),
            SegmentedInput({
              options,
              value: v,
              onChange: v => v.set(v),
              disabled,
              color,
            }),
            SegmentedInput({
              options,
              variant: 'squared',
              value: v,
              onChange: v => v.set(v),
              disabled,
              color,
            })
          )
        })
      ),

      // Size variations
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Size Variations'),
      html.table(
        attr.class('w-full border-collapse'),
        html.thead(
          html.tr(
            html.th(attr.class('border p-2 text-left'), 'Size'),
            html.th(attr.class('border p-2 text-left'), 'Pill'),
            html.th(attr.class('border p-2 text-left'), 'Squared')
          )
        ),
        html.tbody(
          ...allSizes.map(currentSize =>
            html.tr(
              html.th(attr.class('border p-2'), currentSize),
              html.td(
                attr.class('border p-2'),
                SegmentedInput({
                  options,
                  size: currentSize,
                  disabled,
                  value,
                  onChange: v => value.set(v),
                })
              ),
              html.td(
                attr.class('border p-2'),
                SegmentedInput({
                  options,
                  size: currentSize,
                  variant: 'squared',
                  disabled,
                  value,
                  onChange: v => value.set(v),
                })
              )
            )
          )
        )
      )
    ),
  })
}
