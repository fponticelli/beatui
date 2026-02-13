import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'
import { AvatarSize } from './avatar'

/**
 * Configuration options for the {@link AvatarGroup} component.
 */
export interface AvatarGroupOptions {
  /** Size of avatars in the group. @default 'md' */
  size?: Value<AvatarSize>
  /** Spacing between avatars: 'tight' for overlap, 'normal' for standard gap. @default 'tight' */
  spacing?: Value<'tight' | 'normal'>
}

/**
 * Configuration options for the {@link AvatarGroupOverflow} component.
 */
export interface AvatarGroupOverflowOptions {
  /** Number to display in the overflow indicator (e.g., +5). */
  count: Value<number>
  /** Size matching the avatar group. @default 'md' */
  size?: Value<AvatarSize>
  /** Theme color for the overflow indicator background. @default 'base' */
  color?: Value<ThemeColorName>
}

/**
 * Generates inline CSS custom properties for avatar overflow theming based on color.
 * Sets background and text colors for both light and dark modes.
 *
 * @param color - The theme color
 * @returns Semicolon-separated CSS custom property declarations
 */
function generateAvatarStyles(color: ExtendedColor): string {
  const lightBg = backgroundValue(color, 'solid', 'light')
  const darkBg = backgroundValue(color, 'solid', 'dark')
  return [
    `--avatar-bg: ${lightBg.backgroundColor}`,
    `--avatar-text: ${lightBg.textColor}`,
    `--avatar-bg-dark: ${darkBg.backgroundColor}`,
    `--avatar-text-dark: ${darkBg.textColor}`,
  ].join('; ')
}

/**
 * Renders a container for grouping multiple Avatar components with overlapping or spaced layout.
 *
 * The AvatarGroup component provides a styled container for displaying multiple avatars
 * in a row. It supports two spacing modes:
 * - **tight**: Avatars overlap with negative margin for a compact, stacked appearance
 * - **normal**: Avatars are spaced with standard gap
 *
 * The group automatically applies consistent sizing to all child avatars via CSS classes.
 * For displaying overflow (e.g., "+5 more"), use the {@link AvatarGroupOverflow} component.
 *
 * @param options - Configuration for size and spacing
 * @param children - Avatar components to display in the group
 * @returns A div element containing the avatar group
 *
 * @example
 * ```typescript
 * AvatarGroup({ size: 'lg', spacing: 'tight' },
 *   Avatar({ src: 'user1.jpg', name: 'Alice' }),
 *   Avatar({ src: 'user2.jpg', name: 'Bob' }),
 *   Avatar({ src: 'user3.jpg', name: 'Charlie' }),
 *   AvatarGroupOverflow({ count: 5 })
 * )
 * ```
 */
export function AvatarGroup(
  { size = 'md', spacing = 'tight' }: AvatarGroupOptions,
  ...children: TNode[]
) {
  return html.div(
    attr.class(
      computedOf(
        size,
        spacing
      )((s, sp) =>
        [
          'bc-avatar-group',
          `bc-avatar-group--size-${s ?? 'md'}`,
          `bc-avatar-group--spacing-${sp ?? 'tight'}`,
        ].join(' ')
      )
    ),
    ...children
  )
}

/**
 * Renders an overflow indicator for AvatarGroup showing the count of hidden avatars.
 *
 * This component displays a styled avatar-like element with a "+N" label indicating
 * how many additional avatars are not shown in the group. It should be used as the
 * last child of an {@link AvatarGroup}.
 *
 * The overflow indicator inherits the styling of the avatar group and matches the
 * size of other avatars in the group.
 *
 * @param options - Configuration for count, size, and color
 * @returns A div element styled as an avatar showing the overflow count
 *
 * @example
 * ```typescript
 * AvatarGroup({ size: 'md', spacing: 'tight' },
 *   Avatar({ name: 'Alice' }),
 *   Avatar({ name: 'Bob' }),
 *   Avatar({ name: 'Charlie' }),
 *   AvatarGroupOverflow({ count: 7, color: 'primary' })
 * )
 * // Displays: [A] [B] [C] [+7]
 * ```
 */
export function AvatarGroupOverflow({
  count,
  size = 'md',
  color = 'base',
}: AvatarGroupOverflowOptions) {
  return html.div(
    attr.class(
      Value.map(size, s =>
        [
          'bc-avatar',
          `bc-avatar--size-${s ?? 'md'}`,
          'bc-avatar--circle',
          'bc-avatar-group__overflow',
        ].join(' ')
      )
    ),
    attr.style(
      Value.map(color, c =>
        generateAvatarStyles((c ?? 'base') as ExtendedColor)
      )
    ),
    html.span(
      attr.class('bc-avatar__initials'),
      Value.map(count, c => `+${c ?? 0}`)
    )
  )
}
