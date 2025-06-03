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
  computedOf,
} from '@tempots/dom'
import { AutoSelect } from '@tempots/ui'
import { Theme } from '../../theme'

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

  return Use(Theme, theme => {
    return html.div(
      attr.class(
        computedOf(
          theme,
          isEditing
        )(({ theme }, isEditing) =>
          theme.editableText({
            isEditing,
          })
        )
      ),
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
              aria.label('Edit'),
              on.click(() => isEditing.set(true)),
              Icon({ icon: 'line-md/pencil' })
            )
          )
      )
    )
  })
}
