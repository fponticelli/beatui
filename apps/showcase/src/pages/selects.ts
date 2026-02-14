import { html, attr, prop } from '@tempots/dom'
import {
  DropdownInput,
  NativeSelect,
  ComboboxInput,
  InputWrapper,
  Option,
  DropdownOption,
  SelectOption,
  ControlSize,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSegmented, ControlSwitch } from '../views/control-helpers'
import { SectionBlock } from '../views/section'

const fruits: DropdownOption<string>[] = [
  Option.value('apple', 'Apple'),
  Option.value('banana', 'Banana'),
  Option.value('cherry', 'Cherry'),
  Option.value('date', 'Date'),
  Option.value('elderberry', 'Elderberry'),
]

const countries: SelectOption<string>[] = [
  Option.value('us', 'United States'),
  Option.value('uk', 'United Kingdom'),
  Option.value('de', 'Germany'),
  Option.value('fr', 'France'),
  Option.value('jp', 'Japan'),
]

export default function SelectsPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)

  const dropdown = prop('apple')
  const native = prop('us')
  const combobox = prop('apple')

  const loadOptions = async (q: string) =>
    fruits.filter(
      o => o.type === 'value' && o.label.toLowerCase().includes(q.toLowerCase())
    )

  return WidgetPage({
    id: 'selects',
    title: 'Selects',
    description: 'Dropdown, native select, and combobox inputs.',
    controls: ControlsHeader(
      ControlSegmented('Size', size, {
        xs: 'XS',
        sm: 'SM',
        md: 'MD',
        lg: 'LG',
        xl: 'XL',
      } as Record<ControlSize, string>),
      ControlSwitch('Disabled', disabled)
    ),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Dropdown & Select',
        html.div(
          attr.class('grid grid-cols-1 md:grid-cols-2 gap-4'),
          InputWrapper({
            label: 'Dropdown Input',
            content: DropdownInput({
              value: dropdown,
              options: prop(fruits),
              onChange: dropdown.set,
              size,
              disabled,
            }),
            description: dropdown,
          }),
          InputWrapper({
            label: 'Native Select',
            content: NativeSelect({
              value: native,
              options: prop(countries),
              onChange: native.set,
              size,
              disabled,
            }),
            description: native,
          })
        )
      ),

      SectionBlock(
        'Combobox',
        html.div(
          attr.class('max-w-md'),
          InputWrapper({
            label: 'Combobox Input',
            description: 'Type to search fruits...',
            content: ComboboxInput<string>({
              value: combobox,
              onChange: combobox.set,
              loadOptions,
              renderOption: v => v,
              size,
              disabled,
            }),
          })
        )
      )
    ),
  })
}
