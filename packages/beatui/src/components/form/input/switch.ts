import {
  aria,
  attr,
  html,
  computedOf,
  on,
  Value,
  TNode,
} from '@tempots/dom'
import { ControlSize } from '../../theme/types'
import { sessionId } from '../../../utils/session-id'
import { ThemeColorName } from '../../../tokens'
import { backgroundValue, borderColorValue } from '../../theme/style-utils'

/**
 * Configuration options for the {@link Switch} component.
 *
 * Defines the properties for a toggle switch including its value, event callbacks,
 * optional on/off labels, visual size, theme color, and accessibility attributes.
 */
export type SwitchOptions = {
  /** The current boolean state of the switch (on/off) */
  value: Value<boolean>
  /** Callback invoked when the switch value changes (typically on click or keyboard toggle) */
  onChange?: (value: boolean) => void
  /** Callback invoked on every input event (fires alongside onChange) */
  onInput?: (value: boolean) => void
  /** Callback invoked when the switch loses focus */
  onBlur?: () => void
  /** Optional label displayed when the switch is in the off state */
  offLabel?: TNode
  /** Optional label displayed when the switch is in the on state */
  onLabel?: TNode
  /** Whether the switch is disabled and cannot be toggled. @default false */
  disabled?: Value<boolean>
  /** Visual size of the switch. @default 'md' */
  size?: ControlSize
  /** Unique HTML id attribute for the switch element */
  id?: string
  /** Theme color for the switch track when on. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Tab index for keyboard navigation order. @default 0 */
  tabIndex?: Value<number>
  /** Whether to add vertical padding so the switch matches the height of text inputs at the same size. @default true */
  matchInputHeight?: boolean
}

/**
 * A toggle switch component for boolean on/off states with animated thumb transition.
 *
 * Renders a custom switch control with ARIA `role="switch"` semantics, full keyboard
 * support (Space and Enter to toggle), and a sliding thumb animation. The switch track
 * color is theme-aware and configurable via the `color` property. Optional on/off labels
 * appear inside the track and cross-fade based on the current state. The thumb position
 * is controlled entirely via CSS using `inset-inline-start`, which handles RTL
 * automatically via the logical property.
 *
 * @param options - Configuration options for the switch
 * @returns A styled switch element with animated thumb and optional labels
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { Switch } from '@tempots/beatui'
 *
 * const enabled = prop(false)
 * Switch({
 *   value: enabled,
 *   onChange: enabled.set,
 *   size: 'md',
 *   color: 'primary',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With on/off labels
 * Switch({
 *   value: prop(true),
 *   onChange: (v) => console.log('Toggled:', v),
 *   onLabel: 'ON',
 *   offLabel: 'OFF',
 *   color: 'green',
 *   size: 'lg',
 * })
 * ```
 */
export const Switch = ({
  value,
  onChange,
  onInput,
  onBlur,
  offLabel,
  onLabel,
  disabled = false,
  size = 'md',
  id,
  color = 'primary',
  tabIndex = 0,
  matchInputHeight = true,
}: SwitchOptions) => {
  // Generate unique IDs for accessibility
  const switchId = id ?? sessionId('switch')

  function generateSwitchClasses(disabled: boolean, size: ControlSize): string {
    const classes = [
      'bc-switch',
      `bc-switch--size-${size}`,
      `bc-switch--${size}`,
    ]

    if (matchInputHeight) {
      classes.push('bc-switch--match-input')
    }

    if (disabled) {
      classes.push('bc-switch--disabled')
    }

    return classes.join(' ')
  }

  function generateSwitchStyles(color?: ThemeColorName): string {
    const resolvedColor = color ?? 'primary'
    const styles = new Map<string, string>()

    const light = backgroundValue(resolvedColor, 'solid', 'light')
    const dark = backgroundValue(resolvedColor, 'solid', 'dark')

    styles.set('--switch-track-on-bg', light.backgroundColor)
    styles.set('--switch-track-on-label', light.textColor)
    styles.set('--switch-track-on-bg-dark', dark.backgroundColor)
    styles.set('--switch-track-on-label-dark', dark.textColor)
    styles.set(
      '--switch-track-on-border-dark',
      borderColorValue(resolvedColor, 'dark')
    )

    return Array.from(styles.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
  }

  // Handle toggle action
  const handleToggle = () => {
    if (Value.get(disabled)) return
    onChange?.(!Value.get(value))
    onInput?.(!Value.get(value))
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
    attr.style(
      computedOf(color)(currentColor =>
        generateSwitchStyles(currentColor as ThemeColorName | undefined)
      )
    ),
    attr.id(switchId),
    attr.role('switch'),
    attr.tabindex(
      computedOf(
        disabled ?? false,
        tabIndex
      )((disabled, tabIndex) => (disabled ? -1 : (tabIndex ?? 0)))
    ),
    aria.checked(value as Value<boolean | 'mixed'>),
    aria.disabled(disabled),
    on.click(handleToggle),
    on.keydown(handleKeyDown),
    onBlur != null ? on.blur(onBlur) : null,
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
      html.div(
        attr.class('bc-switch__thumb'),
        attr.class(
          Value.map(value, (v): string =>
            v ? 'bc-switch__thumb--on' : 'bc-switch__thumb--off'
          )
        )
      )
    )
  )
}
