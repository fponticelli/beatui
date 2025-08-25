import { NullablePasswordInput } from '../input/nullable-password-input'
import { createNullableControl } from './control-factory'

export const NullablePasswordControl = createNullableControl(
  NullablePasswordInput
)
