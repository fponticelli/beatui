import { PlainYearMonth } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

export const NullablePlainYearMonthInput =
  createNullableTemporalInput<PlainYearMonth>({
    inputType: 'month',
    valueToString: v => v.toString(),
    parseValue: (T, v) => T.PlainYearMonth.from(v),
  })
