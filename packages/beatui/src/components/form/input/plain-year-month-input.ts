import { PlainYearMonth } from '../../../temporal'
import { createTemporalInput } from './create-temporal-input'

export const PlainYearMonthInput = createTemporalInput<PlainYearMonth>({
  inputType: 'month',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainYearMonth.from(v),
})
