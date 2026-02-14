import { aria, attr, Signal, Value, When } from '@tempots/dom'
import { ControlSize } from '../theme'
import { ToolbarButton } from '../navigation'
import { Icon } from '../data'

export interface EditorToolbarButtonOptions {
  active: Signal<boolean>
  display: Signal<boolean>
  onClick: () => void
  disabled: Signal<boolean>
  label: Value<string>
  icon: Value<string>
  size: Value<ControlSize>
}

/**
 * A reusable toolbar button component for rich text editors.
 * Used by both Lexical and ProseMirror editor toolbars.
 */
export function EditorToolbarButton(options: EditorToolbarButtonOptions) {
  const { active, display, onClick, disabled, label, icon, size } = options

  return When(display, () =>
    ToolbarButton(
      {
        onClick,
        disabled,
        size,
      },
      attr.class(active.map(v => (v ? 'bc-toolbar__button--active' : ''))),
      aria.pressed(active),
      attr.title(label),
      Icon({ icon, size })
    )
  )
}
