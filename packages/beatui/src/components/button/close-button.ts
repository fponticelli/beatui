import { aria, attr, coalesce, Renderable, Use, Value } from '@tempots/dom'
import { BeatUII18n } from '@/beatui-i18n'
import { ControlSize } from '../theme'
import { RadiusName } from '@/tokens/radius'
import { Icon } from '../data/icon'
import { Button } from './button'

export type CloseButtonOptions = {
  size?: Value<ControlSize>
  icon?: Value<string>
  disabled?: Value<boolean>
  roundedness?: Value<RadiusName>
  onClick?: () => void
  /** Optional localized label for screen readers; defaults to t.$.closeModal */
  label?: Value<string>
}

export function CloseButton({
  size = 'sm',
  icon = 'line-md:close',
  disabled,
  roundedness = 'full',
  onClick,
  label,
}: CloseButtonOptions = {}): Renderable {
  return Use(BeatUII18n, t => {
    const title = coalesce(label, t.$.closeModal)
    return Button(
      {
        variant: 'text',
        size,
        roundedness,
        disabled,
        onClick,
      },
      attr.title(title),
      // a11y
      aria.label(title),
      // icon-only button
      Icon({ icon, size: size ?? 'sm' })
    )
  })
}
