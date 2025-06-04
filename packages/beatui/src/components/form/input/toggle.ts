import {
  aria,
  attr,
  html,
  computedOf,
  on,
  Value,
  Use,
  style,
  TNode,
} from '@tempots/dom'
import { Theme } from '../../theme'
import { ElementRect } from '@tempots/ui'
import { ControlSize } from '../../theme/types'

export type ToggleOptions = {
  value: Value<boolean>
  onChange: (value: boolean) => void
  offLabel?: TNode
  onLabel?: TNode
  label?: TNode
  disabled?: Value<boolean>
  size?: ControlSize
}

export const Toggle = ({
  value,
  onChange,
  offLabel,
  onLabel,
  label,
  disabled = false,
  size = 'md',
}: ToggleOptions) =>
  Use(Theme, theme => {
    return html.div(
      attr.class(
        computedOf(
          theme,
          disabled ?? false,
          size
        )(({ theme }, disabled, size) =>
          theme.toggle({
            disabled,
            size,
          })
        )
      ),
      attr.role('switch'),
      aria.checked(value as Value<boolean | 'true' | 'false' | 'mixed'>),
      on.click(() => {
        if (Value.get(disabled)) return
        onChange(!Value.get(value))
      }),
      label != null ? html.div(attr.class('bc-toggle__label'), label) : null,
      html.div(
        attr.class('bc-toggle__track'),
        attr.class(
          Value.map(value, (v): string =>
            v ? 'bc-toggle__track--on' : 'bc-toggle__track--off'
          )
        ),
        offLabel != null
          ? html.div(
              aria.hidden(true),
              attr.class('bc-toggle__track-label bc-toggle__track-label--off'),
              attr.class(
                Value.map(value, (v): string =>
                  v
                    ? 'bc-toggle__track-label--hidden'
                    : 'bc-toggle__track-label--visible'
                )
              ),
              offLabel
            )
          : null,

        onLabel != null
          ? html.div(
              attr.class('bc-toggle__track-label bc-toggle__track-label--on'),
              attr.class(
                Value.map(value, (v): string =>
                  v
                    ? 'bc-toggle__track-label--visible'
                    : 'bc-toggle__track-label--hidden'
                )
              ),
              onLabel
            )
          : null,
        ElementRect(rect =>
          html.div(
            attr.class('bc-toggle__thumb'),
            attr.class(
              Value.map(value, (v): string =>
                v ? 'bc-toggle__thumb--on' : 'bc-toggle__thumb--off'
              )
            ),
            style.transform(
              computedOf(
                value,
                rect,
                size
              )((value, { width }, size) => {
                const multipier = (() => {
                  switch (size) {
                    case 'xs':
                      return 5
                    case 'sm':
                      return 5.5
                    case 'md':
                      return 6
                    case 'lg':
                      return 7
                    case 'xl':
                      return 8
                  }
                })()
                return value
                  ? `translateX(calc(${width}px - (var(--spacing-base) * ${multipier})))`
                  : `translateX(0)`
              })
            )
          )
        )
      )
    )
  })
