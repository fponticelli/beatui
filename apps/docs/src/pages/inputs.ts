import {
  Stack,
  ScrollablePanel,
  InputWrapper,
  WithTemporal,
  WithBeatUIElementBreakpoint,
} from '@tempots/beatui'
import { prop, attr, html, TNode } from '@tempots/dom'
import {
  AppearanceSelector,
  Base64Input,
  Base64sInput,
  CheckboxInput,
  ColorInput,
  DateInput,
  DateTimeInput,
  EmailInput,
  FileInput,
  FilesInput,
  NumberInput,
  PasswordInput,
  TagsInput,
  TextArea,
  TextInput,
  UUIDInput,
  NullableUUIDInput,
  NullableDateInput,
  NullableDateTimeInput,
  NullableEmailInput,
  NullablePasswordInput,
  NullableTextArea,
  NullableTextInput,
  PlainDateInput,
  NullablePlainDateInput,
  PlainTimeInput,
  NullablePlainTimeInput,
  PlainDateTimeInput,
  NullablePlainDateTimeInput,
  InstantInput,
  NullableInstantInput,
  ZonedDateTimeInput,
  NullableZonedDateTimeInput,
  PlainYearMonthInput,
  NullablePlainYearMonthInput,
  PlainMonthDayInput,
  NullablePlainMonthDayInput,
  DurationInput,
  NullableDurationInput,
  // Added inputs that require extra minimal props
  ComboboxInput,
  ComboboxOption,
  NativeSelect,
  SelectOption,
  LazyNativeSelect,
  MaskInput,
  NullableMaskInput,
  EditableText,
  Switch,
  ListInput,
  useController,
} from '@tempots/beatui'

export const InputsPage = () =>
  WithTemporal(T => {
    // Simple input values
    const appearance = prop<'system' | 'light' | 'dark'>('system')
    const base64 = prop<string | undefined>(undefined)
    const base64s = prop<string[]>([])
    const checkbox = prop(false)
    const color = prop('#3b82f6')
    const date = prop(new Date())
    const dateTime = prop(new Date())
    const email = prop('')
    const file = prop<File | undefined>(undefined)
    const files = prop<File[]>([])
    const number = prop(0)
    const password = prop('')
    const tags = prop<string[]>([])
    const textAreaVal = prop('')
    const textVal = prop('')
    const uuid = prop('')
    const nullableUuid = prop<string | null>(null)
    const nullableDate = prop<Date | null>(null)
    const nullableDateTime = prop<Date | null>(null)
    const nullableEmail = prop<string | null>(null)
    const nullablePassword = prop<string | null>(null)
    const nullableTextAreaVal = prop<string | null>(null)
    const nullableTextVal = prop<string | null>(null)

    // Inputs that need minimal extra props beyond value
    const comboboxValue = prop('apple')
    const comboboxOptions = prop<
      import('@tempots/beatui').ComboboxOption<string>[]
    >([
      ComboboxOption.value('apple', 'Apple'),
      ComboboxOption.value('banana', 'Banana'),
    ])

    const nativeSelectValue = prop('one')
    const nativeSelectOptions = prop<
      import('@tempots/beatui').SelectOption<string>[]
    >([SelectOption.value('one', 'One'), SelectOption.value('two', 'Two')])

    const lazySelectValue = prop('a')
    const lazySelectRequest = prop({ q: 'x' })

    const maskVal = prop('')
    const nullableMaskVal = prop<string | null>(null)

    const editableTextVal = prop('')
    const switchVal = prop(false)

    const listInitial = prop(['a', 'b'])

    // Temporal values
    const plainDate = prop(T.PlainDate.from('2023-01-01'))
    const nullablePlainDate = prop<InstanceType<
      (typeof T)['PlainDate']
    > | null>(null)
    const plainTime = prop(T.PlainTime.from('12:00'))
    const nullablePlainTime = prop<InstanceType<
      (typeof T)['PlainTime']
    > | null>(null)
    const plainDateTime = prop(T.PlainDateTime.from('2023-01-01T12:00'))
    const nullablePlainDateTime = prop<InstanceType<
      (typeof T)['PlainDateTime']
    > | null>(null)
    const instant = prop(T.Instant.from('2023-01-01T00:00:00Z'))
    const nullableInstant = prop<InstanceType<(typeof T)['Instant']> | null>(
      null
    )
    const zonedDateTime = prop(
      T.ZonedDateTime.from('2023-01-01T00:00:00Z[UTC]')
    )
    const nullableZonedDateTime = prop<InstanceType<
      (typeof T)['ZonedDateTime']
    > | null>(null)
    const plainYearMonth = prop(T.PlainYearMonth.from('2023-01'))
    const nullablePlainYearMonth = prop<InstanceType<
      (typeof T)['PlainYearMonth']
    > | null>(null)
    const plainMonthDay = prop(T.PlainMonthDay.from('--01-01'))
    const nullablePlainMonthDay = prop<InstanceType<
      (typeof T)['PlainMonthDay']
    > | null>(null)
    const duration = prop(T.Duration.from('P0DT0H0M0S'))
    const nullableDuration = prop<InstanceType<(typeof T)['Duration']> | null>(
      null
    )
    // Responsive columns helper (1–3 cols based on container width)
    const Columns = (...children: TNode[]) =>
      WithBeatUIElementBreakpoint(({ value }) =>
        html.div(
          attr.style(
            value.map(({ width }) => {
              const cols = width >= 640 ? 3 : width >= 448 ? 2 : 1
              return `display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:1rem;`
            })
          ),
          ...children
        )
      )

    return ScrollablePanel({
      body: Stack(
        attr.class('bu-p-4 bu-gap-4'),

        // Simple inputs that only need a value
        html.h2(
          attr.style(
            'margin: 1rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;'
          ),
          'Basics'
        ),
        Columns(
          InputWrapper({
            label: 'AppearanceSelector',
            content: AppearanceSelector({
              value: appearance,
              onChange: appearance.set,
            }),
          }),
          InputWrapper({
            label: 'Base64Input',
            content: Base64Input({ value: base64, onChange: base64.set }),
          }),
          InputWrapper({
            label: 'Base64sInput',
            content: Base64sInput({ value: base64s, onChange: base64s.set }),
          }),
          InputWrapper({
            label: 'CheckboxInput',
            content: CheckboxInput({ value: checkbox, onChange: checkbox.set }),
          }),
          InputWrapper({
            label: 'ColorInput',
            content: ColorInput({ value: color, onChange: color.set }),
          }),
          InputWrapper({
            label: 'DateInput',
            content: DateInput({ value: date, onChange: date.set }),
          }),
          InputWrapper({
            label: 'DateTimeInput',
            content: DateTimeInput({ value: dateTime, onChange: dateTime.set }),
          }),
          InputWrapper({
            label: 'EmailInput',
            content: EmailInput({ value: email, onChange: email.set }),
          }),
          InputWrapper({
            label: 'FileInput',
            content: FileInput({ value: file, onChange: file.set }),
          }),
          InputWrapper({
            label: 'FilesInput',
            content: FilesInput({ value: files, onChange: files.set }),
          }),
          InputWrapper({
            label: 'NumberInput',
            content: NumberInput({ value: number, onChange: number.set }),
          }),
          InputWrapper({
            label: 'PasswordInput',
            content: PasswordInput({ value: password, onChange: password.set }),
          }),
          InputWrapper({
            label: 'TagsInput',
            content: TagsInput({ value: tags, onChange: tags.set }),
          }),
          InputWrapper({
            label: 'TextArea',
            content: TextArea({
              value: textAreaVal,
              onChange: textAreaVal.set,
            }),
          }),
          InputWrapper({
            label: 'TextInput',
            content: TextInput({ value: textVal, onChange: textVal.set }),
          }),
          InputWrapper({
            label: 'UUIDInput',
            content: UUIDInput({ value: uuid, onChange: uuid.set }),
          })
        ),
        Columns(
          InputWrapper({
            label: 'NullableUUIDInput',
            content: NullableUUIDInput({
              value: nullableUuid,
              onChange: nullableUuid.set,
            }),
          }),
          InputWrapper({
            label: 'NullableDateInput',
            content: NullableDateInput({
              value: nullableDate,
              onChange: nullableDate.set,
            }),
          }),
          InputWrapper({
            label: 'NullableDateTimeInput',
            content: NullableDateTimeInput({
              value: nullableDateTime,
              onChange: nullableDateTime.set,
            }),
          }),
          InputWrapper({
            label: 'NullableEmailInput',
            content: NullableEmailInput({
              value: nullableEmail,
              onChange: nullableEmail.set,
            }),
          }),
          InputWrapper({
            label: 'NullablePasswordInput',
            content: NullablePasswordInput({
              value: nullablePassword,
              onChange: nullablePassword.set,
            }),
          }),
          InputWrapper({
            label: 'NullableTextArea',
            content: NullableTextArea({
              value: nullableTextAreaVal,
              onChange: nullableTextAreaVal.set,
            }),
          }),
          InputWrapper({
            label: 'NullableTextInput',
            content: NullableTextInput({
              value: nullableTextVal,
              onChange: nullableTextVal.set,
            }),
          })
        ),
        html.h2(
          attr.style(
            'margin: 1rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;'
          ),
          'With options'
        ),
        Columns(
          // Inputs that need minimal extra props beyond value
          InputWrapper({
            label: 'ComboboxInput',
            content: ComboboxInput({
              value: comboboxValue,
              options: comboboxOptions,
              onChange: comboboxValue.set,
            }),
          }),
          InputWrapper({
            label: 'NativeSelect',
            content: NativeSelect({
              value: nativeSelectValue,
              options: nativeSelectOptions,
              onChange: nativeSelectValue.set,
            }),
          }),
          InputWrapper({
            label: 'LazyNativeSelect',
            content: LazyNativeSelect({
              value: lazySelectValue,
              request: lazySelectRequest,
              load: async () => [
                { id: 'a', label: 'A' },
                { id: 'b', label: 'B' },
              ],
              onChange: lazySelectValue.set,
            }),
          }),
          InputWrapper({
            label: 'MaskInput',
            content: MaskInput({
              value: maskVal,
              mask: '999-999',
              onChange: maskVal.set,
            }),
          }),
          InputWrapper({
            label: 'NullableMaskInput',
            content: NullableMaskInput({
              value: nullableMaskVal,
              mask: '999-999',
              onChange: nullableMaskVal.set,
            }),
          }),
          InputWrapper({
            label: 'EditableText',
            content: EditableText({
              value: editableTextVal,
              onChange: editableTextVal.set,
            }),
          }),
          InputWrapper({
            label: 'Switch',
            content: Switch({ value: switchVal, onChange: switchVal.set }),
          }),
          InputWrapper({
            label: 'ListInput',
            content: (() => {
              const { controller } = useController<string[]>({
                initialValue: listInitial,
              })
              const list = controller.array()
              return ListInput(list, ({ item }) =>
                TextInput({ value: item.value, onChange: item.change })
              )
            })(),
          })
        ),
        Columns(
          // Temporal-based inputs
          InputWrapper({
            label: 'PlainDateInput',
            content: PlainDateInput({
              value: plainDate,
              onChange: plainDate.set,
            }),
          }),
          InputWrapper({
            label: 'NullablePlainDateInput',
            content: NullablePlainDateInput({
              value: nullablePlainDate,
              onChange: v => nullablePlainDate.set(v),
            }),
          }),
          InputWrapper({
            label: 'PlainTimeInput',
            content: PlainTimeInput({
              value: plainTime,
              onChange: plainTime.set,
            }),
          }),
          InputWrapper({
            label: 'NullablePlainTimeInput',
            content: NullablePlainTimeInput({
              value: nullablePlainTime,
              onChange: v => nullablePlainTime.set(v),
            }),
          }),
          InputWrapper({
            label: 'PlainDateTimeInput',
            content: PlainDateTimeInput({
              value: plainDateTime,
              onChange: plainDateTime.set,
            }),
          }),
          InputWrapper({
            label: 'NullablePlainDateTimeInput',
            content: NullablePlainDateTimeInput({
              value: nullablePlainDateTime,
              onChange: v => nullablePlainDateTime.set(v),
            }),
          }),
          InputWrapper({
            label: 'InstantInput',
            content: InstantInput({ value: instant, onChange: instant.set }),
          }),
          InputWrapper({
            label: 'NullableInstantInput',
            content: NullableInstantInput({
              value: nullableInstant,
              onChange: v => nullableInstant.set(v),
            }),
          }),
          InputWrapper({
            label: 'ZonedDateTimeInput',
            content: ZonedDateTimeInput({
              value: zonedDateTime,
              onChange: zonedDateTime.set,
            }),
          }),
          InputWrapper({
            label: 'NullableZonedDateTimeInput',
            content: NullableZonedDateTimeInput({
              value: nullableZonedDateTime,
              onChange: v => nullableZonedDateTime.set(v),
            }),
          }),
          InputWrapper({
            label: 'PlainYearMonthInput',
            content: PlainYearMonthInput({
              value: plainYearMonth,
              onChange: plainYearMonth.set,
            }),
          }),
          InputWrapper({
            label: 'NullablePlainYearMonthInput',
            content: NullablePlainYearMonthInput({
              value: nullablePlainYearMonth,
              onChange: v => nullablePlainYearMonth.set(v),
            }),
          }),
          InputWrapper({
            label: 'PlainMonthDayInput',
            content: PlainMonthDayInput({
              value: plainMonthDay,
              onChange: plainMonthDay.set,
            }),
          }),
          InputWrapper({
            label: 'NullablePlainMonthDayInput',
            content: NullablePlainMonthDayInput({
              value: nullablePlainMonthDay,
              onChange: v => nullablePlainMonthDay.set(v),
            }),
          }),
          InputWrapper({
            label: 'DurationInput',
            content: DurationInput({ value: duration, onChange: duration.set }),
          }),
          InputWrapper({
            label: 'NullableDurationInput',
            content: NullableDurationInput({
              value: nullableDuration,
              onChange: v => nullableDuration.set(v),
            }),
          })
        )
      ),
    })
  })
