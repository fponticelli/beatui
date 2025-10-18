import { TNode, Value, attr, computedOf, html, Renderable } from '@tempots/dom'
import type { ThemeColorName } from '@/tokens'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'

export type RibbonOptions = {
  /** Background/text color theme (defaults to 'primary') */
  color?: Value<ThemeColorName | ExtendedColor>
  /** Extra classes */
  class?: Value<string>
  /** Band thickness (px if number). Default: 28px */
  thickness?: Value<number | string>
  /** Horizontal nudge along the top edge before rotation (px if number). Default: 0px */
  inset?: Value<number | string>
  /** Fine vertical correction to align the band crossing (px if number). Default: -1px */
  offset?: Value<number | string>
  /** Minimum width of the band (px if number). Default: null */
  minWidth?: Value<number | string>
}

function generateRibbonCSSVariables(
  color: ExtendedColor,
  thickness: number | string,
  inset: number | string,
  offset: number | string,
  minWidth: number | string
): string {
  const baseLight = backgroundValue(color, 'solid', 'light')
  const baseDark = backgroundValue(color, 'solid', 'dark')
  return [
    `--ribbon-bg: ${baseLight.backgroundColor}`,
    `--ribbon-text: ${baseLight.textColor}`,
    `--ribbon-bg-dark: ${baseDark.backgroundColor}`,
    `--ribbon-text-dark: ${baseDark.textColor}`,
    `--ribbon-thickness: ${toCssLength(thickness)}`,
    `--ribbon-inset: ${toCssLength(inset)}`,
    `--ribbon-offset: ${toCssLength(offset)}`,
    `--ribbon-min-width: ${toCssLength(minWidth)}`,
  ].join('; ')
}

function toCssLength(v: number | string | null | undefined): string | null {
  if (v == null) return null
  return typeof v === 'number' ? `${v}px` : v
}

/**
 * Ribbon: renders diagonal content at the container's top-right corner.
 * Note: The parent container should be positioned (e.g., position: relative) for best results.
 */
export function Ribbon(
  {
    color = 'primary',
    class: cls,
    thickness,
    inset,
    offset,
    minWidth,
  }: RibbonOptions,
  ...children: TNode[]
): Renderable {
  return html.div(
    attr.class('bc-ribbon'),
    // Theme styles via CSS variables
    attr.style(
      computedOf(
        color,
        thickness,
        inset,
        offset,
        minWidth
      )((c, t, i, o, minWidth) =>
        generateRibbonCSSVariables(
          (c ?? 'primary') as ExtendedColor,
          t ?? 28,
          i ?? 0,
          o ?? 40,
          minWidth ?? 0
        )
      )
    ),
    // Allow external classes
    attr.class(cls),
    html.div(attr.class('bc-ribbon__band'), ...children)
  )
}
