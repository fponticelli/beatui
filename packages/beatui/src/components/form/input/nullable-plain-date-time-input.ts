import { PlainDateTime } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

export const NullablePlainDateTimeInput =
  createNullableTemporalInput<PlainDateTime>({
    inputType: 'datetime-local',
    valueToString: v => v.toJSON(),
    parseValue: (T, v) => T.PlainDateTime.from(v),
  })
