import { attr, computedOf, Ensure, html, TNode, Value } from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'
import { Icon } from './icon'

/**
 * Size options for Avatar components.
 * Ranges from `'xs'` (24px) to `'2xl'` (96px).
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Configuration options for the {@link Avatar} component.
 */
export interface AvatarOptions {
  /** Image URL for the avatar. @default undefined */
  src?: Value<string | undefined>
  /** Name for generating initials fallback. @default undefined */
  name?: Value<string | undefined>
  /** Icon name (Iconify format) as a fallback. @default undefined */
  icon?: Value<string | undefined>
  /** Size of the avatar. @default 'md' */
  size?: Value<AvatarSize>
  /** Shape variant: circle or square. @default 'circle' */
  variant?: Value<'circle' | 'square'>
  /** Theme color for the avatar background. @default 'base' */
  color?: Value<ThemeColorName>
  /** Whether to add a border around the avatar. @default false */
  bordered?: Value<boolean>
}

/**
 * Extracts initials from a full name for avatar display.
 * Takes the first letter of the first word and the first letter of the last word.
 *
 * @param name - The full name to extract initials from
 * @returns A 1-2 character string containing the initials
 *
 * @example
 * ```ts
 * getInitials('John Doe') // 'JD'
 * getInitials('Alice') // 'A'
 * getInitials('Bob Smith Johnson') // 'BJ'
 * ```
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Generates inline CSS custom properties for avatar theming based on color.
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
 * Generates CSS class names for the avatar based on size, variant, and bordered state.
 *
 * @param size - Avatar size
 * @param variant - Shape variant (circle or square)
 * @param bordered - Whether to show border
 * @returns Space-separated CSS class string
 */
function generateAvatarClasses(
  size: AvatarSize,
  variant: 'circle' | 'square',
  bordered: boolean
): string {
  const classes = [
    'bc-avatar',
    `bc-avatar--size-${size}`,
    `bc-avatar--${variant}`,
  ]

  if (bordered) {
    classes.push('bc-avatar--bordered')
  }

  return classes.join(' ')
}

/**
 * Renders a user avatar with image, initials, or icon fallback.
 *
 * The Avatar component displays user profile images with graceful fallbacks:
 * 1. Image from `src` prop (if provided and loads successfully)
 * 2. Initials derived from `name` prop (if image fails or is not provided)
 * 3. Icon from `icon` prop (if provided and no name is available)
 * 4. Default user icon (if all else fails)
 *
 * Supports multiple sizes, shapes (circle or square), theme colors, and optional borders.
 * The component automatically applies the appropriate background color and text color
 * based on the theme color and appearance mode.
 *
 * @param options - Configuration for image, name, icon, size, shape, color, and border
 * @param children - Additional child nodes appended to the avatar container
 * @returns A div element containing the rendered avatar
 *
 * @example
 * ```typescript
 * // Avatar with image
 * Avatar({ src: 'https://example.com/avatar.jpg', name: 'John Doe', size: 'lg' })
 * ```
 *
 * @example
 * ```typescript
 * // Avatar with initials fallback
 * Avatar({ name: 'Jane Smith', color: 'primary', variant: 'square' })
 * ```
 *
 * @example
 * ```typescript
 * // Avatar with icon fallback
 * Avatar({ icon: 'mdi:account', size: 'xl', bordered: true })
 * ```
 */
export function Avatar(
  {
    src,
    name,
    icon,
    size = 'md',
    variant = 'circle',
    color = 'base',
    bordered = false,
  }: AvatarOptions,
  ...children: TNode[]
) {
  // Default icon fallback
  const defaultIcon = html.span(
    attr.class('bc-avatar__icon'),
    Icon({ icon: 'mdi:account', size: 'md' })
  )

  // Render the avatar container
  return html.div(
    attr.class(
      computedOf(
        size,
        variant,
        bordered
      )((s, v, b) =>
        generateAvatarClasses(s ?? 'md', v ?? 'circle', b ?? false)
      )
    ),
    attr.style(
      Value.map(color, c =>
        generateAvatarStyles((c ?? 'base') as ExtendedColor)
      )
    ),
    // Fallback chain: src → name (initials) → icon → default icon
    Ensure(
      src,
      srcVal =>
        html.img(
          attr.class('bc-avatar__image'),
          attr.src(srcVal),
          attr.alt(
            Ensure(
              name,
              n => n,
              () => 'Avatar'
            )
          )
        ),
      () =>
        Ensure(
          name,
          nameVal =>
            html.span(
              attr.class('bc-avatar__initials'),
              nameVal.map(n => getInitials(n))
            ),
          () =>
            Ensure(
              icon,
              iconVal =>
                html.span(
                  attr.class('bc-avatar__icon'),
                  Icon({ icon: iconVal, size: 'md' })
                ),
              () => defaultIcon
            )
        )
    ),
    ...children
  )
}
