import { UUIDInput } from './uuid-input'
import { createNullableStringInput } from './create-nullable-string-input'

export const NullableUUIDInput = createNullableStringInput(UUIDInput)
