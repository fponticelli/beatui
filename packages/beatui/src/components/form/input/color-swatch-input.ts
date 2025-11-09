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

export type ColorSwatchInputOptions = InputOptions<string> & {
  // When true, renders the RGB value next to the blob
  displayValue?: Value<boolean>
  // Size in pixels of the blob preview (square). Defaults to 32
  size?: Value<number>
  // Enable alpha channel support with a small opacity slider. Defaults to false
  withAlpha?: Value<boolean>
  // Which color space to display in the text label when visible
  // Defaults to 'rgb' for backward compatibility.
  colorTextFormat?: Value<'hex' | 'rgb' | 'hsl' | 'hwb' | 'oklch'>
}

// Generate a smooth closed blob path using quadratic curves.
// The profile is deterministic based on the provided rgb values.
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
