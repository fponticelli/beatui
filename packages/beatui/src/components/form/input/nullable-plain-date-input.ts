import { PlainDate } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

export const NullablePlainDateInput = createNullableTemporalInput<PlainDate>({
  inputType: 'date',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainDate.from(v),
})
