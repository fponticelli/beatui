import {
  attr,
  Empty,
  html,
  on,
  Value,
  computedOf,
  Fragment,
  svg,
  svgAttr,
  When,
  prop,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import {
  formatColor,
  hexToRgb,
  mulberry32,
  parseAnyColor,
  resolveEffectiveFormat,
  rgbToHex,
  toRgbaString,
} from '../../../utils'

/**
 * Configuration options for the {@link ColorSwatchInput} component.
 *
 * Extends {@link InputOptions} for string color values with properties to control
 * the blob preview size, alpha channel support, value display, and output color format.
 */
export type ColorSwatchInputOptions = InputOptions<string> & {
  /** When true, renders the formatted color value text next to the blob preview. @default false */
  displayValue?: Value<boolean>
  /** Size in pixels of the blob preview (square). @default 32 */
  size?: Value<number>
  /** Enable alpha channel support with a small opacity slider. @default false */
  withAlpha?: Value<boolean>
  /** Color space format for the displayed text label and emitted value. @default 'rgb' for display, 'hex' for emitted values */
  colorTextFormat?: Value<'hex' | 'rgb' | 'hsl' | 'hwb' | 'oklch'>
}

/**
 * Generates a smooth closed SVG blob path using quadratic Bezier curves.
 *
 * The blob shape is deterministic based on the provided RGB values -- the same color
 * always produces the same organic shape. This creates a unique visual identity for
 * each color. The blob uses random vertex counts (6-10) and radius variations (~18%)
 * seeded from the RGB values.
 *
 * @param rgb - RGB color values as a tuple of [red, green, blue] (0-255)
 * @param r - Base radius of the blob in pixels
 * @returns An SVG path `d` attribute string defining the blob shape
 */
function generateBlobPath(rgb: [number, number, number], r: number): string {
  const [rr, gg, bb] = rgb
  const seed = (rr << 16) ^ (gg << 8) ^ bb
  const rand = mulberry32(seed)

  // number of vertices between 6 and 10
  const n = 6 + Math.floor(rand() * 5)

  // radius variation up to ~18%
  const amp = 0.18 + rand() * 0.06

  const points: Array<{ x: number; y: number }> = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2
    const radius = r * (1 + (rand() * 2 - 1) * amp)
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    points.push({ x, y })
  }

  // Use midpoint smoothing with quadratic curves
  const startMidX = (points[0].x + points[n - 1].x) / 2
  const startMidY = (points[0].y + points[n - 1].y) / 2
  let d = `M ${startMidX.toFixed(3)} ${startMidY.toFixed(3)}`
  for (let i = 0; i < n; i++) {
    const curr = points[i]
    const next = points[(i + 1) % n]
    const midX = (curr.x + next.x) / 2
    const midY = (curr.y + next.y) / 2
    d += ` Q ${curr.x.toFixed(3)} ${curr.y.toFixed(3)} ${midX.toFixed(3)} ${midY.toFixed(3)}`
  }
  d += ' Z'
  return d
}

/**
 * A visually rich color input component displaying a unique SVG blob swatch for each color.
 *
 * Renders an organic blob-shaped color preview (deterministic per RGB value) with a hidden
 * native color picker overlay, wrapped in an {@link InputContainer}. The blob shape changes
 * dynamically as the color changes, providing a unique visual identity for each color.
 * Supports optional alpha channel control via a range slider and displays the formatted
 * color value as text when `displayValue` is enabled.
 *
 * The component accepts colors in any CSS format and can emit values in hex, rgb, hsl,
 * hwb, or oklch format based on the `colorTextFormat` option. The alpha slider preserves
 * its state across color changes.
 *
 * @param options - Configuration options for the color swatch input
 * @returns A styled color swatch input with blob preview, optional alpha slider, and value display
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { ColorSwatchInput } from '@tempots/beatui'
 *
 * const color = prop('#3498db')
 * ColorSwatchInput({
 *   value: color,
 *   onChange: color.set,
 *   displayValue: true,
 *   size: 40,
 * })
 * ```
 *
 * @example
 * ```ts
 * // With alpha channel and HSL format
 * ColorSwatchInput({
 *   value: prop('hsl(200, 70%, 50%)'),
 *   onChange: (v) => console.log('Color:', v),
 *   withAlpha: true,
 *   displayValue: true,
 *   colorTextFormat: 'hsl',
 *   size: 48,
 * })
 * ```
 */
export const ColorSwatchInput = (options: ColorSwatchInputOptions) => {
  const { value, onBlur, onChange, onInput, displayValue, size, withAlpha } =
    options

  const blobSize = Value.map(size ?? 32, s => s)
  const rgba = Value.map(value, v => parseAnyColor(v ?? '#000000'))
  const rgb = Value.map(
    rgba,
    ([r, g, b]) => [r, g, b] as [number, number, number]
  )
  const alpha = Value.map(rgba, ([, , , a]) => a)
  // Persist current alpha locally so it is preserved across color changes
  const alphaStore = prop<number>(Value.get(alpha) ?? 1)
  const alphaEnabled = Value.map(withAlpha ?? false, a => a)
  // Format for label text. Default to 'rgb' for readability.
  const displayFormatSignal = Value.map(
    options.colorTextFormat ?? 'rgb',
    f => f as 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'oklch'
  )
  const rgbText = computedOf(
    rgb,
    alphaStore,
    displayFormatSignal,
    alphaEnabled
  )(([r, g, b], a, fmt, ae) =>
    formatColor(r, g, b, a ?? 1, resolveEffectiveFormat(fmt, ae), ae)
  )

  // Format for emitted value. Default to 'hex' to keep backward compatibility
  const emitFormatSignal = Value.map(
    options.colorTextFormat ?? 'hex',
    f => f as 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'oklch'
  )
  const svgViewBox = Value.map(blobSize, s => `${-s / 2} ${-s / 2} ${s} ${s}`)
  const pathD = computedOf(
    rgb,
    blobSize
  )((rgb, s) => generateBlobPath(rgb, s / 2))

  const fillColor = computedOf(
    rgb,
    alphaStore,
    alphaEnabled
  )(([r, g, b], a, ea) =>
    ea || a < 1 ? toRgbaString(r, g, b, a) : rgbToHex(r, g, b)
  )

  const Preview = html.div(
    attr.class('bc-color-swatch-input__control'),
    attr.class(
      Value.map(alphaEnabled, (a): string =>
        a ? 'bc-color-swatch-input__control--alpha' : ''
      )
    ),
    attr.style(
      computedOf(blobSize)(s => `min-width:${s + 2}px;height:${s + 2}px`)
    ),
    // The SVG blob preview
    svg.svg(
      attr.class('bc-color-swatch-input__svg'),
      svgAttr.viewBox(svgViewBox),
      svg.path(svgAttr.d(pathD), svgAttr.fill(fillColor))
    ),
    // Invisible native input overlays the blob for picker and accessibility
    html.input(
      attr.type('color'),
      CommonInputAttributes(options),
      // Native color input needs hex without alpha
      attr.value(Value.map(rgb, ([r, g, b]) => rgbToHex(r, g, b))),
      attr.class(
        'bc-input bc-color-swatch-input bc-color-swatch-input__native'
      ),
      onBlur != null ? on.blur(onBlur) : Empty,
      onChange != null
        ? on.change(e => {
            const hex = (e.target as HTMLInputElement).value
            if (!onChange) return
            const { r, g, b } = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }
            const a = Value.get(alphaStore) ?? 1
            const fmt = resolveEffectiveFormat(
              Value.get(emitFormatSignal),
              Value.get(alphaEnabled)
            )
            const out = formatColor(r, g, b, a, fmt, Value.get(alphaEnabled))
            onChange(out)
          })
        : Empty,
      onInput != null
        ? on.input(e => {
            const hex = (e.target as HTMLInputElement).value
            if (!onInput) return
            const { r, g, b } = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }
            const a = Value.get(alphaStore) ?? 1
            const fmt = resolveEffectiveFormat(
              Value.get(emitFormatSignal),
              Value.get(alphaEnabled)
            )
            const out = formatColor(r, g, b, a, fmt, Value.get(alphaEnabled))
            onInput(out)
          })
        : Empty
    )
  )

  // Alpha slider (when enabled)
  const AlphaSlider = When(alphaEnabled, () =>
    html.input(
      attr.type('range'),
      attr.class('bc-color-swatch-input__alpha'),
      attr.min(0),
      attr.max(1),
      attr.step(0.01),
      attr.value(Value.map(alphaStore, a => String(a ?? 1))),
      attr.disabled(options.disabled),
      on.input(e => {
        const a = parseFloat((e.target as HTMLInputElement).value)
        alphaStore.set(a)
        const [r, g, b] = Value.get(rgb) as [number, number, number]
        const fmt = resolveEffectiveFormat(
          Value.get(emitFormatSignal),
          Value.get(alphaEnabled)
        )
        const out = formatColor(r, g, b, a, fmt, Value.get(alphaEnabled))
        onInput?.(out)
      }),
      on.change(e => {
        const a = parseFloat((e.target as HTMLInputElement).value)
        alphaStore.set(a)
        const [r, g, b] = Value.get(rgb) as [number, number, number]
        const fmt = resolveEffectiveFormat(
          Value.get(emitFormatSignal),
          Value.get(alphaEnabled)
        )
        const out = formatColor(r, g, b, a, fmt, Value.get(alphaEnabled))
        onChange?.(out)
      })
    )
  )

  return InputContainer({
    baseContainer: true,
    ...options,
    // ensure our control does not try to grow
    growInput: false,
    input: Preview,
    // If caller provided an `after`, append RGB before it
    after: Fragment(
      When(displayValue ?? false, () =>
        html.span(attr.class('bc-color-swatch-input__rgb'), rgbText)
      ),
      AlphaSlider,
      options.after
    ),
  })
}
