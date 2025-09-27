import { attr, Empty, html, Value, computedOf, Use } from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { ControlSize } from '../theme'
import { CloseButton } from '../button'
import { BeatUII18n } from '@/beatui-i18n'
import { backgroundPalette } from '@/utils/color-style'

function generateTagClasses(size: ControlSize, disabled: boolean): string {
  const classes = ['bc-tag']
  if (size !== 'md') {
    classes.push(`bc-tag--${size}`)
  }
  if (disabled) {
    classes.push('bc-tag--disabled')
  }
  return classes.join(' ')
}

function resolveTagStyle(color: ThemeColorName): string {
  const palette = backgroundPalette(color, 'solid')
  const entries: Array<[string, string]> = [
    ['--tag-bg', palette.light.backgroundColor],
    ['--tag-text', palette.light.textColor],
    ['--tag-border', palette.light.backgroundColor],
    ['--tag-bg-dark', palette.dark.backgroundColor],
    ['--tag-text-dark', palette.dark.textColor],
    ['--tag-border-dark', palette.dark.backgroundColor],
  ]

  return entries.map(([prop, value]) => `${prop}: ${value}`).join('; ')
}

export const Tag = ({
  value,
  color = 'base',
  onClose,
  size = 'md',
  class: cls,
  disabled,
}: {
  value: Value<string>
  color?: Value<ThemeColorName>
  onClose?: (value: string) => void
  size?: Value<ControlSize>
  class?: Value<string>
  disabled?: Value<boolean>
}) => {
  return html.span(
    attr.class(
      computedOf(
        size ?? 'md',
        disabled ?? false
      )(
        (
          sizeValue: ControlSize | undefined,
          disabledValue: boolean | undefined
        ) => generateTagClasses(sizeValue ?? 'md', disabledValue ?? false)
      )
    ),
    attr.style(
      computedOf(color ?? 'base')(colorValue =>
        resolveTagStyle(colorValue ?? 'base')
      )
    ),
    // Allow external classes like bc-tag--disabled to be applied
    attr.class(cls),
    html.span(value),
    onClose != null
      ? Use(BeatUII18n, t =>
          CloseButton(
            {
              size: 'xs',
              label: t.$.removeItem,
              color: 'white',
              disabled,
              onClick: () => onClose?.(Value.get(value)),
            },
            attr.class('bc-tag__close')
          )
        )
      : Empty
  )
}
