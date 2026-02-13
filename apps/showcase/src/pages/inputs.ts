import { html, attr, prop } from '@tempots/dom'
import {
  TextInput,
  PasswordInput,
  EmailInput,
  NumberInput,
  TextArea,
  InputWrapper,
  ControlSize,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSegmented, ControlSwitch } from '../views/control-helpers'
import { SectionBlock, SectionStack } from '../views/section'

export default function InputsPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)

  const text = prop('')
  const email = prop('')
  const password = prop('')
  const number = prop(0)
  const textarea = prop('')

  return WidgetPage({
    id: 'inputs',
    title: 'Inputs',
    description: 'Text, email, password, number, and textarea inputs.',
    controls: ControlsHeader(
      ControlSegmented('Size', size, { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' } as Record<ControlSize, string>),
      ControlSwitch('Disabled', disabled),
    ),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Text Inputs',
        html.div(
          attr.class('grid grid-cols-1 md:grid-cols-2 gap-4'),
          InputWrapper({
            label: 'Text Input',
            content: TextInput({
              value: text,
              onChange: text.set,
              placeholder: 'Enter text...',
              size,
              disabled,
            }),
            description: text.map(v => v ? `"${v}"` : 'empty'),
          }),
          InputWrapper({
            label: 'Email Input',
            content: EmailInput({
              value: email,
              onChange: email.set,
              placeholder: 'user@example.com',
              size,
              disabled,
            }),
            description: email.map(v => v ? `"${v}"` : 'empty'),
          }),
          InputWrapper({
            label: 'Password Input',
            content: PasswordInput({
              value: password,
              onChange: password.set,
              placeholder: 'Enter password...',
              size,
              disabled,
            }),
          }),
          InputWrapper({
            label: 'Number Input',
            content: NumberInput({
              value: number,
              onChange: number.set,
              step: 1,
              size,
              disabled,
            }),
            description: number.map(v => String(v)),
          }),
        )
      ),

      SectionStack(
        'Textarea',
        InputWrapper({
          label: 'Text Area',
          content: TextArea({
            value: textarea,
            onChange: textarea.set,
            placeholder: 'Write something...',
            disabled,
          }),
          description: textarea.map(v => v ? `${v.length} chars` : 'empty'),
        })
      ),
    ),
  })
}
