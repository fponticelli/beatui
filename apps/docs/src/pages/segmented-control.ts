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
      attr.class('items-center gap-4 p-4 h-full overflow-hidden'),

      // Pill vs Squared comparison
      html.h3(attr.class('text-lg font-semibold'), 'Pill vs Squared'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'The squared variant uses control-like border-radius and matches TextInput height.'
      ),
      Group(
        attr.class('items-end gap-4 flex-wrap'),
        InputWrapper({
          label: 'Pill (default)',
          content: SegmentedInput({
            options,
            value: valuePill,
            onChange: valuePill.set,
            disabled,
          }),
        }),
        InputWrapper({
          label: 'Squared',
          content: SegmentedInput({
            options,
            variant: 'squared',
            value: valueSquared,
            onChange: valueSquared.set,
            disabled,
          }),
        }),
        InputWrapper({
          label: 'TextInput (for height comparison)',
          content: TextInput({
            value: textValue,
            placeholder: 'Same height?',
            onChange: textValue.set,
          }),
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
                  onChange: value.set,
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
                  onChange: value.set,
                })
              )
            )
          )
        )
      )
    ),
  })
}
