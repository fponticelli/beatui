import {
  aria,
  attr,
  html,
  computedOf,
  on,
  Value,
  style,
  TNode,
  Use,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { ControlSize } from '../../theme/types'
import { Label } from '@/components/typography'
import { sessionId } from '../../../utils/session-id'
import { Locale } from '../../i18n/locale'

export type SwitchOptions = {
  value: Value<boolean>
  onChange: (value: boolean) => void
  offLabel?: TNode
  onLabel?: TNode
  label?: TNode
  disabled?: Value<boolean>
  size?: ControlSize
  id?: string
}

export const Switch = ({
  value,
  onChange,
  offLabel,
  onLabel,
  label,
  disabled = false,
  size = 'md',
  id,
}: SwitchOptions) => {
  // Generate unique IDs for accessibility
  const switchId = id ?? sessionId('switch')
  const labelId = `${switchId}-label`

  function generateSwitchClasses(disabled: boolean, size: ControlSize): string {
    const classes = ['bc-switch', `bc-switch--size-${size}`, `bc-switch--${size}`]

    if (disabled) {
      classes.push('bc-switch--disabled')
    }

    return classes.join(' ')
  }

  // Handle toggle action
  const handleToggle = () => {
    if (Value.get(disabled)) return
    onChange(!Value.get(value))
  }

  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (Value.get(disabled)) return

    // Toggle on Space or Enter key
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault() // Prevent page scroll on Space
      handleToggle()
    }
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
    attr.id(switchId),
    attr.role('switch'),
    attr.tabindex(
      Value.map(disabled, (disabled): number => (disabled ? -1 : 0))
    ),
    aria.checked(value as Value<boolean | 'mixed'>),
    aria.disabled(disabled),
    aria.labelledby(label != null ? labelId : undefined),
    on.click(handleToggle),
    on.keydown(handleKeyDown),
    label != null
      ? Label(
          attr.id(labelId),
          attr.class(`bc-switch__label bc-switch__label--size-${size} bc-switch__label--nowrap`),
          label
        )
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
        Use(Locale, ({ direction }) =>
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
                size,
                direction
              )((value, { width }, size, direction) => {
                const multiplier = (() => {
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

                // Calculate the translation distance
                const translateDistance =
                  direction === 'rtl'
                    ? `calc((var(--spacing-base) * ${multiplier}) - ${width}px)`
                    : `calc(${width}px - (var(--spacing-base) * ${multiplier}))`

                return value
                  ? `translateX(${translateDistance})`
                  : `translateX(0)`
              })
            )
          )
        )
      )
    )
  )
}
