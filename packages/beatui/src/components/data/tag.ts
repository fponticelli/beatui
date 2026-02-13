import { attr, Empty, html, Value, computedOf, Use } from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { ControlSize } from '../theme'
import { CloseButton } from '../button'
import { BeatUII18n } from '../../beatui-i18n'
import {
  backgroundValue,
  hoverBackgroundValue,
  ExtendedColor,
} from '../theme/style-utils'

function generateTagClasses(size: ControlSize, disabled: boolean): string {
  const classes = ['bc-tag']
  if (size !== 'md') {
    classes.push(`bc-tag--${size}`)
  }
  if (disabled) {
    classes.push('bc-tag--disabled')
  }
  return classes.join(' ')
}

function generateTagStyles(color: ExtendedColor): string {
  const baseLight = backgroundValue(color, 'light', 'light')
  const baseDark = backgroundValue(color, 'light', 'dark')
  const hoverLight = hoverBackgroundValue(color, 'light', 'light')
  const hoverDark = hoverBackgroundValue(color, 'light', 'dark')

  return [
    `--tag-bg: ${baseLight.backgroundColor}`,
    `--tag-text: ${baseLight.textColor}`,
    `--tag-bg-dark: ${baseDark.backgroundColor}`,
    `--tag-text-dark: ${baseDark.textColor}`,
    `--tag-bg-hover: ${hoverLight.backgroundColor}`,
    `--tag-text-hover: ${hoverLight.textColor}`,
    `--tag-bg-hover-dark: ${hoverDark.backgroundColor}`,
    `--tag-text-hover-dark: ${hoverDark.textColor}`,
  ].join('; ')
}

/**
 * A small label component for categorization, filtering, or displaying metadata.
 * Supports optional close button for removable tags and theme-aware color styling.
 *
 * When an `onClose` callback is provided, a close button is rendered alongside the tag text.
 * The tag automatically adapts to light and dark themes using CSS custom properties.
 *
 * @param options - Tag configuration
 * @param options.value - Reactive string displayed as the tag label
 * @param options.color - Theme color for the tag background and text (default: 'base')
 * @param options.onClose - Callback when the close button is clicked; receives the current tag value
 * @param options.size - Size of the tag (default: 'md')
 * @param options.class - Additional CSS class(es) to apply
 * @param options.disabled - Whether the tag and its close button are disabled
 * @returns A styled span element representing the tag
 *
 * @example
 * ```typescript
 * Tag({ value: 'TypeScript', color: 'primary' })
 * ```
 *
 * @example
 * ```typescript
 * // Removable tag
 * const tags = prop(['React', 'Vue', 'Solid'])
 * ForEach(tags, tag =>
 *   Tag({
 *     value: tag,
 *     color: 'info',
 *     onClose: (v) => tags.set(tags.value.filter(t => t !== v))
 *   })
 * )
 * ```
 */
export const Tag = ({
  value,
  color = 'base',
  onClose,
  size = 'md',
  class: cls,
  disabled,
}: {
  /** Reactive string displayed as the tag label. */
  value: Value<string>
  /** Theme color for the tag background and text. @default 'base' */
  color?: Value<ThemeColorName>
  /** Callback when the close button is clicked; receives the current tag value. */
  onClose?: (value: string) => void
  /** Size of the tag. @default 'md' */
  size?: Value<ControlSize>
  /** Additional CSS class(es) to apply. */
  class?: Value<string>
  /** Whether the tag and its close button are disabled. */
  disabled?: Value<boolean>
}) => {
  return html.span(
    attr.class(
      computedOf(
        size ?? 'md',
        disabled ?? false
      )((size, disabled) => generateTagClasses(size, disabled))
    ),
    attr.style(
      computedOf(color)(color =>
        generateTagStyles((color ?? 'base') as ExtendedColor)
      )
    ),
    // Allow external classes like bc-tag--disabled to be applied
    attr.class(cls),
    html.span(value),
    onClose != null
      ? Use(BeatUII18n, t =>
          CloseButton(
            {
              size: 'xs',
              label: t.$.removeItem,
              color: 'white',
              disabled,
              onClick: () => onClose?.(Value.get(value)),
            },
            attr.class('bc-tag__close')
          )
        )
      : Empty
  )
}
