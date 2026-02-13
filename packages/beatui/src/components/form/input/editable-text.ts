import { BeatUII18n } from '../../../beatui-i18n'
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

/**
 * Options for the {@link EditableText} component.
 */
export type EditableTextOptions = {
  /** The current text value to display and edit. */
  value: Value<string>
  /** Callback invoked with the new text value when editing completes. */
  onChange: (value: string) => void
  /** Placeholder text shown when the value is empty. */
  placeholder?: Value<string>
  /**
   * Whether the component should start in editing mode.
   * @default false
   */
  startEditing?: Value<boolean>
  /**
   * Whether the component is disabled and cannot be edited.
   * @default false
   */
  disabled?: Value<boolean>
}

/**
 * An inline editable text component that toggles between display and edit modes.
 *
 * In display mode, shows the text with a pencil icon button. Clicking the text
 * or button switches to edit mode with an auto-selected input field. Press Enter
 * to confirm, Escape to cancel, or blur to confirm the change.
 *
 * @param options - Configuration options for the editable text.
 * @returns A renderable editable text component.
 *
 * @example
 * ```ts
 * EditableText({
 *   value: prop('Click to edit'),
 *   onChange: newValue => console.log('Changed to:', newValue),
 *   placeholder: 'Enter text...',
 * })
 * ```
 */
export const EditableText = ({
  startEditing,
  value,
  onChange,
  placeholder,
  disabled,
}: EditableTextOptions): Renderable => {
  const isEditing = Value.deriveProp(startEditing ?? false)
  const escaped = prop(false)
  const isDisabled = Value.map(disabled ?? false, d => d)

  return html.div(
    attr.class('bc-editable-text'),
    attr.class(
      Value.map(isDisabled, d =>
        d ? 'bc-editable-text--disabled' : ''
      ) as Value<string>
    ),
    aria.disabled(isDisabled),
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
          on.click(() => {
            if (!Value.get(isDisabled)) isEditing.set(true)
          }),
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
          When(
            Value.map(isDisabled, d => !d),
            () =>
              html.button(
                attr.type('button'),
                attr.class('bc-editable-text__edit-button'),
                Use(BeatUII18n, t => aria.label(t.$.editLabel)),
                on.click(() => isEditing.set(true)),
                Icon({ icon: 'line-md/pencil', color: 'neutral' })
              )
          )
        )
    )
  )
}
