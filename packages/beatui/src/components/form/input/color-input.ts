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

export type ColorInputOptions = InputOptions<string> & {
  // When true, renders the RGB value next to the blob
  showRgb?: Value<boolean>
  // Size in pixels of the blob preview (square). Defaults to 32
  size?: Value<number>
  // Enable alpha channel support with a small opacity slider. Defaults to false
  withAlpha?: Value<boolean>
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return [0, 0, 0]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(Math.max(0, Math.min(255, r)))}${toHex(
    Math.max(0, Math.min(255, g))
  )}${toHex(Math.max(0, Math.min(255, b)))}`
}

function parseAnyColor(v: string): [number, number, number, number] {
  if (!v) return [0, 0, 0, 1]
  const rgba = v.match(
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i
  )
  if (rgba) {
    return [
      parseInt(rgba[1], 10),
      parseInt(rgba[2], 10),
      parseInt(rgba[3], 10),
      parseFloat(rgba[4]),
    ]
  }
  const rgb = v.match(
    /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i
  )
  if (rgb) {
    return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10), 1]
  }
  const [r, g, b] = hexToRgb(v)
  return [r, g, b, 1]
}

const toRgbaString = (r: number, g: number, b: number, a: number) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.max(
    0,
    Math.min(1, Math.round(a * 100) / 100)
  )})`

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
  const { value, onBlur, onChange, onInput, showRgb, size, withAlpha } = options

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
  const rgbText = computedOf(
    rgb,
    alphaStore,
    alphaEnabled
  )(([r, g, b], a, ea) =>
    ea ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`
  )
  const svgViewBox = Value.map(blobSize, s => `-${s / 2} -${s / 2} ${s} ${s}`)
  const pathD = computedOf(
    rgb,
    blobSize
  )((rgb, s) => generateBlobPath(rgb, s / 2 - 1))

  const fillColor = computedOf(
    rgb,
    alphaStore,
    alphaEnabled
  )(([r, g, b], a, ea) =>
    ea || a < 1 ? toRgbaString(r, g, b, a) : rgbToHex(r, g, b)
  )

  const Preview = html.div(
    attr.class('bc-color-input__control'),
    attr.class(
      Value.map(alphaEnabled, (a): string =>
        a ? 'bc-color-input__control--alpha' : ''
      )
    ),
    attr.style(computedOf(blobSize)(s => `width:${s}px;height:${s}px`)),
    // The SVG blob preview
    svg.svg(
      attr.class('bc-color-input__svg'),
      svgAttr.viewBox(svgViewBox),
      svg.path(svgAttr.d(pathD), svgAttr.fill(fillColor))
    ),
    // Invisible native input overlays the blob for picker and accessibility
    html.input(
      attr.type('color'),
      CommonInputAttributes(options),
      // Native color input needs hex without alpha
      attr.value(Value.map(rgb, ([r, g, b]) => rgbToHex(r, g, b))),
      attr.class('bc-input bc-color-input bc-color-input__native'),
      onBlur != null ? on.blur(onBlur) : Empty,
      onChange != null
        ? on.change(e => {
            const hex = (e.target as HTMLInputElement).value
            if (!onChange) return
            const a = Value.get(alphaStore) ?? 1
            if (a < 1) {
              const [r, g, b] = hexToRgb(hex)
              onChange(toRgbaString(r, g, b, a))
            } else {
              onChange(hex)
            }
          })
        : Empty,
      onInput != null
        ? on.input(e => {
            const hex = (e.target as HTMLInputElement).value
            if (!onInput) return
            const a = Value.get(alphaStore) ?? 1
            if (a < 1) {
              const [r, g, b] = hexToRgb(hex)
              onInput(toRgbaString(r, g, b, a))
            } else {
              onInput(hex)
            }
          })
        : Empty
    )
  )

  // Alpha slider (when enabled)
  const AlphaSlider = When(alphaEnabled, () =>
    html.input(
      attr.type('range'),
      attr.class('bc-color-input__alpha'),
      attr.min(0),
      attr.max(1),
      attr.step(0.01),
      attr.value(Value.map(alphaStore, a => String(a ?? 1))),
      on.input(e => {
        const a = parseFloat((e.target as HTMLInputElement).value)
        alphaStore.set(a)
        const [r, g, b] = Value.get(rgb) as [number, number, number]
        const out = a < 1 ? toRgbaString(r, g, b, a) : rgbToHex(r, g, b)
        onInput?.(out)
      }),
      on.change(e => {
        const a = parseFloat((e.target as HTMLInputElement).value)
        alphaStore.set(a)
        const [r, g, b] = Value.get(rgb) as [number, number, number]
        const out = a < 1 ? toRgbaString(r, g, b, a) : rgbToHex(r, g, b)
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
      When(showRgb ?? false, () =>
        html.span(attr.class('bc-color-input__rgb'), rgbText)
      ),
      AlphaSlider,
      options.after
    ),
  })
}
