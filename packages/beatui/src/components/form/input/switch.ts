import {
  aria,
  attr,
  html,
  computedOf,
  on,
  Value,
  style,
  TNode,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { ControlSize } from '../../theme/types'
import { Label } from '@/components/typography'

export type SwitchOptions = {
  value: Value<boolean>
  onChange: (value: boolean) => void
  offLabel?: TNode
  onLabel?: TNode
  label?: TNode
  disabled?: Value<boolean>
  size?: ControlSize
}

export const Switch = ({
  value,
  onChange,
  offLabel,
  onLabel,
  label,
  disabled = false,
  size = 'md',
}: SwitchOptions) => {
  function generateSwitchClasses(disabled: boolean, size: ControlSize): string {
    const classes = ['bc-switch', `bu-text-${size}`, `bc-switch--${size}`]

    if (disabled) {
      classes.push('bc-switch--disabled')
    }

    return classes.join(' ')
  }

  return html.div(
    attr.class(
      computedOf(
        disabled ?? false,
        size
      )((disabled, size) =>
        generateSwitchClasses(disabled ?? false, size ?? 'md')
      )
    ),
    attr.role('switch'),
    aria.checked(value as Value<boolean | 'true' | 'false' | 'mixed'>),
    on.click(() => {
      if (Value.get(disabled)) return
      onChange(!Value.get(value))
    }),
    label != null
      ? Label(attr.class(`bu-text-${size} bu-nowrap`), label)
      : null,
    html.div(
      attr.class('bc-switch__track'),
      attr.class(
        Value.map(value, (v): string =>
          v ? 'bc-switch__track--on' : 'bc-switch__track--off'
        )
      ),
      offLabel != null
        ? html.div(
            aria.hidden(true),
            attr.class('bc-switch__track-label bc-switch__track-label--off'),
            attr.class(
              Value.map(value, (v): string =>
                v
                  ? 'bc-switch__track-label--hidden'
                  : 'bc-switch__track-label--visible'
              )
            ),
            offLabel
          )
        : null,

      onLabel != null
        ? html.div(
            attr.class('bc-switch__track-label bc-switch__track-label--on'),
            attr.class(
              Value.map(value, (v): string =>
                v
                  ? 'bc-switch__track-label--visible'
                  : 'bc-switch__track-label--hidden'
              )
            ),
            onLabel
          )
        : null,
      ElementRect(rect =>
        html.div(
          attr.class('bc-switch__thumb'),
          attr.class(
            Value.map(value, (v): string =>
              v ? 'bc-switch__thumb--on' : 'bc-switch__thumb--off'
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
}
