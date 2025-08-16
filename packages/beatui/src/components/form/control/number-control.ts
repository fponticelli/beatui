import { ControlOptions } from './control-options'
import { Merge } from '@tempots/std'
import { Value } from '@tempots/dom'
import { NumberInput } from '../input/number-input'
import { createControl } from './control-factory'

export type NumberControlOptions = Merge<
  ControlOptions<number>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

export const NumberControl = createControl(NumberInput)
