import { attr, computedOf, html, TNode, Value, aria } from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName } from '../../tokens'
import { RadiusName } from '../../tokens/radius'
import { ToggleButton } from './toggle-button'

/**
 * Describes a single item within a {@link ToggleButtonGroup}.
 */
export interface ToggleButtonGroupItem {
  /** Unique key identifying this item within the group */
  key: string
  /** Content rendered inside the toggle button (text, icons, or any TNode) */
  label: TNode
  /** Whether this specific button is disabled. @default false */
  disabled?: boolean
}

/**
 * Configuration options for the {@link ToggleButtonGroup} component.
 */
export interface ToggleButtonGroupOptions {
  /** The toggle button items to render */
  items: ToggleButtonGroupItem[]
  /** Array of currently selected item keys */
  value: Value<string[]>
  /** Callback invoked when the selection changes */
  onChange?: (value: string[]) => void
  /**
   * Whether multiple items can be selected simultaneously.
   * When false, selecting an item deselects all others.
   * @default false
   */
  multiple?: Value<boolean>
  /** Whether the entire group is disabled. @default false */
  disabled?: Value<boolean>
  /** Visual style variant applied to all buttons. @default 'outline' */
  variant?: Value<ButtonVariant>
  /** Size affecting padding, font size, and dimensions. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for pressed buttons. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Border radius preset for the group's outer corners. @default 'sm' */
  roundedness?: Value<RadiusName>
  /**
   * Layout orientation of the button group.
   * @default 'horizontal'
   */
  orientation?: Value<'horizontal' | 'vertical'>
}

function generateGroupClasses(
  orientation: 'horizontal' | 'vertical',
  roundedness: RadiusName
): string {
  return [
    'bc-toggle-button-group',
    `bc-toggle-button-group--${orientation}`,
    `bc-toggle-button-group--rounded-${roundedness}`,
  ].join(' ')
}

/**
 * A group container for toggle buttons that manages single or multiple
 * selection. Buttons are visually connected with shared borders and
 * the group's outer corners use the specified border radius.
 *
 * Uses `role="group"` for accessibility. In single-selection mode,
 * selecting a button deselects all others (like a radio group).
 * In multiple-selection mode, each button toggles independently.
 *
 * @param options - Configuration for the toggle button group
 * @returns A styled group of toggle buttons
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { ToggleButtonGroup } from '@tempots/beatui'
 *
 * // Single selection
 * const alignment = prop<string[]>(['left'])
 * ToggleButtonGroup({
 *   items: [
 *     { key: 'left', label: 'Left' },
 *     { key: 'center', label: 'Center' },
 *     { key: 'right', label: 'Right' },
 *   ],
 *   value: alignment,
 *   onChange: alignment.set,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Multiple selection
 * const formats = prop<string[]>([])
 * ToggleButtonGroup({
 *   items: [
 *     { key: 'bold', label: 'B' },
 *     { key: 'italic', label: 'I' },
 *     { key: 'underline', label: 'U' },
 *   ],
 *   value: formats,
 *   onChange: formats.set,
 *   multiple: true,
 *   variant: 'outline',
 * })
 * ```
 */
export function ToggleButtonGroup({
  items,
  value,
  onChange,
  multiple = false,
  disabled = false,
  variant = 'outline',
  size = 'md',
  color = 'primary',
  roundedness = 'sm',
  orientation = 'horizontal',
}: ToggleButtonGroupOptions) {
  const handleToggle = (key: string, pressed: boolean) => {
    const currentValue = Value.get(value)
    const isMultiple = Value.get(multiple)

    let newValue: string[]
    if (isMultiple) {
      newValue = pressed
        ? [...currentValue, key]
        : currentValue.filter(k => k !== key)
    } else {
      newValue = pressed ? [key] : []
    }

    onChange?.(newValue)
  }

  return html.div(
    attr.role('group'),
    attr.class(computedOf(orientation, roundedness)(generateGroupClasses)),
    aria.orientation(orientation),
    ...items.map(item => {
      const itemPressed = Value.map(value, v => v.includes(item.key))
      const itemDisabled = item.disabled
        ? Value.map(disabled, d => d || item.disabled!)
        : disabled

      return ToggleButton(
        {
          pressed: itemPressed,
          onToggle: pressed => handleToggle(item.key, pressed),
          disabled: itemDisabled,
          variant,
          size,
          color,
          roundedness: 'none',
          fullWidth: false,
        },
        item.label
      )
    })
  )
}
