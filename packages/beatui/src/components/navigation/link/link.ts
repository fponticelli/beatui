import { attr, computedOf, html, TNode, Value, When } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import type { NavigationOptions } from '@tempots/ui'
import { buildNavigationOptions } from './navigation-options'
import { ThemeColorName } from '@/tokens'

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

  // Add color class
  classes.push(`bu-text-${color}`)

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
        target ? attr.target(target) : null,
        rel ? attr.rel(rel) : null,
        ...children
      )
  )
}
