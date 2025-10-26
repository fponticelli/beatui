import { TNode, Value, attr, computedOf, html, Renderable } from '@tempots/dom'
import type { ThemeColorName } from '@/tokens'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'

export type RibbonCorner =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'

export type RibbonOptions = {
  /** Background/text color theme (defaults to 'primary') */
  color?: Value<ThemeColorName | ExtendedColor>
  /** Extra classes */
  class?: Value<string>
  /** Horizontal nudge along the top edge before rotation (px if number). Default: 0px */
  inset?: Value<number | string>
  /** Fine vertical correction to align the band crossing (px if number). Default: -1px */
  offset?: Value<number | string>
  /** Minimum width of the band (px if number). Default: null */
  width?: Value<number | string>
  /** Rotation angle in degrees. Default: 45 */
  angle?: Value<number>
  /** Corner position. Default: 'top-end' */
  corner?: Value<RibbonCorner>
}

function generateRibbonCSSVariables(
  color: ExtendedColor,
  inset: number | string,
  offset: number | string,
  width: number | string,
  angle: number,
  corner: RibbonCorner
): string {
  const baseLight = backgroundValue(color, 'solid', 'light')
  const baseDark = backgroundValue(color, 'solid', 'dark')
  return [
    `--ribbon-bg: ${baseLight.backgroundColor}`,
    `--ribbon-text: ${baseLight.textColor}`,
    `--ribbon-bg-dark: ${baseDark.backgroundColor}`,
    `--ribbon-text-dark: ${baseDark.textColor}`,
    `--ribbon-inset: ${toCssLength(inset)}`,
    `--ribbon-offset: ${toCssLength(offset)}`,
    `--ribbon-width: ${toCssLength(width)}`,
    `--ribbon-angle: ${angle}deg`,
    `--ribbon-corner: ${corner}`,
  ].join('; ')
}

function toCssLength(v: number | string | null | undefined): string | null {
  if (v == null) return null
  return typeof v === 'number' ? `${v}px` : v
}

/**
 * Ribbon: renders diagonal content at a specified corner.
 * Note: The parent container should be positioned (e.g., position: relative) for best results.
 */
export function Ribbon(
  {
    color = 'primary',
    class: cls,
    inset = 0,
    offset = 40,
    width = 100,
    angle = 45,
    corner = 'top-end',
  }: RibbonOptions,
  ...children: TNode[]
): Renderable {
  return html.div(
    attr.class('bc-ribbon'),
    // Theme styles via CSS variables
    attr.style(
      computedOf(
        color,
        inset,
        offset,
        width,
        angle,
        corner
      )(generateRibbonCSSVariables)
    ),
    // Allow external classes
    attr.class(cls),
    ...children
  )
}
