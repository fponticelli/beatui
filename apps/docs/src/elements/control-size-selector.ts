import { ControlSize, SegmentedInput } from '@tempots/beatui'
import { Prop } from '@tempots/dom'

export function ControlSizeSelector({
  size,
  onChange,
}: {
  size: Prop<ControlSize>
  onChange?: (value: ControlSize) => void
}) {
  return SegmentedInput({
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
  })
}
