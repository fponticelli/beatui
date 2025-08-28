import {
  attr,
  emitValue,
  Empty,
  html,
  on,
  Value,
  computedOf,
  Fragment,
  svg,
  svgAttr,
  When,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

export type ColorInputOptions = InputOptions<string> & {
  // When true, renders the RGB value next to the blob
  showRgb?: Value<boolean>
  // Size in pixels of the blob preview (square). Defaults to 32
  size?: Value<number>
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return [0, 0, 0]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

// Simple seeded PRNG (Mulberry32)
function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
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

export const ColorInput = (options: ColorInputOptions) => {
  const { value, onBlur, onChange, onInput, showRgb, size } = options

  const blobSize = Value.map(size ?? 32, s => s)
  const rgb = Value.map(value, v => hexToRgb(v ?? '#000000'))
  const rgbText = Value.map(rgb, ([r, g, b]) => `rgb(${r}, ${g}, ${b})`)
  const svgViewBox = Value.map(blobSize, s => `-${s / 2} -${s / 2} ${s} ${s}`)
  const pathD = computedOf(
    rgb,
    blobSize
  )((rgb, s) => generateBlobPath(rgb, s / 2 - 1))

  const Preview = html.div(
    attr.class('bc-color-input__control bu-relative'),
    attr.style(computedOf(blobSize)(s => `width:${s}px;height:${s}px`)),
    // The SVG blob preview
    svg.svg(
      attr.class('bc-color-input__svg bu-absolute'),
      svgAttr.viewBox(svgViewBox),
      svgAttr.opacity(0.5),
      svgAttr['transform-origin']('center center'),
      svgAttr.transform('scale(0.95)'),
      svg.path(
        svgAttr.d(pathD),
        svgAttr.fill(Value.map(value, v => v ?? '#000000'))
      )
    ),
    svg.svg(
      attr.class('bc-color-input__svg bu-absolute'),
      svgAttr.viewBox(svgViewBox),
      svgAttr['transform-origin']('center center'),
      svgAttr.transform('scale(1.05) rotate(120)'),
      svgAttr.opacity(0.5),
      svg.path(
        svgAttr.d(pathD),
        svgAttr.fill(Value.map(value, v => v ?? '#000000'))
      )
    ),
    // Invisible native input overlays the blob for picker and accessibility
    html.input(
      attr.type('color'),
      CommonInputAttributes(options),
      attr.value(value),
      attr.class('bc-input bc-color-input bc-color-input__native'),
      onBlur != null ? on.blur(onBlur) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
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
      When(showRgb ?? false, () =>
        html.span(attr.class('bc-color-input__rgb'), rgbText)
      ),
      options.after
    ),
  })
}
