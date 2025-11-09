import {
  aria,
  attr,
  coalesce,
  Renderable,
  TNode,
  Use,
  Value,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { RadiusName } from '../../tokens/radius'
import { Icon } from '../data/icon'
import { Button } from './button'

export type CloseButtonOptions = {
  size?: Value<ControlSize>
  icon?: Value<string>
  disabled?: Value<boolean>
  roundedness?: Value<RadiusName>
  color?: Value<ThemeColorName>
  onClick?: () => void
  /** Optional localized label for screen readers; defaults to t.$.closeModal */
  label?: Value<string>
}

export function CloseButton(
  {
    size = 'sm',
    icon = 'line-md:close',
    disabled,
    roundedness = 'full',
    color = 'base',
    onClick,
    label,
  }: CloseButtonOptions,
  ...children: TNode[]
): Renderable {
  return Use(BeatUII18n, t => {
    const title = coalesce(label, t.$.closeModal)
    return Button(
      {
        variant: 'text',
        size,
        roundedness,
        disabled,
        color,
        onClick,
      },
      attr.title(title),
      aria.label(title),
      ...children,
      Icon({ icon, size: size ?? 'sm' })
    )
  })
}
