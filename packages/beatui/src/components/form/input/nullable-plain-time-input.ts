import { PlainTime } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

export const NullablePlainTimeInput = createNullableTemporalInput<PlainTime>({
  inputType: 'time',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainTime.from(v),
})
