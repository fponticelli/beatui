import { BeatUII18n } from '@/beatui-i18n'
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
  Use,
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
    attr.class('bc-editable-text'),
    When(
      isEditing,
      () =>
        html.input(
          attr.placeholder(placeholder),
          attr.value(value),
          attr.class('bc-editable-text__input'),
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
          attr.class('bc-editable-text__display'),
          When(
            Value.map(value, v => v != null && v.trim() !== ''),
            () => html.span(attr.class('bc-editable-text__text'), value),
            () =>
              html.span(
                attr.class('bc-editable-text__placeholder'),
                placeholder
              )
          ),
          html.button(
            attr.class('bc-editable-text__edit-button'),
            Use(BeatUII18n, t => aria.label(t.$.editLabel)),
            on.click(() => isEditing.set(true)),
            Icon({ icon: 'line-md/pencil' })
          )
        )
    )
  )
}
