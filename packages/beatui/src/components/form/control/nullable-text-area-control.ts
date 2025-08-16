import { ControlOptions } from './control-options'
import { Value } from '@tempots/dom'
import { NullableTextArea } from '../input/nullable-text-area'
import { Merge } from '@tempots/std'
import { createNullableControl } from './control-factory'

export type NullableTextAreaControlOptions = Merge<
  ControlOptions<string | null>,
  {
    rows?: Value<number>
  }
>

export const NullableTextAreaControl = createNullableControl(NullableTextArea)
