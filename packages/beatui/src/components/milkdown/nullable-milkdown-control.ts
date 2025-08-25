import { Value } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { ControlOptions, createNullableControl } from '../form'
import { NullableMilkdownInput } from './nullable-milkdown-input'

export type NullableMilkdownControlOptions = Merge<
  ControlOptions<string | null>,
  {
    rows?: Value<number>
  }
>

export const NullableMilkdownControl = createNullableControl(
  NullableMilkdownInput
)
