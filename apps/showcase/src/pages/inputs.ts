import { html, attr, prop, TNode } from '@tempots/dom'
import {
  TextInput,
  NumberInput,
  TextArea,
  ControlSize,
  InputAdornment,
  InputIcon,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSegmented, ControlSwitch } from '../views/control-helpers'
import { SectionBlock } from '../views/section'

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

export default function InputsPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)

  const text = prop('')
  const search = prop('')
  const url = prop('')
  const number = prop(0)
  const date = prop('')
  const textarea = prop('')
  const errorValue = prop('')
  const disabledValue = prop('Cannot edit')
  const smallValue = prop('')

  return WidgetPage({
    id: 'inputs',
    title: 'Inputs',
    description: 'Text, email, password, number, and textarea inputs.',
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
        'Text Inputs',
        html.div(
          attr.style('max-width: 480px'),

          InputRow(
            'Text',
            TextInput({
              value: text,
              onChange: text.set,
              placeholder: 'Enter text...',
              size,
              disabled,
            })
          ),

          InputRow(
            'Search',
            TextInput({
              value: search,
              onChange: search.set,
              placeholder: 'Search...',
              before: InputIcon({ icon: 'lucide:search', size }),
              size,
              disabled,
            })
          ),

          InputRow(
            'With prefix',
            TextInput({
              value: url,
              onChange: url.set,
              placeholder: 'example.com',
              type: 'url',
              before: InputAdornment({ filled: true, size }, 'https://'),
              size,
              disabled,
            })
          ),

          InputRow(
            'Number',
            NumberInput({
              value: number,
              onChange: number.set,
              step: 1,
              size,
              disabled,
            })
          ),

          InputRow(
            'Date',
            TextInput({
              value: date,
              onChange: date.set,
              type: 'date',
              size,
              disabled,
            })
          ),

          InputRow(
            'Textarea',
            TextArea({
              value: textarea,
              onChange: textarea.set,
              placeholder: 'Write something...',
              disabled,
            })
          ),

          InputRow(
            'Error',
            html.div(
              TextInput({
                value: errorValue,
                onChange: errorValue.set,
                placeholder: 'This field has an error',
                hasError: true,
                size,
                disabled,
              }),
              html.span(
                attr.style(
                  'display: block; margin-top: 4px; font-size: 12px; color: var(--color-danger-500)'
                ),
                'This field is required'
              )
            )
          ),

          InputRow(
            'Disabled',
            TextInput({
              value: disabledValue,
              onChange: disabledValue.set,
              disabled: true,
              size,
            })
          ),

          InputRow(
            'Small',
            TextInput({
              value: smallValue,
              onChange: smallValue.set,
              placeholder: 'Small input',
              size: 'sm',
              disabled,
            })
          )
        )
      )
    ),
  })
}
