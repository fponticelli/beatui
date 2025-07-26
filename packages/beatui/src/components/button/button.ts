import {
  attr,
  computedOf,
  Fragment,
  html,
  on,
  OnDispose,
  prop,
  style,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'
import { Icon } from '../data/icon'
import { ElementRect, Rect } from '@tempots/ui'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
  loading?: Value<boolean>
  variant?: Value<ButtonVariant>
  size?: Value<ControlSize>
  color?: Value<ThemeColorName>
  roundedness?: Value<RadiusName>
  onClick?: () => void
}

function generateButtonClasses(
  variant: ButtonVariant,
  size: ControlSize,
  color: string,
  roundedness: RadiusName,
  disabled?: boolean,
  loading?: boolean
): string {
  const classes = [
    'bc-button',
    `bu-text-${size}`,
    `bc-control--padding-${size}`,
    `bc-control--rounded-${roundedness}`,
  ]

  if (loading) {
    classes.push('bc-button--loading')
  }

  switch (variant) {
    case 'filled':
      classes.push(`bu-bg--${color}`)
      if (!disabled) {
        classes.push(`hover:bu-bg--${color}`)
      }
      break
    case 'light':
      classes.push(`bu-bg--light-${color}`)
      if (!disabled) {
        classes.push(`hover:bu-bg--light-${color}`)
      }
      break
    case 'outline':
      classes.push(`bu-border--${color}`)
      if (!disabled) {
        classes.push(`hover:bu-bg--light-${color}`)
      }
      break
    case 'default':
      classes.push(`bu-bg--light-neutral`)
      classes.push(`bu-text--${color}`)
      if (!disabled) {
        classes.push(`hover:bu-bg--light-base`)
      }
      break
    case 'text':
      classes.push(`bu-bg--inherit`)
      classes.push(`bu-text--${color}`)
      if (!disabled) {
        classes.push(`hover:bu-underline`)
      }
      break
  }

  return classes.join(' ')
}

export function Button(
  {
    type = 'button',
    disabled,
    loading,
    variant = 'filled',
    size = 'md',
    color = 'base',
    roundedness = 'sm',
    onClick = () => {},
  }: ButtonOptions,
  ...children: TNode[]
) {
  const buttonSize = prop<null | Rect>(null)
  return html.button(
    attr.type(type as Value<string>),
    attr.disabled(
      computedOf(disabled, loading)((disabled, loading) => disabled || loading)
    ),
    attr.class(
      computedOf(
        variant,
        size,
        color,
        roundedness,
        disabled,
        loading
      )((variant, size, color, roundedness, disabled, loading) =>
        generateButtonClasses(
          variant ?? 'filled',
          size ?? 'md',
          color ?? 'base',
          roundedness ?? 'sm',
          disabled,
          loading
        )
      )
    ),
    When(
      loading ?? false,
      () =>
        Fragment(
          style.width(
            buttonSize.map(rect => {
              if (rect == null) return ''
              return `${rect.width}px`
            })
          ),
          style.height(
            buttonSize.map(rect => {
              if (rect == null) return ''
              return `${rect.height}px`
            })
          ),
          Icon({ icon: 'line-md:loading-twotone-loop', size: size ?? 'md' })
        ),
      () => Fragment(on.click(onClick), ...children)
    ),
    When(loading != null, () =>
      ElementRect(rect =>
        OnDispose(
          rect.on(r => {
            if (Value.get(loading ?? false)) return
            console.log(r)
            buttonSize.set(r)
          })
        )
      )
    )
  )
}
