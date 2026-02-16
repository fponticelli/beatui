import {
  aria,
  attr,
  computedOf,
  html,
  style,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { RadiusName } from '../../tokens/radius'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'

/**
 * Configuration options for the {@link ProgressBar} component.
 */
export interface ProgressBarOptions {
  /** Current progress value (0 to max). @default 0 */
  value?: Value<number>
  /** Maximum value for the progress bar. @default 100 */
  max?: Value<number>
  /** Visual size variant. @default 'md' */
  size?: Value<'sm' | 'md' | 'lg'>
  /** Theme color for the progress fill. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Whether to show indeterminate loading animation. @default false */
  indeterminate?: Value<boolean>
  /** Whether to show percentage text label. @default false */
  showLabel?: Value<boolean>
  /** Border radius preset for the progress bar. @default 'full' */
  roundedness?: Value<RadiusName>
}

/**
 * Generates CSS class names for the progress bar based on size and indeterminate state.
 *
 * @param size - Size variant (sm, md, lg)
 * @param indeterminate - Whether in indeterminate state
 * @param roundedness - Border radius preset
 * @returns Space-separated CSS class string
 */
export function generateProgressBarClasses(
  size: 'sm' | 'md' | 'lg',
  indeterminate: boolean,
  roundedness: RadiusName
): string {
  const classes = [
    'bc-progress-bar',
    `bc-progress-bar--size-${size}`,
    `bc-control--rounded-${roundedness}`,
  ]

  if (indeterminate) {
    classes.push('bc-progress-bar--indeterminate')
  }

  return classes.join(' ')
}

/**
 * Generates inline CSS custom properties for progress bar theming based on color.
 * Sets fill and track colors for both light and dark modes.
 *
 * @param color - The theme color
 * @returns Semicolon-separated CSS custom property declarations
 */
export function generateProgressBarStyles(color: ExtendedColor): string {
  const styles = new Map<string, string>()

  const fillLight = backgroundValue(color, 'solid', 'light')
  const fillDark = backgroundValue(color, 'solid', 'dark')

  styles.set('--progress-fill', fillLight.backgroundColor)
  styles.set('--progress-fill-dark', fillDark.backgroundColor)

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * A horizontal progress bar component that shows completion status.
 * Supports determinate (with value) and indeterminate (loading) states,
 * configurable sizing, theming, and optional percentage labels.
 *
 * Uses ARIA progressbar role with proper attributes for accessibility.
 *
 * @param options - Configuration for value, size, color, and display options
 * @returns A styled progress bar element with track and fill
 *
 * @example
 * ```typescript
 * // Basic determinate progress bar
 * ProgressBar({ value: 65, max: 100 })
 * ```
 *
 * @example
 * ```typescript
 * // With label showing percentage
 * ProgressBar({ value: 75, showLabel: true, color: 'success' })
 * ```
 *
 * @example
 * ```typescript
 * // Indeterminate loading state
 * ProgressBar({ indeterminate: true, color: 'primary' })
 * ```
 *
 * @example
 * ```typescript
 * // Custom sizing and color
 * ProgressBar({
 *   value: 42,
 *   max: 100,
 *   size: 'lg',
 *   color: 'warning',
 *   roundedness: 'sm'
 * })
 * ```
 */
export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  indeterminate = false,
  showLabel = false,
  roundedness = 'full',
}: ProgressBarOptions): TNode {
  // Calculate percentage for display and width
  const percentage = computedOf(
    value,
    max
  )((v, m) => {
    const val = v ?? 0
    const maxVal = m ?? 100
    return maxVal > 0 ? Math.min(Math.max((val / maxVal) * 100, 0), 100) : 0
  })

  // Format percentage text
  const percentageText = Value.map(percentage, p => `${Math.round(p)}%`)

  // Fill width: empty string for indeterminate, percentage for determinate
  const fillWidth = computedOf(
    percentage,
    indeterminate
  )((p, i) => ((i ?? false) ? '' : `${p}%`))

  return html.div(
    attr.class('bc-progress-bar-wrapper'),
    html.div(
      attr.class(
        computedOf(
          size,
          indeterminate,
          roundedness
        )((s, i, r) =>
          generateProgressBarClasses(s ?? 'md', i ?? false, r ?? 'full')
        )
      ),
      attr.style(
        Value.map(color, c =>
          generateProgressBarStyles((c ?? 'primary') as ExtendedColor)
        )
      ),
      attr.role('progressbar'),
      aria.valuemin(0),
      aria.valuemax(max),
      aria.valuenow(value),
      aria.valuetext(percentageText),

      html.div(
        attr.class('bc-progress-bar__track'),
        html.div(attr.class('bc-progress-bar__fill'), style.width(fillWidth))
      )
    ),

    // Optional label
    When(
      showLabel,
      () =>
        html.div(
          attr.class('bc-progress-bar__label'),
          aria.hidden(true),
          percentageText
        ),
      () => undefined
    )
  )
}
