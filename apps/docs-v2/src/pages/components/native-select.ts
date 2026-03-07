import { NativeSelect, Option } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import type { SelectOption } from '@tempots/beatui'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NativeSelect',
  category: 'Selection',
  component: 'NativeSelect',
  description:
    'A native HTML select element with styled appearance, grouped options, and custom equality support.',
  icon: 'lucide:chevron-down',
  order: 16,
}

const countryOptions: SelectOption<string>[] = [
  Option.value('us', 'United States'),
  Option.value('uk', 'United Kingdom'),
  Option.value('ca', 'Canada'),
  Option.value('au', 'Australia'),
  Option.value('de', 'Germany'),
]

export default function NativeSelectPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NativeSelect', signals => {
      const value = signals.value as Prop<string>
      const options = prop(countryOptions)
      return html.div(
        attr.class('w-56'),
        NativeSelect({
          value,
          options,
          size: signals.size,
          color: signals.color,
          disabled: signals.disabled,
          placeholder: 'Select a country...',
          onChange: (v: string) => value.set(v),
        } as never)
      )
    }),
    sections: [
      ...AutoSections('NativeSelect', props =>
        html.div(
          attr.class('w-48'),
          NativeSelect({ ...props, value: 'us', options: prop(countryOptions) } as never)
        )
      ),
      Section(
        'Basic Usage',
        () => {
          const value = prop('')
          return html.div(
            attr.class('w-56'),
            NativeSelect({
              value,
              options: prop(countryOptions),
              placeholder: 'Select a country...',
              onChange: (v: string) => value.set(v),
            })
          )
        },
        "NativeSelect opens the browser's native picker, providing great mobile support and accessibility."
      ),
      Section(
        'Grouped Options',
        () => {
          const value = prop('')
          return html.div(
            attr.class('w-56'),
            NativeSelect({
              value,
              options: prop([
                Option.group('Fruits', [
                  Option.value('apple', 'Apple'),
                  Option.value('banana', 'Banana'),
                  Option.value('cherry', 'Cherry'),
                ]),
                Option.break,
                Option.group('Vegetables', [
                  Option.value('carrot', 'Carrot'),
                  Option.value('broccoli', 'Broccoli'),
                  Option.value('spinach', 'Spinach'),
                ]),
              ] as SelectOption<string>[]),
              placeholder: 'Choose a food...',
              onChange: (v: string) => value.set(v),
            })
          )
        },
        'Options can be organized into named groups with horizontal break separators.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                NativeSelect({
                  value: '',
                  options: prop(countryOptions),
                  size,
                  placeholder: `Size ${size}`,
                  onChange: () => {},
                })
              )
            )
          ),
        'NativeSelect is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NativeSelect({
              value: '',
              options: prop(countryOptions),
              placeholder: 'Default',
              onChange: () => {},
            }),
            NativeSelect({
              value: '',
              options: prop(countryOptions),
              placeholder: 'Disabled',
              disabled: true,
              onChange: () => {},
            }),
            NativeSelect({
              value: '',
              options: prop(countryOptions),
              placeholder: 'Error',
              hasError: true,
              onChange: () => {},
            })
          ),
        'NativeSelect supports disabled and error states.'
      ),
    ],
  })
}
