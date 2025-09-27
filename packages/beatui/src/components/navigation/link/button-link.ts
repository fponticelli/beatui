import { attr, computedOf, html, TNode, Use, Value, When } from '@tempots/dom'
import { Anchor, Location } from '@tempots/ui'
import type { LocationHandle } from '@tempots/ui'
import { ControlSize, ButtonVariant } from '../../theme'
import { ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'
import { generateButtonClasses } from '../../button/button'
import { UrlMatchMode, isUrlMatch } from './navigation-link'

export interface ButtonLinkOptions {
  // Link-specific props
  href: Value<string>
  viewTransition?: boolean
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
    viewTransition = true,
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
    return Use(Location, (locationHandle: LocationHandle) => {
      const isActive = computedOf(
        locationHandle.location,
        href,
        disableWhenActive
      )((currentLocation, href, disableWhenActive) => {
        const shouldDisable = disableWhenActive ?? true
        if (!shouldDisable) return false
        if (!matchMode) return false

        const hrefValue = Value.get(href)
        return isUrlMatch(currentLocation, hrefValue, matchMode)
      })

      const effectiveDisabled = computedOf(
        disabled,
        isActive
      )((disabled, isActive) => disabled || isActive)

      return ButtonLinkCore(
        {
          href,
          viewTransition,
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
      viewTransition,
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
    viewTransition,
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
  return When(
    disabled ?? false,
    () =>
      html.span(
        attr.class(
          computedOf(
            variant,
            size,
            color,
            roundedness,
            disabled
          )((variant, size, color, roundedness, disabled) =>
            generateButtonClasses(
              variant ?? 'filled',
              size ?? 'md',
              color ?? 'base',
              roundedness ?? 'sm',
              disabled,
              false // loading is always false for ButtonLink
            )
          )
        ),
        ...children
      ),
    () =>
      Anchor(
        {
          href,
          viewTransition,
        },
        attr.class(
          computedOf(
            variant,
            size,
            color,
            roundedness,
            disabled
          )((variant, size, color, roundedness, disabled) =>
            generateButtonClasses(
              variant ?? 'filled',
              size ?? 'md',
              color ?? 'base',
              roundedness ?? 'sm',
              disabled,
              false // loading is always false for ButtonLink
            )
          )
        ),
        target ? attr.target(target) : null,
        rel ? attr.rel(rel) : null,
        ...children
      )
  )
}
