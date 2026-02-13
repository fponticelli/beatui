import { attr, html, prop } from '@tempots/dom'
import {
  Card,
  Group,
  Stack,
  EditableText,
  Switch,
  InputWrapper,
} from '@tempots/beatui'

export default function EditableTextPage() {
  const text = prop('Click to edit me')
  const disabled = prop(false)

  return Group(
    attr.class('items-start gap-4 p-4 h-full overflow-hidden'),
    Stack(
      attr.class('gap-4'),
      Card(
        {},
        Group(
          attr.class('gap-4 items-center'),
          InputWrapper({
            label: 'Disabled',
            content: Switch({
              value: disabled,
              onChange: disabled.set,
            }),
          })
        )
      ),
      Card(
        {},
        Group(
          attr.class('gap-2 items-baseline'),
          html.div('EditableText'),
          EditableText({ value: text, onChange: text.set, disabled })
        ),
        html.hr(),
        Group(
          attr.class('gap-2 items-baseline'),
          html.div('Current value:'),
          html.pre(text)
        )
      )
    )
  )
}
