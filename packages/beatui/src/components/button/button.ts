import {
  attr,
  computedOf,
  Fragment,
  html,
  on,
  prop,
  style,
  TNode,
  Value,
  When,
  aria,
  Use,
  Empty,
} from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName } from '../../tokens'
import {
  backgroundValue,
  borderColorValue,
  hoverBackgroundValue,
  textColorValue,
  ExtendedColor,
} from '../theme/style-utils'
import { RadiusName } from '../../tokens/radius'
import { Icon } from '../data/icon'
import { ElementRect, Rect } from '@tempots/ui'
import { BeatUII18n } from '../../beatui-i18n'

/** Configuration options for the {@link Button} component. */
export interface ButtonOptions {
  /** The HTML button type attribute. @default 'button' */
  type?: Value<'submit' | 'reset' | 'button'>
  /** Whether the button is disabled and non-interactive. @default false */
  disabled?: Value<boolean>
  /** Whether to show a loading spinner and disable interaction. @default false */
  loading?: Value<boolean>
  /** Visual style variant controlling background, text, and border colors. @default 'filled' */
  variant?: Value<ButtonVariant>
  /** Size affecting padding, font size, and icon dimensions. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for the button's color scheme. @default 'base' */
  color?: Value<ThemeColorName>
  /** Border radius preset. @default 'sm' */
  roundedness?: Value<RadiusName>
  /** Callback invoked when the button is clicked. */
  onClick?: () => void
  /** Whether the button takes the full width of its container. @default false */
  fullWidth?: Value<boolean>
  /**
   * Whether to stop event propagation on click.
   * When true (default), prevents the click event from bubbling up.
   * Set to false if you need parent elements to receive click events (e.g., for Flyout triggers).
   * @default true
   */
  stopPropagation?: boolean
}

/**
 * Generates CSS class names for a button based on size, roundedness, loading state, and width.
 *
 * @param size - Control size for padding and text
 * @param roundedness - Border radius preset name
 * @param loading - Whether loading spinner is shown
 * @param fullWidth - Whether button is full-width
 * @returns Space-separated CSS class string
 */
export function generateButtonClasses(
  size: ControlSize,
  roundedness: RadiusName,
  loading: boolean,
  fullWidth: boolean
): string {
  const classes = [
    'bc-button',
    `bc-button--size-${size}`,
    `bc-control--padding-${size}`,
    `bc-control--rounded-${roundedness}`,
  ]

  if (loading) {
    classes.push('bc-button--loading')
  }

  if (fullWidth) {
    classes.push('bc-button--full-width')
  }
  return classes.join(' ')
}

/**
 * Generates inline CSS custom properties for button theming based on variant, color, and disabled state.
 * Sets background, text, border, hover, and text-shadow values for both light and dark modes.
 *
 * @param variant - The visual style variant
 * @param color - The theme color
 * @param disabled - Whether the button is disabled (suppresses hover styles)
 * @returns Semicolon-separated CSS custom property declarations
 */
export function generateButtonStyles(
  variant: ButtonVariant,
  color: ExtendedColor,
  disabled: boolean
): string {
  const styles = new Map<string, string>()

  styles.set('--button-text-shadow', 'var(--text-shadow-none)')
  styles.set('--button-text-shadow-dark', 'var(--text-shadow-none)')

  const ensureHover = (
    lightBg: string,
    darkBg: string,
    lightText: string,
    darkText: string
  ) => {
    if (disabled) return
    styles.set('--button-bg-hover', lightBg)
    styles.set('--button-text-hover', lightText)
    styles.set('--button-bg-hover-dark', darkBg)
    styles.set('--button-text-hover-dark', darkText)
  }

  switch (variant) {
    case 'filled': {
      const baseLight = backgroundValue(color, 'solid', 'light')
      const baseDark = backgroundValue(color, 'solid', 'dark')
      styles.set('--button-bg', baseLight.backgroundColor)
      styles.set('--button-text', baseLight.textColor)
      styles.set('--button-bg-dark', baseDark.backgroundColor)
      styles.set('--button-text-dark', baseDark.textColor)
      styles.set(
        '--button-text-shadow',
        'var(--text-shadow-button-filled, var(--text-shadow-sm))'
      )
      styles.set(
        '--button-text-shadow-dark',
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
      break
    }

    case 'light': {
      const baseLight = backgroundValue(color, 'light', 'light')
      const baseDark = backgroundValue(color, 'light', 'dark')
      styles.set('--button-bg', baseLight.backgroundColor)
      styles.set('--button-text', baseLight.textColor)
      styles.set('--button-bg-dark', baseDark.backgroundColor)
      styles.set('--button-text-dark', baseDark.textColor)

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

    case 'outline': {
      styles.set('--button-bg', 'transparent')
      styles.set('--button-bg-dark', 'transparent')
      styles.set('--button-border', borderColorValue(color, 'light'))
      styles.set('--button-border-dark', borderColorValue(color, 'dark'))
      styles.set('--button-text', textColorValue(color, 'light'))
      styles.set('--button-text-dark', textColorValue(color, 'dark'))
      styles.set(
        '--button-text-shadow',
        'var(--text-shadow-button-light, var(--text-shadow-xs))'
      )
      styles.set(
        '--button-text-shadow-dark',
        'var(--text-shadow-button-light, var(--text-shadow-xs))'
      )

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

    case 'dashed': {
      styles.set('--button-bg', 'transparent')
      styles.set('--button-bg-dark', 'transparent')
      styles.set('--button-border', borderColorValue(color, 'light'))
      styles.set('--button-border-dark', borderColorValue(color, 'dark'))
      styles.set('--button-border-style', 'dashed')
      styles.set('--button-text', textColorValue(color, 'light'))
      styles.set('--button-text-dark', textColorValue(color, 'dark'))

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

    case 'default': {
      const baseLight = backgroundValue('neutral', 'light', 'light')
      const baseDark = backgroundValue('neutral', 'light', 'dark')
      styles.set('--button-bg', baseLight.backgroundColor)
      styles.set('--button-text', textColorValue(color, 'light'))
      styles.set('--button-bg-dark', baseDark.backgroundColor)
      styles.set('--button-text-dark', textColorValue(color, 'dark'))
      styles.set(
        '--button-text-shadow',
        'var(--text-shadow-button-default, var(--text-shadow-2xs))'
      )
      styles.set(
        '--button-text-shadow-dark',
        'var(--text-shadow-button-default, var(--text-shadow-2xs))'
      )

      const hoverLight = hoverBackgroundValue('base', 'light', 'light')
      const hoverDark = hoverBackgroundValue('base', 'light', 'dark')
      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        styles.get('--button-text') ?? baseLight.textColor,
        styles.get('--button-text-dark') ?? baseDark.textColor
      )
      break
    }

    case 'text': {
      styles.set('--button-bg', 'transparent')
      styles.set('--button-bg-dark', 'transparent')
      styles.set('--button-text', textColorValue(color, 'light'))
      styles.set('--button-text-dark', textColorValue(color, 'dark'))
      if (!disabled) {
        styles.set('--button-hover-decoration', 'underline')
      }
      break
    }
  }

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * An interactive button component with theme-aware styling, loading state, and accessibility support.
 *
 * When `loading` is true, the button content is replaced with a spinning icon and the button is
 * disabled. The button preserves its dimensions during loading to prevent layout shift.
 * Screen readers are notified of the loading state via `aria-busy` and `aria-label`.
 *
 * For submit buttons (`type: 'submit'`), the default browser form submission behavior is preserved.
 * For other button types, `preventDefault()` is called automatically.
 *
 * @param options - Configuration for appearance, behavior, and state
 * @param children - Content to display inside the button (text, icons, etc.)
 * @returns A styled button element
 *
 * @example
 * ```typescript
 * Button(
 *   { variant: 'filled', color: 'primary', onClick: () => console.log('clicked') },
 *   'Save Changes'
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Button with loading state
 * const saving = prop(false)
 * Button(
 *   { variant: 'filled', color: 'success', loading: saving, onClick: handleSave },
 *   'Submit'
 * )
 * ```
 */
export function Button(
  {
    type = 'button',
    disabled = false,
    loading = false,
    variant = 'filled',
    size = 'md',
    color = 'base',
    roundedness = 'sm',
    onClick = () => {},
    fullWidth = false,
    stopPropagation = true,
  }: ButtonOptions,
  ...children: TNode[]
) {
  const buttonSize = prop<null | Rect>(null)
  return Use(BeatUII18n, t =>
    html.button(
      attr.type(type as Value<string>),
      attr.disabled(
        computedOf(
          disabled,
          loading
        )((disabled, loading) => disabled || loading)
      ),
      // Add ARIA attributes for accessibility
      aria.busy(loading ?? false),
      When(loading ?? false, () => aria.label(t.$.loadingExtended)),
      attr.class(
        computedOf(size, roundedness, loading, fullWidth)(generateButtonClasses)
      ),
      attr.style(computedOf(variant, color, disabled)(generateButtonStyles)),
      When(
        loading ?? false,
        () =>
          Fragment(
            style.width(
              buttonSize.map(rect => {
                if (rect == null) return ''
                return `${rect.width}px`
              })
            ),
            style.height(
              buttonSize.map(rect => {
                if (rect == null) return ''
                return `${rect.height}px`
              })
            ),
            Icon({ icon: 'line-md:loading-twotone-loop', size: size ?? 'md' }),
            // Hidden live region for screen reader announcements
            html.span(
              attr.class('sr-only'),
              aria.live('polite'),
              t.$.loadingExtended
            )
          ),
        () =>
          Fragment(
            on.click(e => {
              // Only prevent default for non-submit buttons
              // Submit buttons need default behavior to trigger form submission
              if (type !== 'submit') {
                e.preventDefault()
              }
              if (stopPropagation) {
                e.stopPropagation()
              }
              onClick()
            }),
            ...children
          )
      ),
      When(loading != null, () =>
        ElementRect(rect => {
          rect.on(r => {
            if (Value.get(loading ?? false)) return
            buttonSize.set(r)
          })
          return Empty
        })
      )
    )
  )
}
