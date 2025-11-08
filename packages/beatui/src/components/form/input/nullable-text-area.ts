import { Value } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { TextArea, TextAreaOptions } from './text-area'
import { createNullableStringInput } from './create-nullable-string-input'

export type NullableTextAreaOptions = Merge<
  Omit<TextAreaOptions, 'value' | 'onChange' | 'onInput'>,
  {
    value: Value<null | string>
    onChange?: (value: null | string) => void
    onInput?: (value: null | string) => void
  }
>

export const NullableTextArea = createNullableStringInput(
  TextArea
) as unknown as (
  options: NullableTextAreaOptions
) => ReturnType<typeof TextArea>
