import { ControlOptions } from './control-options'
import { Value } from '@tempots/dom'
import { TextArea } from '../input/text-area'
import { Merge } from '@tempots/std'
import { createControl } from './control-factory'

export type TextAreaControlOptions = Merge<
  ControlOptions<string>,
  {
    rows?: Value<number>
  }
>

export const TextAreaControl = createControl(TextArea)
