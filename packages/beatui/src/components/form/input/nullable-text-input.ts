import { TextInput } from './text-input'
import {
  createNullableStringInput,
  emptyToNull,
  nullToEmpty,
} from './create-nullable-string-input'

// Re-export utility functions for backward compatibility
export { emptyToNull, nullToEmpty }

export const NullableTextInput = createNullableStringInput(TextInput)
