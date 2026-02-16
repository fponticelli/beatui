import { prop, attr, html, TNode, Prop, When } from '@tempots/dom'
import {
  Stack,
  ScrollablePanel,
  InputWrapper,
  InputAdornment,
  InputContainer,
  ListItemControls,
  WithTemporal,
  WithBeatUIElementBreakpoint,
  RatingInput,
  Group,
  AppearanceSelector,
  Base64Input,
  Base64sInput,
  CheckboxInput,
  ColorSwatchInput,
  DateInput,
  DateTimeInput,
  EmailInput,
  FileInput,
  FilesInput,
  NumberInput,
  NullableNumberInput,
  BigintInput,
  NullableBigintInput,
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
  NullableRatingInput,
  // Added inputs that require extra minimal options
  DropdownInput,
  NativeSelect,
  LazyNativeSelect,
  MaskInput,
  NullableMaskInput,
  EditableText,
  Switch,
  ListInput,
  useController,
  Option,
  DropdownOption,
  SelectOption,
  // Newly showcased inputs
  UrlInput,
  NullableUrlInput,
  SliderInput,
  NullableSliderInput,
  SegmentedInput,
  SelectTagsInput,
  ComboboxTagsInput,
  ComboboxInput,
} from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

const max = 40
const ellipsis = (s: string) => (s.length > max ? s.slice(0, max) + '...' : s)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function description(value: Prop<any>) {
  return value.map(v => {
    if (v instanceof Date) return v.toISOString()
    if (Array.isArray(v)) return `Array[${v.length}]`
    if (typeof v === 'string') {
      return `"${ellipsis(String(v))}"`
    } else {
      return String(v)
    }
  })
}

export default function InputsPage() {
  return WithTemporal(T => {
    const displayNonNullables = prop(true)
    const disabled = prop(false)

    // Simple input values
    const appearance = prop<'system' | 'light' | 'dark'>('system')
    const base64 = prop<string | undefined>(undefined)
    const base64s = prop<string[]>([])
    const checkbox = prop(false)
    const color = prop('#3b82f6')
    const rating = prop(3.5)
    const nullableRating = prop<number | null>(null)
    const date = prop(new Date())
    const dateTime = prop(new Date())
    const email = prop('')
    const file = prop<File | undefined>(undefined)
    const files = prop<File[]>([])
    const number = prop(0)
    const nullableNumber = prop<number | null>(null)
    const bigint = prop<bigint>(0n)
    const nullableBigint = prop<bigint | null>(null)
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

    // Inputs that need minimal extra options beyond value
    const dropdownValue = prop('apple')
    const dropdownOptions = prop<DropdownOption<string>[]>([
      Option.value('apple', 'Apple'),
      Option.value('banana', 'Banana'),
    ])

    const nativeSelectValue = prop('one')
    const nativeSelectOptions = prop<SelectOption<string>[]>([
      Option.value('one', 'One'),
      Option.value('two', 'Two'),
    ])

    // URL values
    const urlVal = prop('')
    const nullableUrlVal = prop<string | null>(null)

    // Slider values
    const sliderVal = prop(50)
    const nullableSliderVal = prop<number | null>(null)

    // Segmented input
    const segmentedOptions = { one: 'One', two: 'Two', three: 'Three' } as const
    type SegmentedKey = keyof typeof segmentedOptions
    const segmentedVal = prop<SegmentedKey>('one')

    // Tags (selectable) options/values
    const selectTagsVal = prop<string[]>([])
    const selectTagsOptions = prop<DropdownOption<string>[]>([
      Option.value('red', 'Red'),
      Option.value('green', 'Green'),
      Option.value('blue', 'Blue'),
    ])

    // Combobox (single) fruits
    const comboboxFruits: DropdownOption<string>[] = [
      Option.value('apple', 'Apple'),
      Option.value('banana', 'Banana'),
      Option.value('cherry', 'Cherry'),
    ]
    const comboboxVal = prop('apple')
    const loadFruits = async (q: string) =>
      // eslint-disable-next-line tempots/require-async-signal-disposal
      comboboxFruits.filter(
        o =>
          o.type === 'value' && o.label.toLowerCase().includes(q.toLowerCase())
      )

    // Combobox Tags
    const comboboxTagsVal = prop<string[]>([])
    const comboboxTagsOptions = selectTagsOptions

    const lazySelectValue = prop('a')
    const lazySelectRequest = prop({ q: 'x' })

    const maskVal = prop('')
    const nullableMaskVal = prop<string | null>(null)

    const editableTextVal = prop('')
    const switchVal = prop(false)

    const listInitial = prop(['a', 'b'])

    // Adornment demo values
    const priceVal = prop('')
    const domainVal = prop('')
    const weightVal = prop('')

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
    const listCtl = useController<string[]>({
      initialValue: listInitial,
    })
    const list = listCtl.controller.array()

    return ScrollablePanel({
      header: ControlsHeader(
        Group(
          InputWrapper({
            label: 'Display non-nullables',
            content: Switch({
              value: displayNonNullables,
              onChange: displayNonNullables.set,
            }),
          }),
          InputWrapper({
            label: 'Disabled',
            content: Switch({ value: disabled, onChange: disabled.set }),
          })
        )
      ),
      body: Stack(
        attr.class('p-4 gap-4'),
        // Simple inputs that only need a value
        html.h2(
          attr.style(
            'margin: 1rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;'
          ),
          'Basics'
        ),
        Columns(
          InputWrapper({
            label: 'Appearance Selector',
            content: AppearanceSelector({
              value: appearance,
              onChange: appearance.set,
              disabled,
            }),
            description: description(appearance),
          }),
          InputWrapper({
            label: 'Base64 Input',
            content: Base64Input({
              value: base64,
              onChange: base64.set,
              disabled,
            }),
            description: description(base64),
          }),
          InputWrapper({
            label: 'Base64s Input',
            content: Base64sInput({
              value: base64s,
              onChange: base64s.set,
              disabled,
            }),
            description: description(base64s),
          }),
          InputWrapper({
            label: 'Checkbox Input',
            content: CheckboxInput({
              value: checkbox,
              onChange: checkbox.set,
              disabled,
            }),
            description: description(checkbox),
          }),
          InputWrapper({
            label: 'Color Input',
            content: ColorSwatchInput({
              value: color,
              onChange: color.set,
              displayValue: true,
              withAlpha: true,
              colorTextFormat: 'hex',
              disabled,
            }),
            description: description(color),
          }),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Rating Input',
                content: RatingInput({
                  value: rating,
                  onChange: rating.set,
                  emptyIcon: 'line-md:beer-alt-loop',
                  fullIcon: 'line-md:beer-alt-twotone-loop',
                  fullColor: 'orange',

                  max: 5,
                  rounding: 0.5,
                  size: 'lg',
                  disabled,
                }),
                description: description(rating),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Rating Input',
                content: NullableRatingInput({
                  value: nullableRating,
                  onChange: nullableRating.set,
                  emptyIcon: 'line-md:beer-alt-loop',
                  fullIcon: 'line-md:beer-alt-twotone-loop',
                  fullColor: 'orange',
                  max: 5,
                  rounding: 0.5,
                  size: 'lg',
                  disabled,
                }),
                description: description(nullableRating),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Email Input',
                content: EmailInput({
                  value: email,
                  onChange: email.set,
                  disabled,
                }),
                description: description(email),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Email Input',
                content: NullableEmailInput({
                  value: nullableEmail,
                  onChange: nullableEmail.set,
                  disabled,
                }),
                description: description(nullableEmail),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'URL Input',
                content: UrlInput({
                  value: urlVal,
                  onChange: urlVal.set,
                  disabled,
                }),
                description: description(urlVal),
              }),
            () =>
              InputWrapper({
                label: 'Nullable URL Input',
                content: NullableUrlInput({
                  value: nullableUrlVal,
                  onChange: nullableUrlVal.set,
                  disabled,
                }),
                description: description(nullableUrlVal),
              })
          ),
          InputWrapper({
            label: 'File Input (input)',
            content: FileInput({
              value: file,
              onChange: file.set,
              mode: 'input',
              disabled,
            }),
            description: description(file),
          }),
          InputWrapper({
            label: 'File Input (compact)',
            content: FileInput({
              value: file,
              onChange: file.set,
              mode: 'compact',
              disabled,
            }),
            description: description(file),
          }),
          InputWrapper({
            label: 'File Input',
            content: FileInput({ value: file, onChange: file.set, disabled }),
            description: description(file),
          }),
          InputWrapper({
            label: 'Files Input (input)',
            content: FilesInput({
              value: files,
              onChange: files.set,
              mode: 'input',
              disabled,
            }),
            description: description(files),
          }),
          InputWrapper({
            label: 'Files Input (compact)',
            content: FilesInput({
              value: files,
              onChange: files.set,
              mode: 'compact',
              disabled,
            }),
            description: description(files),
          }),
          InputWrapper({
            label: 'Files Input',
            content: FilesInput({
              value: files,
              onChange: files.set,
              disabled,
            }),
            description: description(files),
          }),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Number Input',
                content: NumberInput({
                  value: number,
                  onChange: number.set,
                  step: 1,
                  disabled,
                }),
                description: description(number),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Number Input',
                content: NullableNumberInput({
                  value: nullableNumber,
                  onChange: nullableNumber.set,
                  step: 1,
                  disabled,
                }),
                description: description(nullableNumber),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Bigint Input',
                content: BigintInput({
                  value: bigint,
                  onChange: bigint.set,
                  step: 1n,
                  disabled,
                }),
                description: description(bigint),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Bigint Input',
                content: NullableBigintInput({
                  value: nullableBigint,
                  onChange: nullableBigint.set,
                  step: 1n,
                  disabled,
                }),
                description: description(nullableBigint),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Password Input',
                content: PasswordInput({
                  value: password,
                  onChange: password.set,
                  disabled,
                }),
                description: description(password),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Password Input',
                content: NullablePasswordInput({
                  value: nullablePassword,
                  onChange: nullablePassword.set,
                  disabled,
                }),
                description: description(nullablePassword),
              })
          ),
          InputWrapper({
            label: 'Tags Input',
            content: TagsInput({ value: tags, onChange: tags.set, disabled }),
            description: description(tags),
          }),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Text Area',
                content: TextArea({
                  value: textAreaVal,
                  onChange: textAreaVal.set,
                  disabled,
                }),
                description: description(textAreaVal),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Text Area',
                content: NullableTextArea({
                  value: nullableTextAreaVal,
                  onChange: nullableTextAreaVal.set,
                  disabled,
                }),
                description: description(nullableTextAreaVal),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Text Input',
                content: TextInput({
                  value: textVal,
                  onChange: textVal.set,
                  disabled,
                }),
                description: description(textVal),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Text Input',
                content: NullableTextInput({
                  value: nullableTextVal,
                  onChange: nullableTextVal.set,
                  disabled,
                }),
                description: description(nullableTextVal),
              })
          )
        ),
        Columns(
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'UUID Input',
                content: UUIDInput({
                  value: uuid,
                  onChange: uuid.set,
                  disabled,
                }),
                description: description(uuid),
              }),
            () =>
              InputWrapper({
                label: 'Nullable UUID Input',
                content: NullableUUIDInput({
                  value: nullableUuid,
                  onChange: nullableUuid.set,
                  disabled,
                }),
                description: description(nullableUuid),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Date Input',
                content: DateInput({
                  value: date,
                  onChange: date.set,
                  disabled,
                }),
                description: description(date),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Date Input',
                content: NullableDateInput({
                  value: nullableDate,
                  onChange: nullableDate.set,
                  disabled,
                }),
                description: description(nullableDate),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Date Time Input',
                content: DateTimeInput({
                  value: dateTime,
                  onChange: dateTime.set,
                  disabled,
                }),
                description: description(dateTime),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Date Time Input',
                content: NullableDateTimeInput({
                  value: nullableDateTime,
                  onChange: nullableDateTime.set,
                  disabled,
                }),
                description: description(nullableDateTime),
              })
          )
        ),
        html.h2(
          attr.style(
            'margin: 1rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;'
          ),
          'With options'
        ),
        Columns(
          // Inputs that need minimal extra options beyond value
          InputWrapper({
            label: 'Dropdown Input',
            content: DropdownInput({
              value: dropdownValue,
              options: dropdownOptions,
              onChange: dropdownValue.set,
              disabled,
            }),
            description: description(dropdownValue),
          }),
          InputWrapper({
            label: 'Native Select',
            content: NativeSelect({
              value: nativeSelectValue,
              options: nativeSelectOptions,
              onChange: nativeSelectValue.set,
              disabled,
            }),
            description: description(nativeSelectValue),
          }),
          InputWrapper({
            label: 'Lazy Native Select',
            content: LazyNativeSelect({
              value: lazySelectValue,
              request: lazySelectRequest,
              load: async () => [
                { id: 'a', label: 'A' },
                { id: 'b', label: 'B' },
              ],
              onChange: lazySelectValue.set,
              disabled,
            }),
            description: description(lazySelectValue),
          }),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Mask Input',
                content: MaskInput({
                  value: maskVal,
                  mask: '999-999',
                  onChange: maskVal.set,
                  disabled,
                }),
                description: description(maskVal),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Mask Input',
                content: NullableMaskInput({
                  value: nullableMaskVal,
                  mask: '999-999',
                  onChange: nullableMaskVal.set,
                  disabled,
                }),
                description: description(nullableMaskVal),
              })
          ),
          InputWrapper({
            label: 'Editable Text',
            content: EditableText({
              value: editableTextVal,
              onChange: editableTextVal.set,
              disabled,
            }),
            description: description(editableTextVal),
          }),
          InputWrapper({
            label: 'Switch',
            content: Switch({
              value: switchVal,
              onChange: switchVal.set,
              disabled,
            }),
            description: description(switchVal),
          }),
          InputWrapper({
            label: 'List Input',
            content: Stack(
              ListInput(list, payload =>
                ListItemControls(
                  {
                    onMove: payload.move,
                    cannotMoveUp: payload.cannotMove('up'),
                    cannotMoveDown: payload.cannotMove('down'),
                    onRemove: payload.remove,
                    showMoveButtons: list.signal.map(v => v.length > 1),
                    layout: 'aside',
                  },
                  TextInput({
                    value: payload.item.signal,
                    onChange: payload.item.change,
                    disabled,
                  })
                )
              ),
              html.div(listCtl.controller.signal.map(v => String(v)))
            ),
          }),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Slider Input',
                content: SliderInput({
                  value: sliderVal,
                  onChange: sliderVal.set,
                  min: 0,
                  max: 100,
                  step: 1,
                  disabled,
                }),
                description: description(sliderVal),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Slider Input',
                content: NullableSliderInput({
                  value: nullableSliderVal,
                  onChange: nullableSliderVal.set,
                  min: 0,
                  max: 100,
                  step: 1,
                  disabled,
                }),
                description: description(nullableSliderVal),
              })
          ),
          InputWrapper({
            label: 'Segmented Input',
            content: SegmentedInput({
              options: segmentedOptions,
              value: segmentedVal,
              onChange: segmentedVal.set,
              disabled,
            }),
            description: description(segmentedVal),
          }),
          InputWrapper({
            label: 'Select Tags Input',
            content: SelectTagsInput({
              value: selectTagsVal,
              options: selectTagsOptions,
              onChange: selectTagsVal.set,
              disabled,
            }),
            description: description(selectTagsVal),
          }),
          InputWrapper({
            label: 'Combobox Input',
            content: ComboboxInput<string>({
              value: comboboxVal,
              onChange: comboboxVal.set,
              loadOptions: loadFruits,
              renderOption: v => v,
              disabled,
            }),
            description: description(comboboxVal),
          }),
          InputWrapper({
            label: 'Combobox Tags Input',
            content: ComboboxTagsInput({
              value: comboboxTagsVal,
              onChange: comboboxTagsVal.set,
              options: comboboxTagsOptions,
              disabled,
            }),
            description: description(comboboxTagsVal),
          })
        ),
        html.h2(
          attr.style(
            'margin: 1rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;'
          ),
          'Input Adornments'
        ),
        Columns(
          InputWrapper({
            label: 'Price (filled before)',
            content: TextInput({
              value: priceVal,
              onChange: priceVal.set,
              before: InputAdornment({ filled: true }, '$'),
              disabled,
            }),
            description: description(priceVal),
          }),
          InputWrapper({
            label: 'Domain (filled after)',
            content: TextInput({
              value: domainVal,
              onChange: domainVal.set,
              after: InputAdornment({ filled: true }, '.com'),
              disabled,
            }),
            description: description(domainVal),
          }),
          InputWrapper({
            label: 'Weight (unfilled after)',
            content: TextInput({
              value: weightVal,
              onChange: weightVal.set,
              after: InputAdornment({}, 'kg'),
              disabled,
            }),
            description: description(weightVal),
          }),
          InputWrapper({
            label: 'Both adornments',
            content: TextInput({
              value: priceVal,
              onChange: priceVal.set,
              before: InputAdornment({ filled: true }, '$'),
              after: InputAdornment({}, '.00'),
              disabled,
            }),
            description: description(priceVal),
          }),
          InputWrapper({
            label: 'Bare InputContainer + adornments',
            content: InputContainer({
              size: 'md',
              input: html.span('Custom content'),
              before: InputAdornment({ filled: true }, 'Label'),
              after: InputAdornment({}, 'Suffix'),
            }),
          })
        ),
        html.h2(
          attr.style(
            'margin: 1rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;'
          ),
          'Temporal'
        ),
        Columns(
          // Temporal-based inputs
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Plain Date Input',
                content: PlainDateInput({
                  value: plainDate,
                  onChange: plainDate.set,
                  disabled,
                }),
                description: description(plainDate),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Plain DateInput',
                content: NullablePlainDateInput({
                  value: nullablePlainDate,
                  onChange: v => nullablePlainDate.set(v),
                  disabled,
                }),
                description: description(nullablePlainDate),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Plain Time Input',
                content: PlainTimeInput({
                  value: plainTime,
                  onChange: plainTime.set,
                  disabled,
                }),
                description: description(plainTime),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Plain Time Input',
                content: NullablePlainTimeInput({
                  value: nullablePlainTime,
                  onChange: v => nullablePlainTime.set(v),
                  disabled,
                }),
                description: description(nullablePlainTime),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Plain Date Time Input',
                content: PlainDateTimeInput({
                  value: plainDateTime,
                  onChange: plainDateTime.set,
                  disabled,
                }),
                description: description(plainDateTime),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Plain Date Time Input',
                content: NullablePlainDateTimeInput({
                  value: nullablePlainDateTime,
                  onChange: v => nullablePlainDateTime.set(v),
                  disabled,
                }),
                description: description(nullablePlainDateTime),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Instant Input',
                content: InstantInput({
                  value: instant,
                  onChange: instant.set,
                  disabled,
                }),
                description: description(instant),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Instant Input',
                content: NullableInstantInput({
                  value: nullableInstant,
                  onChange: v => nullableInstant.set(v),
                  disabled,
                }),
                description: description(nullableInstant),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Zoned Date Time Input',
                content: ZonedDateTimeInput({
                  value: zonedDateTime,
                  onChange: zonedDateTime.set,
                  disabled,
                }),
                description: description(zonedDateTime),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Zoned Date Time Input',
                content: NullableZonedDateTimeInput({
                  value: nullableZonedDateTime,
                  onChange: v => nullableZonedDateTime.set(v),
                  disabled,
                }),
                description: description(nullableZonedDateTime),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Plain Year Month Input',
                content: PlainYearMonthInput({
                  value: plainYearMonth,
                  onChange: plainYearMonth.set,
                  disabled,
                }),
                description: description(plainYearMonth),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Plain Year Month Input',
                content: NullablePlainYearMonthInput({
                  value: nullablePlainYearMonth,
                  onChange: nullablePlainYearMonth.set,
                  disabled,
                }),
                description: description(nullablePlainYearMonth),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Plain Month Day Input',
                content: PlainMonthDayInput({
                  value: plainMonthDay,
                  onChange: plainMonthDay.set,
                  disabled,
                }),
                description: description(plainMonthDay),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Plain Month Day Input',
                content: NullablePlainMonthDayInput({
                  value: nullablePlainMonthDay,
                  onChange: nullablePlainMonthDay.set,
                  disabled,
                }),
                description: description(nullablePlainMonthDay),
              })
          ),
          When(
            displayNonNullables,
            () =>
              InputWrapper({
                label: 'Duration Input',
                content: DurationInput({
                  value: duration,
                  onChange: duration.set,
                  disabled,
                }),
                description: description(duration),
              }),
            () =>
              InputWrapper({
                label: 'Nullable Duration Input',
                content: NullableDurationInput({
                  value: nullableDuration,
                  onChange: nullableDuration.set,
                  disabled,
                }),
                description: description(nullableDuration),
              })
          )
        )
      ),
    })
  })
}
