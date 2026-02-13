import { attr, computedOf, html, TNode, Value, When } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import type { NavigationOptions } from '@tempots/ui'
import { buildNavigationOptions } from './navigation-options'
import { ThemeColorName } from '../../../tokens'
import { textColorValue } from '../../theme/style-utils'

/**
 * Visual style variant for the {@link Link} component.
 *
 * - `'default'` - Standard underlined link appearance.
 * - `'plain'` - No underline; inherits text color.
 * - `'hover'` - Underline appears only on hover.
 */
export type LinkVariant = 'default' | 'plain' | 'hover'

/**
 * Configuration options for the {@link Link} component.
 */
export interface LinkOptions {
  /**
   * The URL or path that the link navigates to.
   */
  href: Value<string>
  /**
   * Visual style variant controlling underline behavior.
   * @default 'default'
   */
  variant?: Value<LinkVariant>
  /**
   * Theme color applied to the link text and hover state.
   * @default 'primary'
   */
  color?: Value<ThemeColorName>
  /**
   * Theme color applied to the link text when disabled.
   * @default 'base'
   */
  colorDisabled?: Value<ThemeColorName>
  /**
   * Whether the link is disabled. When `true`, the link renders as a non-interactive
   * `<span>` element instead of an anchor.
   * @default false
   */
  disabled?: Value<boolean>
  /**
   * Whether to use the View Transitions API for navigation animations.
   * @default true
   */
  viewTransition?: boolean
  /**
   * Optional state object to pass to the navigation history entry.
   */
  state?: NavigationOptions['state']
  /**
   * Scroll behavior after navigation (e.g., scroll to top or preserve position).
   */
  scroll?: NavigationOptions['scroll']
  /**
   * Whether to replace the current history entry instead of pushing a new one.
   */
  replace?: NavigationOptions['replace']
  /**
   * Target attribute for the anchor element (e.g., `'_blank'` for new tab).
   */
  target?: Value<string>
  /**
   * Relationship attribute for the anchor element (e.g., `'noopener noreferrer'`).
   */
  rel?: Value<string>
}

/**
 * Generates the CSS class string for the link based on its variant and disabled state.
 *
 * @param variant - The visual style variant
 * @param disabled - Whether the link is disabled
 * @returns A space-separated CSS class string
 */
export function generateLinkClasses(
  variant: LinkVariant,
  disabled: boolean
): string {
  const classes = ['bc-link']

  // Add disabled class
  if (disabled) {
    classes.push('bc-link--disabled')
  } else {
    // Add variant class
    switch (variant) {
      case 'plain':
        classes.push('bc-link--plain')
        break
      case 'hover':
        classes.push('bc-link--hover')
        break
      case 'default':
      default:
        classes.push('bc-link--default')
        break
    }
  }

  return classes.join(' ')
}

/**
 * Generates the inline CSS custom properties for link color theming in both light and dark modes.
 *
 * @param color - The theme color name to use for link text
 * @returns A semicolon-separated CSS custom property string
 */
export function generateLinkStyles(color: ThemeColorName): string {
  const light = textColorValue(color, 'light')
  const dark = textColorValue(color, 'dark')
  return [
    `--link-color: ${light}`,
    `--link-color-dark: ${dark}`,
    `--link-hover-color: ${light}`,
    `--link-hover-color-dark: ${dark}`,
  ].join('; ')
}

/**
 * Themed navigation link component with support for client-side routing, view transitions,
 * and disabled state.
 *
 * When enabled, renders as an `Anchor` element from `@tempots/ui` with client-side navigation.
 * When disabled, renders as a `<span>` element with disabled styling to prevent interaction.
 *
 * @param options - Configuration options controlling appearance, navigation behavior, and accessibility
 * @param children - Child content displayed inside the link
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * Link(
 *   { href: '/about', color: 'primary', variant: 'default' },
 *   'About Us'
 * )
 * ```
 *
 * @example
 * ```typescript
 * // External link opening in a new tab
 * Link(
 *   { href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer' },
 *   'Visit Example'
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Disabled link
 * const isDisabled = prop(true)
 * Link(
 *   { href: '/dashboard', disabled: isDisabled, colorDisabled: 'base' },
 *   'Dashboard'
 * )
 * ```
 */
export function Link(
  {
    href,
    variant = 'default',
    color = 'primary',
    colorDisabled = 'base',
    disabled = false,
    viewTransition = true,
    state,
    scroll,
    replace,
    target,
    rel,
  }: LinkOptions,
  ...children: TNode[]
) {
  return When(
    disabled,
    () =>
      html.span(
        attr.class(
          computedOf(
            variant,
            disabled
          )((variant, disabled) => generateLinkClasses(variant, disabled))
        ),
        attr.style(
          computedOf(colorDisabled)(color =>
            generateLinkStyles(color ?? 'base')
          )
        ),
        ...children
      ),
    () =>
      Anchor(
        {
          href,
          ...buildNavigationOptions({
            viewTransition,
            state,
            scroll,
            replace,
          }),
        },
        attr.class(
          computedOf(
            variant,
            disabled
          )((variant, disabled) => generateLinkClasses(variant, disabled))
        ),
        attr.style(
          computedOf(color)(color => generateLinkStyles(color ?? 'primary'))
        ),
        target ? attr.target(target) : null,
        rel ? attr.rel(rel) : null,
        ...children
      )
  )
}
