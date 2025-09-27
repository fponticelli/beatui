import { attr, computedOf, html, TNode, Value, When } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import { ThemeColorName } from '@/tokens'
import { textTonePalette } from '@/utils/color-style'

export type LinkVariant = 'default' | 'plain' | 'hover'

export interface LinkOptions {
  href: Value<string>
  variant?: Value<LinkVariant>
  color?: Value<ThemeColorName>
  colorDisabled?: Value<ThemeColorName>
  disabled?: Value<boolean>
  withViewTransition?: boolean
  target?: Value<string>
  rel?: Value<string>
}

export function generateLinkClasses(
  variant: LinkVariant,
  disabled: boolean
): string {
  const classes = ['bc-link']

  if (disabled) {
    classes.push('bc-link--disabled')
  } else {
    classes.push(`bc-link--${variant}`)
  }

  return classes.join(' ')
}

function resolveLinkStyle(color: ThemeColorName): string {
  const palette = textTonePalette(color, 800, 200)
  return `--link-color: ${palette.light}; --link-color-dark: ${palette.dark}`
}

export function Link(
  {
    href,
    variant = 'default',
    color = 'primary',
    colorDisabled = 'base',
    disabled = false,
    withViewTransition = true,
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
          )((variantValue, disabledValue) =>
            generateLinkClasses(
              variantValue ?? 'default',
              disabledValue ?? false
            )
          )
        ),
        attr.style(
          computedOf(colorDisabled)(disabledColorValue =>
            resolveLinkStyle(disabledColorValue ?? 'base')
          )
        ),
        ...children
      ),
    () =>
      Anchor(
        {
          href,
          withViewTransition,
        },
        attr.class(
          computedOf(
            variant,
            disabled
          )((variantValue, disabledValue) =>
            generateLinkClasses(
              variantValue ?? 'default',
              disabledValue ?? false
            )
          )
        ),
        attr.style(
          computedOf(color)(colorValue =>
            resolveLinkStyle(colorValue ?? 'primary')
          )
        ),
        target ? attr.target(target) : null,
        rel ? attr.rel(rel) : null,
        ...children
      )
  )
}
