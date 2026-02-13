import { TNode, Value, attr, computedOf, html, Renderable } from '@tempots/dom'
import type { ThemeColorName } from '../../tokens'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'

/**
 * Corner position for the {@link Ribbon} component.
 * Determines which corner of the parent container the ribbon is placed at.
 */
export type RibbonCorner =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'

/**
 * Configuration options for the {@link Ribbon} component.
 */
export type RibbonOptions = {
  /**
   * Theme color applied to the ribbon background and text.
   * Accepts any named theme color or an extended color value.
   * @default 'primary'
   */
  color?: Value<ThemeColorName | ExtendedColor>
  /**
   * Additional CSS class names to apply to the ribbon element.
   */
  class?: Value<string>
  /**
   * Horizontal nudge along the edge before rotation. Accepts a pixel number or CSS length string.
   * @default 0
   */
  inset?: Value<number | string>
  /**
   * Vertical offset correction to fine-tune the band crossing position.
   * Accepts a pixel number or CSS length string.
   * @default 40
   */
  offset?: Value<number | string>
  /**
   * Minimum width of the ribbon band. Accepts a pixel number or CSS length string.
   * @default 100
   */
  width?: Value<number | string>
  /**
   * Rotation angle of the ribbon in degrees.
   * @default 45
   */
  angle?: Value<number>
  /**
   * Corner of the parent container where the ribbon is positioned.
   * @default 'top-end'
   */
  corner?: Value<RibbonCorner>
}

/** @internal Generates the inline style string with CSS custom properties for ribbon theming. */
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

/** @internal Converts a numeric or string value to a CSS length string, appending `px` to numbers. */
function toCssLength(v: number | string | null | undefined): string | null {
  if (v == null) return null
  return typeof v === 'number' ? `${v}px` : v
}

/**
 * Renders a diagonal ribbon badge at a specified corner of its parent container.
 *
 * The ribbon is positioned absolutely, so the parent container should use
 * `position: relative` (or another positioning context) for correct placement.
 * Theme-aware colors are applied via CSS custom properties, supporting both
 * light and dark modes.
 *
 * @param options - Configuration options controlling color, position, size, and rotation
 * @param children - Content to display inside the ribbon (typically short text like "New" or "Sale")
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * html.div(
 *   attr.style('position: relative'),
 *   Ribbon(
 *     { color: 'danger', corner: 'top-end', angle: 45 },
 *     'Sale'
 *   ),
 *   html.p('Product card content')
 * )
 * ```
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
