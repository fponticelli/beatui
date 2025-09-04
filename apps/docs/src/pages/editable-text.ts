import { attr, html, prop } from '@tempots/dom'
import { Card, Group, Stack, EditableText, Switch } from '@tempots/beatui'

export default function EditableTextPage() {
  const text = prop('Click to edit me')
  const disabled = prop(false)

  return Group(
    attr.class('bu-items-start bu-gap-4 bu-p-4 bu-h-full bu-overflow-hidden'),
    Stack(
      attr.class('bu-gap-4'),
      Card(
        {},
        Group(
          attr.class('bu-gap-4 bu-items-center'),
          Switch({ value: disabled, onChange: disabled.set, label: 'Disabled' })
        )
      ),
      Card(
        {},
        Group(
          attr.class('bu-gap-2 bu-items-baseline'),
          html.div('EditableText'),
          EditableText({ value: text, onChange: text.set, disabled })
        ),
        html.hr(),
        Group(
          attr.class('bu-gap-2 bu-items-baseline'),
          html.div('Current value:'),
          html.pre(text.map(v => String(v)))
        )
      )
    )
  )
}
