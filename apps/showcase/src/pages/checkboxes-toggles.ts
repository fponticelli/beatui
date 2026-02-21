import { html, attr, prop } from '@tempots/dom'
import {
  CheckboxInput,
  Switch,
  InputWrapper,
  RadioGroup,
  RadioOption,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'

export default function CheckboxesPage() {
  const check1 = prop(true)
  const check2 = prop(false)
  const check3 = prop(false)

  const radio = prop('option2')

  const switch1 = prop(true)
  const switch2 = prop(false)
  const switch3 = prop(true)

  const radioOptions: RadioOption<string>[] = [
    { value: 'option1', label: 'First option' },
    { value: 'option2', label: 'Second option' },
    { value: 'option3', label: 'Third option' },
    { value: 'disabled1', label: 'Disabled checked', disabled: true },
    { value: 'disabled2', label: 'Disabled unchecked', disabled: true },
  ]

  return WidgetPage({
    id: 'checkboxes-toggles',
    title: 'Checkboxes & Toggles',
    description: 'Checkbox inputs and toggle switches.',
    body: html.div(
      attr.style('display: flex; gap: 48px'),

      // Column 1: Checkboxes
      html.div(
        html.div(attr.class('sc-section-header'), 'Checkboxes'),
        html.div(
          attr.style('display: flex; flex-direction: column; gap: 10px'),
          InputWrapper({
            content: CheckboxInput({ value: check1, onChange: v => check1.set(v) }),
            label: 'Checked option',
            layout: 'horizontal-label-right',
          }),
          InputWrapper({
            content: CheckboxInput({ value: check2, onChange: v => check2.set(v) }),
            label: 'Unchecked option',
            layout: 'horizontal-label-right',
          }),
          InputWrapper({
            content: CheckboxInput({ value: check3, onChange: v => check3.set(v) }),
            label: 'Another option',
            layout: 'horizontal-label-right',
          }),
          InputWrapper({
            content: CheckboxInput({ value: prop(true), disabled: true }),
            label: 'Disabled checked',
            layout: 'horizontal-label-right',
            disabled: true,
          }),
          InputWrapper({
            content: CheckboxInput({ value: prop(false), disabled: true }),
            label: 'Disabled unchecked',
            layout: 'horizontal-label-right',
            disabled: true,
          })
        )
      ),

      // Column 2: Radio Buttons
      html.div(
        html.div(attr.class('sc-section-header'), 'Radio Buttons'),
        html.div(
          attr.style('display: flex; flex-direction: column; gap: 10px'),
          RadioGroup({
            options: radioOptions,
            value: radio,
            onChange: v => radio.set(v),
          })
        )
      ),

      // Column 3: Toggle Switches
      html.div(
        html.div(attr.class('sc-section-header'), 'Toggle Switches'),
        html.div(
          attr.style('display: flex; flex-direction: column; gap: 10px'),
          InputWrapper({
            content: Switch({ value: switch1, onChange: v => switch1.set(v) }),
            label: 'Notifications',
            layout: 'horizontal-label-right',
          }),
          InputWrapper({
            content: Switch({ value: switch2, onChange: v => switch2.set(v) }),
            label: 'Dark mode',
            layout: 'horizontal-label-right',
          }),
          InputWrapper({
            content: Switch({ value: switch3, onChange: v => switch3.set(v) }),
            label: 'Auto-save',
            layout: 'horizontal-label-right',
          })
        )
      )
    ),
  })
}
