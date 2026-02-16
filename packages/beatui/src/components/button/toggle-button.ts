import { attr, computedOf, html, on, TNode, Value, aria } from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName, getColorVar } from '../../tokens'
import {
  backgroundValue,
  borderColorValue,
  hoverBackgroundValue,
  textColorValue,
  ExtendedColor,
} from '../theme/style-utils'
import { RadiusName } from '../../tokens/radius'

/**
 * Configuration options for the {@link ToggleButton} component.
 */
export interface ToggleButtonOptions {
  /** Whether the button is currently pressed/active. */
  pressed: Value<boolean>
  /** Callback invoked when the button is toggled. */
  onToggle?: (pressed: boolean) => void
  /** Whether the button is disabled. @default false */
  disabled?: Value<boolean>
  /** Visual style variant. @default 'outline' */
  variant?: Value<ButtonVariant>
  /** Size affecting padding, font size, and icon dimensions. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for the pressed state. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Border radius preset. @default 'sm' */
  roundedness?: Value<RadiusName>
  /** Whether the button takes the full width of its container. @default false */
  fullWidth?: Value<boolean>
}

function generateToggleButtonClasses(
  size: ControlSize,
  roundedness: RadiusName,
  fullWidth: boolean,
  pressed: boolean
): string {
  const classes = [
    'bc-toggle-button',
    `bc-toggle-button--size-${size}`,
    `bc-control--padding-${size}`,
    `bc-control--rounded-${roundedness}`,
  ]
  if (fullWidth) classes.push('bc-toggle-button--full-width')
  if (pressed) classes.push('bc-toggle-button--pressed')
  return classes.join(' ')
}

function generateToggleButtonStyles(
  variant: ButtonVariant,
  color: ExtendedColor,
  pressed: boolean,
  disabled: boolean
): string {
  const styles = new Map<string, string>()

  styles.set('--toggle-text-shadow', 'var(--text-shadow-none)')
  styles.set('--toggle-text-shadow-dark', 'var(--text-shadow-none)')

  const ensureHover = (
    lightBg: string,
    darkBg: string,
    lightText: string,
    darkText: string
  ) => {
    if (disabled) return
    styles.set('--toggle-bg-hover', lightBg)
    styles.set('--toggle-text-hover', lightText)
    styles.set('--toggle-bg-hover-dark', darkBg)
    styles.set('--toggle-text-hover-dark', darkText)
  }

  if (pressed) {
    // Pressed state always uses filled style
    const baseLight = backgroundValue(color, 'solid', 'light')
    const baseDark = backgroundValue(color, 'solid', 'dark')
    styles.set('--toggle-bg', baseLight.backgroundColor)
    styles.set('--toggle-text', baseLight.textColor)
    styles.set('--toggle-bg-dark', baseDark.backgroundColor)
    styles.set('--toggle-text-dark', baseDark.textColor)
    styles.set('--toggle-border', baseLight.backgroundColor)
    styles.set('--toggle-border-dark', baseDark.backgroundColor)
    styles.set(
      '--toggle-text-shadow',
      'var(--text-shadow-button-filled, var(--text-shadow-sm))'
    )
    styles.set(
      '--toggle-text-shadow-dark',
      'var(--text-shadow-button-filled, var(--text-shadow-sm))'
    )

    const hoverLight = hoverBackgroundValue(color, 'solid', 'light')
    const hoverDark = hoverBackgroundValue(color, 'solid', 'dark')
    ensureHover(
      hoverLight.backgroundColor,
      hoverDark.backgroundColor,
      hoverLight.textColor,
      hoverDark.textColor
    )
  } else {
    // Unpressed state depends on variant
    switch (variant) {
      case 'outline':
      case 'dashed': {
        styles.set('--toggle-bg', 'transparent')
        styles.set('--toggle-bg-dark', 'transparent')
        styles.set('--toggle-border', borderColorValue(color, 'light'))
        styles.set('--toggle-border-dark', borderColorValue(color, 'dark'))
        styles.set('--toggle-text', textColorValue(color, 'light'))
        styles.set('--toggle-text-dark', textColorValue(color, 'dark'))
        if (variant === 'dashed') {
          styles.set('--toggle-border-style', 'dashed')
        }

        const hoverLight = hoverBackgroundValue(color, 'light', 'light')
        const hoverDark = hoverBackgroundValue(color, 'light', 'dark')
        ensureHover(
          hoverLight.backgroundColor,
          hoverDark.backgroundColor,
          hoverLight.textColor,
          hoverDark.textColor
        )
        break
      }
      case 'light': {
        const baseLight = backgroundValue(color, 'light', 'light')
        const baseDark = backgroundValue(color, 'light', 'dark')
        styles.set('--toggle-bg', baseLight.backgroundColor)
        styles.set('--toggle-text', baseLight.textColor)
        styles.set('--toggle-bg-dark', baseDark.backgroundColor)
        styles.set('--toggle-text-dark', baseDark.textColor)

        const hoverLight = hoverBackgroundValue(color, 'light', 'light')
        const hoverDark = hoverBackgroundValue(color, 'light', 'dark')
        ensureHover(
          hoverLight.backgroundColor,
          hoverDark.backgroundColor,
          hoverLight.textColor,
          hoverDark.textColor
        )
        break
      }
      case 'filled': {
        const baseLight = backgroundValue('neutral', 'light', 'light')
        const baseDark = backgroundValue('neutral', 'light', 'dark')
        styles.set('--toggle-bg', baseLight.backgroundColor)
        styles.set('--toggle-text', textColorValue(color, 'light'))
        styles.set('--toggle-bg-dark', baseDark.backgroundColor)
        styles.set('--toggle-text-dark', textColorValue(color, 'dark'))

        const hoverLight = hoverBackgroundValue('base', 'light', 'light')
        const hoverDark = hoverBackgroundValue('base', 'light', 'dark')
        ensureHover(
          hoverLight.backgroundColor,
          hoverDark.backgroundColor,
          styles.get('--toggle-text') ?? baseLight.textColor,
          styles.get('--toggle-text-dark') ?? baseDark.textColor
        )
        break
      }
      case 'default': {
        const baseLight = backgroundValue('neutral', 'light', 'light')
        const baseDark = backgroundValue('neutral', 'light', 'dark')
        styles.set('--toggle-bg', baseLight.backgroundColor)
        styles.set('--toggle-text', textColorValue(color, 'light'))
        styles.set('--toggle-bg-dark', baseDark.backgroundColor)
        styles.set('--toggle-text-dark', textColorValue(color, 'dark'))
        // Subtle border — lighter than outline
        styles.set('--toggle-border', getColorVar('neutral', 300))
        styles.set('--toggle-border-dark', getColorVar('neutral', 700))

        const hoverLight = hoverBackgroundValue('base', 'light', 'light')
        const hoverDark = hoverBackgroundValue('base', 'light', 'dark')
        ensureHover(
          hoverLight.backgroundColor,
          hoverDark.backgroundColor,
          styles.get('--toggle-text') ?? baseLight.textColor,
          styles.get('--toggle-text-dark') ?? baseDark.textColor
        )
        break
      }
      default: {
        // 'text' variant — no border
        const baseLight = backgroundValue('neutral', 'light', 'light')
        const baseDark = backgroundValue('neutral', 'light', 'dark')
        styles.set('--toggle-bg', baseLight.backgroundColor)
        styles.set('--toggle-text', textColorValue(color, 'light'))
        styles.set('--toggle-bg-dark', baseDark.backgroundColor)
        styles.set('--toggle-text-dark', textColorValue(color, 'dark'))

        const hoverLight = hoverBackgroundValue('base', 'light', 'light')
        const hoverDark = hoverBackgroundValue('base', 'light', 'dark')
        ensureHover(
          hoverLight.backgroundColor,
          hoverDark.backgroundColor,
          styles.get('--toggle-text') ?? baseLight.textColor,
          styles.get('--toggle-text-dark') ?? baseDark.textColor
        )
        break
      }
    }
  }

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * A toggle button that can be pressed/unpressed, similar to a checkbox
 * but styled as a button with visual feedback for the pressed state.
 *
 * Uses `aria-pressed` for accessibility. When pressed, the button displays
 * a filled appearance using the specified color; when unpressed, it shows
 * the variant's default appearance.
 *
 * @param options - Configuration for the toggle button
 * @param children - Content to display inside the button
 * @returns A styled toggle button element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { ToggleButton } from '@tempots/beatui'
 *
 * const bold = prop(false)
 * ToggleButton(
 *   { pressed: bold, onToggle: bold.set, variant: 'outline' },
 *   'B'
 * )
 * ```
 *
 * @example
 * ```ts
 * // Icon toggle
 * const starred = prop(false)
 * ToggleButton(
 *   { pressed: starred, onToggle: starred.set, color: 'yellow' },
 *   Icon({ icon: starred.map(s => s ? 'lucide:star' : 'lucide:star-off') })
 * )
 * ```
 */
export function ToggleButton(
  {
    pressed,
    onToggle,
    disabled = false,
    variant = 'outline',
    size = 'md',
    color = 'primary',
    roundedness = 'sm',
    fullWidth = false,
  }: ToggleButtonOptions,
  ...children: TNode[]
) {
  return html.button(
    attr.type('button'),
    attr.disabled(disabled),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aria.pressed(pressed as any),
    attr.class(
      computedOf(
        size,
        roundedness,
        fullWidth,
        pressed
      )(generateToggleButtonClasses)
    ),
    attr.style(
      computedOf(variant, color, pressed, disabled)(generateToggleButtonStyles)
    ),
    on.click(e => {
      e.preventDefault()
      e.stopPropagation()
      if (!Value.get(disabled)) {
        onToggle?.(!Value.get(pressed))
      }
    }),
    ...children
  )
}
