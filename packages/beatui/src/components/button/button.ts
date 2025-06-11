import { attr, computedOf, html, on, TNode, Value } from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
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
  disabled?: boolean
): string {
  const classes = [
    'bc-button',
    `bu-text-${size}`,
    `bc-control--padding-${size}`,
    `bc-control--rounded-${roundedness}`,
  ]

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
    variant = 'filled',
    size = 'md',
    color = 'base',
    roundedness = 'sm',
    onClick = () => {},
  }: ButtonOptions,
  ...children: TNode[]
) {
  return html.button(
    attr.type(type as Value<string>),
    attr.disabled(disabled),
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
          disabled
        )
      )
    ),
    on.click(onClick),
    ...children
  )
}
