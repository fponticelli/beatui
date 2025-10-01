import { attr, computedOf, html, TNode, Value, When } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import type { NavigationOptions } from '@tempots/ui'
import { buildNavigationOptions } from './navigation-options'
import { ThemeColorName } from '@/tokens'
import { textColorValue } from '../../theme/style-utils'

export type LinkVariant = 'default' | 'plain' | 'hover'

export interface LinkOptions {
  href: Value<string>
  variant?: Value<LinkVariant>
  color?: Value<ThemeColorName>
  colorDisabled?: Value<ThemeColorName>
  disabled?: Value<boolean>
  viewTransition?: boolean
  state?: NavigationOptions['state']
  scroll?: NavigationOptions['scroll']
  replace?: NavigationOptions['replace']
  target?: Value<string>
  rel?: Value<string>
}

export function generateLinkClasses(
  variant: LinkVariant,
  color: ThemeColorName,
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
            colorDisabled,
            disabled
          )((variant, color, disabled) =>
            generateLinkClasses(variant, color, disabled)
          )
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
            color,
            disabled
          )((variant, color, disabled) =>
            generateLinkClasses(variant, color, disabled)
          )
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
