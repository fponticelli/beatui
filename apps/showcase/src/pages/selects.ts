import { html, attr, prop, TNode } from '@tempots/dom'
import {
  DropdownInput,
  NativeSelect,
  ComboboxInput,
  TagInput,
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

function InputRow(label: string, ...children: TNode[]): TNode {
  return html.div(
    attr.style(
      'display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px'
    ),
    html.span(
      attr.style(
        'width: 100px; flex-shrink: 0; font-size: 11px; color: var(--color-base-400); padding-top: 8px; text-align: right'
      ),
      label
    ),
    html.div(attr.style('flex: 1'), ...children)
  )
}

export default function SelectsPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)

  const dropdown = prop('apple')
  const native = prop('us')
  const combobox = prop('apple')
  const tags = prop(['frontend', 'urgent'])

  const loadOptions = async (q: string) =>
    // eslint-disable-next-line tempots/require-async-signal-disposal
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
          attr.style('max-width: 480px'),

          InputRow(
            'Dropdown',
            DropdownInput({
              value: dropdown,
              options: prop(fruits),
              onChange: dropdown.set,
              size,
              disabled,
            })
          ),

          InputRow(
            'Native',
            NativeSelect({
              value: native,
              options: prop(countries),
              onChange: native.set,
              size,
              disabled,
            })
          ),

          InputRow(
            'Combobox',
            ComboboxInput<string>({
              value: combobox,
              onChange: combobox.set,
              loadOptions,
              renderOption: v => v,
              size,
              disabled,
            })
          ),

          InputRow(
            'Multi-value',
            TagInput({
              values: tags,
              onChange: tags.set,
              placeholder: 'Add...',
              size,
              disabled,
            })
          )
        )
      )
    ),
  })
}
