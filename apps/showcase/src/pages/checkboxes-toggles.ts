import { html, attr, prop, Value } from '@tempots/dom'
import {
  CheckboxInput,
  Switch,
  InputWrapper,
  Group,
  ControlSize,
  ThemeColorName,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSegmented, ControlSwitch } from '../views/control-helpers'
import { SectionStack, Section } from '../views/section'

export default function CheckboxesPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)

  const check1 = prop(false)
  const check2 = prop(true)
  const check3 = prop(false)
  const switch1 = prop(false)
  const switch2 = prop(true)

  return WidgetPage({
    id: 'checkboxes-toggles',
    title: 'Checkboxes & Toggles',
    description: 'Checkbox inputs and toggle switches.',
    controls: ControlsHeader(
      ControlSegmented('Size', size, { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' } as Record<ControlSize, string>),
      ControlSwitch('Disabled', disabled),
    ),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      // Checkboxes
      SectionStack(
        'Checkboxes',
        InputWrapper({
          label: 'Accept terms',
          content: CheckboxInput({ value: check1, onChange: check1.set, disabled }),
          description: Value.map(check1, v => v ? 'Checked' : 'Unchecked'),
        }),
        InputWrapper({
          label: 'Subscribe to newsletter',
          content: CheckboxInput({ value: check2, onChange: check2.set, disabled }),
          description: Value.map(check2, v => v ? 'Checked' : 'Unchecked'),
        }),
        InputWrapper({
          label: 'Remember me',
          content: CheckboxInput({ value: check3, onChange: check3.set, disabled }),
          description: Value.map(check3, v => v ? 'Checked' : 'Unchecked'),
        }),
      ),

      // Switches
      SectionStack(
        'Switches',
        InputWrapper({
          label: 'Dark mode',
          content: Switch({ value: switch1, onChange: switch1.set, disabled }),
          description: Value.map(switch1, v => v ? 'ON' : 'OFF'),
        }),
        InputWrapper({
          label: 'Notifications',
          content: Switch({ value: switch2, onChange: switch2.set, disabled }),
          description: Value.map(switch2, v => v ? 'ON' : 'OFF'),
        }),
      ),

      // Switch colors
      Section(
        'Switch Colors',
        ...(['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as ThemeColorName[]).map(color => {
          const val = prop(true)
          return InputWrapper({
            label: color,
            content: Switch({ value: val, onChange: val.set, color, disabled }),
          })
        })
      ),

      // Switch sizes
      Section(
        'Switch Sizes',
        ...(['xs', 'sm', 'md', 'lg', 'xl'] as ControlSize[]).map(sz => {
          const val = prop(true)
          return InputWrapper({
            label: sz.toUpperCase(),
            content: Switch({ value: val, onChange: val.set, size: sz, disabled }),
          })
        })
      ),
    ),
  })
}
