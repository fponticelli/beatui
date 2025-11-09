import { PlainDate } from '../../../temporal'
import { createTemporalInput } from './create-temporal-input'

export const PlainDateInput = createTemporalInput<PlainDate>({
  inputType: 'date',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainDate.from(v),
})
