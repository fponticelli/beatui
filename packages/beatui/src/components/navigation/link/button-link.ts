import { attr, computedOf, html, TNode, Use, Value, When } from '@tempots/dom'
import { Anchor, Location } from '@tempots/ui'
import { ControlSize, ButtonVariant } from '../../theme'
import { ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'
import {
  buttonClasses,
  buttonFontSize,
  buttonRadius,
  buttonStyle,
  normalizeButtonColor,
} from '../../button/button'
import { UrlMatchMode, isUrlMatch } from './navigation-link'

export interface ButtonLinkOptions {
  // Link-specific props
  href: Value<string>
  withViewTransition?: boolean
  target?: Value<string>
  rel?: Value<string>

  // Navigation-specific props (optional)
  matchMode?: UrlMatchMode
  disableWhenActive?: Value<boolean>

  // Button visual styling props (excluding loading and onClick)
  variant?: Value<ButtonVariant>
  size?: Value<ControlSize>
  color?: Value<ThemeColorName>
  roundedness?: Value<RadiusName>
  disabled?: Value<boolean>
}

export function ButtonLink(
  {
    href,
    withViewTransition = true,
    target,
    rel,
    matchMode,
    disableWhenActive,
    variant = 'filled',
    size = 'md',
    color = 'base',
    roundedness = 'sm',
    disabled = false,
  }: ButtonLinkOptions,
  ...children: TNode[]
) {
  // If navigation props are provided, use NavigationLink-like behavior
  if (matchMode !== undefined || disableWhenActive !== undefined) {
    return Use(Location, location => {
      const isActive = computedOf(
        location,
        href,
        disableWhenActive
      )((location, href, disableWhenActive) => {
        const shouldDisable = disableWhenActive ?? true
        if (!shouldDisable) return false
        if (!matchMode) return false

        const hrefValue = Value.get(href)
        return isUrlMatch(location, hrefValue, matchMode)
      })

      const effectiveDisabled = computedOf(
        disabled,
        isActive
      )((disabled, isActive) => disabled || isActive)

      return ButtonLinkCore(
        {
          href,
          withViewTransition,
          target,
          rel,
          variant,
          size,
          color,
          roundedness,
          disabled: effectiveDisabled,
        },
        ...children
      )
    })
  }

  // Standard ButtonLink without navigation behavior
  return ButtonLinkCore(
    {
      href,
      withViewTransition,
      target,
      rel,
      variant,
      size,
      color,
      roundedness,
      disabled,
    },
    ...children
  )
}

function ButtonLinkCore(
  {
    href,
    withViewTransition,
    target,
    rel,
    variant,
    size,
    color,
    roundedness,
    disabled,
  }: Omit<ButtonLinkOptions, 'matchMode' | 'disableWhenActive'>,
  ...children: TNode[]
) {
  const inlineStyle = computedOf(
    variant,
    color,
    size,
    roundedness
  )((variantValue, colorValue, sizeValue, radiusValue) => {
    const declarations = [
      `font-size: ${buttonFontSize(sizeValue ?? 'md')}`,
      `border-radius: ${buttonRadius(radiusValue ?? 'sm')}`,
      buttonStyle(variantValue ?? 'filled', normalizeButtonColor(colorValue)),
    ]

    return declarations.join('; ')
  })

  return When(
    disabled ?? false,
    () =>
      html.span(
        attr.class(
          computedOf(
            variant,
            size
          )((variantValue, sizeValue) =>
            buttonClasses(variantValue ?? 'filled', sizeValue ?? 'md', {
              disabled: true,
            })
          )
        ),
        attr.style(inlineStyle),
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
            size,
            disabled
          )((variantValue, sizeValue, disabledValue) =>
            buttonClasses(variantValue ?? 'filled', sizeValue ?? 'md', {
              disabled: disabledValue ?? false,
            })
          )
        ),
        attr.style(inlineStyle),
        target ? attr.target(target) : null,
        rel ? attr.rel(rel) : null,
        ...children
      )
  )
}
