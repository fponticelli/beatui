import { attr, computedOf, html, TNode, Use, Value, When } from '@tempots/dom'
import { Anchor, Location } from '@tempots/ui'
import type { LocationHandle, NavigationOptions } from '@tempots/ui'
import { buildNavigationOptions } from './navigation-options'
import { ControlSize, ButtonVariant } from '../../theme'
import { ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'
import {
  generateButtonClasses,
  generateButtonStyles,
} from '../../button/button'
import type { ExtendedColor } from '../../theme/style-utils'
import { UrlMatchMode, createLocationMatcher } from './navigation-link'

export interface ButtonLinkOptions {
  // Link-specific props
  href: Value<string>
  viewTransition?: boolean
  state?: NavigationOptions['state']
  scroll?: NavigationOptions['scroll']
  replace?: NavigationOptions['replace']
  target?: Value<string>
  rel?: Value<string>

  // Navigation-specific props (optional)
  matchMode?: UrlMatchMode
  disableWhenActive?: Value<boolean>

  // Button visual styling props (excluding loading and onClick)
  variant?: Value<ButtonVariant>
  size?: Value<ControlSize>
  color?: Value<ThemeColorName | 'black' | 'white'>
  roundedness?: Value<RadiusName>
  disabled?: Value<boolean>
}

export function ButtonLink(
  {
    href,
    viewTransition = true,
    state,
    scroll,
    replace,
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
      const matchSignal =
        matchMode !== undefined
          ? locationHandle.matchSignal(createLocationMatcher(href, matchMode))
          : computedOf(locationHandle.location)(() => false)

      const isActive = computedOf(
        matchSignal,
        disableWhenActive
      )((matches, disableWhenActive) => {
        const shouldDisable = disableWhenActive ?? true
        if (!shouldDisable) return false
        if (!matchMode) return false

        return matches
      })

      const effectiveDisabled = computedOf(
        disabled,
        isActive
      )((disabled, isActive) => disabled || isActive)

      return ButtonLinkCore(
        {
          href,
          viewTransition,
          state,
          scroll,
          replace,
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
      state,
      scroll,
      replace,
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
    state,
    scroll,
    replace,
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
            size,
            roundedness
          )((size, roundedness) =>
            generateButtonClasses(
              size ?? 'md',
              roundedness ?? 'sm',
              false // loading is always false for ButtonLink
            )
          )
        ),
        attr.style(
          computedOf(
            variant,
            color,
            disabled
          )((variant, color, disabled) =>
            generateButtonStyles(
              variant ?? 'filled',
              (color ?? 'base') as ExtendedColor,
              disabled
            )
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
            size,
            roundedness
          )((size, roundedness) =>
            generateButtonClasses(
              size ?? 'md',
              roundedness ?? 'sm',
              false // loading is always false for ButtonLink
            )
          )
        ),
        attr.style(
          computedOf(
            variant,
            color,
            disabled
          )((variant, color, disabled) =>
            generateButtonStyles(
              variant ?? 'filled',
              (color ?? 'base') as ExtendedColor,
              disabled
            )
          )
        ),
        target ? attr.target(target) : null,
        rel ? attr.rel(rel) : null,
        ...children
      )
  )
}
