import { ControlSize, InputWrapper, SegmentedInput } from '@tempots/beatui'
import { Signal } from '@tempots/dom'

export function ControlSizeSelector({
  size,
  onChange,
  label,
}: {
  size: Signal<ControlSize>
  onChange?: (value: ControlSize) => void
  label?: string
}) {
  return InputWrapper({
    label,
    content: SegmentedInput({
      size: 'sm',
      options: {
        xs: 'XS',
        sm: 'SM',
        md: 'MD',
        lg: 'LG',
        xl: 'XL',
      },
      value: size,
      onChange,
    }),
  })
}
