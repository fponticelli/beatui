import { Icon } from '../../data/icon'
import {
  aria,
  attr,
  emitValue,
  html,
  When,
  prop,
  on,
  Renderable,
  Value,
} from '@tempots/dom'
import { AutoSelect } from '@tempots/ui'

export type EditableTextOptions = {
  value: Value<string>
  onChange: (value: string) => void
  placeholder?: Value<string>
  startEditing?: Value<boolean>
}

export const EditableText = ({
  startEditing,
  value,
  onChange,
  placeholder,
}: EditableTextOptions): Renderable => {
  const isEditing = Value.deriveProp(startEditing ?? false)
  const escaped = prop(false)
  return html.div(
    attr.class(' border-b border-gray-300 border-dashed'),
    When(
      isEditing,
      () =>
        html.input(
          attr.placeholder(placeholder),
          attr.value(value),
          attr.class('outline-offset-4 px-1 bg-transparent min-w-8 w-min'),
          AutoSelect(),
          on.keydown(e => {
            if (e.key === 'Enter') {
              isEditing.set(false)
            } else if (e.key === 'Escape') {
              escaped.set(true)
              isEditing.set(false)
            }
          }),
          on.blur(
            emitValue(v => {
              isEditing.set(false)
              if (escaped.value) {
                escaped.set(false)
                return
              }
              onChange(v)
            })
          )
        ),
      () =>
        html.span(
          on.click(() => isEditing.set(true)),
          attr.class(
            'flex flex-row gap-2 justify-between items-center cursor-pointer px-1 text-nowrap'
          ),
          When(
            Value.map(value, v => v != null && v.trim() !== ''),
            () => html.span(value),
            () => html.span(attr.class('text-gray-500 italic'), placeholder)
          ),
          html.button(
            attr.class(
              'rounded-full text-yellow-700 bg-transparent hover:bg-gray-100 active:bg-gray-200'
            ),
            aria.label('Edit'),
            on.click(() => isEditing.set(true)),
            Icon({ icon: 'line-md/pencil' })
          )
        )
    )
  )
}
