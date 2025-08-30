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
  displayValue?: Value<boolean>
  // Size in pixels of the blob preview (square). Defaults to 32
  size?: Value<number>
  // Enable alpha channel support with a small opacity slider. Defaults to false
  withAlpha?: Value<boolean>
  // Which color space to display in the text label when visible
  // Defaults to 'rgb' for backward compatibility.
  colorTextFormat?: Value<'hex' | 'rgb' | 'hsl' | 'hwb' | 'oklch'>
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
  // #RRGGBBAA, #RRGGBB, #RGBA, #RGB (with or without #)
  const hex = v.trim()
  const hexMatch = hex.match(
    /^#?([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/
  )
  if (hexMatch) {
    const h = hexMatch[1]
    if (h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16)
      const g = parseInt(h.slice(2, 4), 16)
      const b = parseInt(h.slice(4, 6), 16)
      const a = parseInt(h.slice(6, 8), 16) / 255
      return [r, g, b, a]
    }
    if (h.length === 6) {
      return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
        1,
      ]
    }
    if (h.length === 4) {
      // #RGBA -> expand each nibble
      const r = parseInt(h[0] + h[0], 16)
      const g = parseInt(h[1] + h[1], 16)
      const b = parseInt(h[2] + h[2], 16)
      const a = parseInt(h[3] + h[3], 16) / 255
      return [r, g, b, a]
    }
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16)
      const g = parseInt(h[1] + h[1], 16)
      const b = parseInt(h[2] + h[2], 16)
      return [r, g, b, 1]
    }
  }
  // rgba()
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
  // rgb()
  const rgb = v.match(
    /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i
  )
  if (rgb) {
    return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10), 1]
  }
  // modern functional hsl() and hsla() with optional slash alpha
  const hslModern = v.match(
    /^hsla?\(\s*([+-]?[\d.]+)(?:deg)?\s*[ ,]?\s*([\d.]+)%\s*[ ,]?\s*([\d.]+)%\s*(?:[/,]\s*(\d?(?:\.\d+)?))?\s*\)$/i
  )
  if (hslModern) {
    const h = parseFloat(hslModern[1])
    const s = parseFloat(hslModern[2])
    const l = parseFloat(hslModern[3])
    const a = hslModern[4] != null ? parseFloat(hslModern[4]) : 1
    const [r, g, b] = hslToRgb(h, s / 100, l / 100)
    return [r, g, b, a]
  }
  // HWB: hwb(h w% b% / a?)
  const hwb = v.match(
    /^hwb\(\s*([+-]?[\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[/]\s*(\d?(?:\.\d+)?))?\s*\)$/i
  )
  if (hwb) {
    const h = parseFloat(hwb[1])
    const w = parseFloat(hwb[2]) / 100
    const b = parseFloat(hwb[3]) / 100
    const a = hwb[4] != null ? parseFloat(hwb[4]) : 1
    const [r, g, b_] = hwbToRgb(h, w, b)
    return [r, g, b_, a]
  }
  // OKLCH: oklch(L C h [/ a]) where L can be percentage or 0..1
  const oklch = v.match(
    /^oklch\(\s*([+-]?[\d.]+%?)\s+([\d.]+)\s+([+-]?[\d.]+)(?:deg)?(?:\s*\/\s*(\d?(?:\.\d+)?))?\s*\)$/i
  )
  if (oklch) {
    const Lraw = oklch[1]
    const C = parseFloat(oklch[2])
    const h = parseFloat(oklch[3])
    const a = oklch[4] != null ? parseFloat(oklch[4]) : 1
    const L = Lraw.endsWith('%')
      ? Math.max(0, Math.min(1, parseFloat(Lraw) / 100))
      : Math.max(0, Math.min(1, parseFloat(Lraw)))
    const [r, g, b] = oklchToRgb(L, C, h)
    return [r, g, b, a]
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

// Convert HSL (0..360, 0..1, 0..1) to RGB (0..255)
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r1 = 0,
    g1 = 0,
    b1 = 0
  if (0 <= h && h < 60) [r1, g1, b1] = [c, x, 0]
  else if (60 <= h && h < 120) [r1, g1, b1] = [x, c, 0]
  else if (120 <= h && h < 180) [r1, g1, b1] = [0, c, x]
  else if (180 <= h && h < 240) [r1, g1, b1] = [0, x, c]
  else if (240 <= h && h < 300) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ]
}

// Convert HWB (h degrees, w 0..1, b 0..1) to RGB (0..255)
function hwbToRgb(h: number, w: number, bl: number): [number, number, number] {
  h = ((h % 360) + 360) % 360
  // If w + b > 1, scale them down proportionally
  const sum = w + bl
  if (sum > 1) {
    w /= sum
    bl /= sum
  }
  // Pure hue color from HSL with s=1, l=0.5
  const [pr, pg, pb] = hslToRgb(h, 1, 0.5).map(v => v / 255) as [
    number,
    number,
    number,
  ]
  const scale = 1 - w - bl
  const r = pr * scale + w
  const g = pg * scale + w
  const b = pb * scale + w
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Convert RGB (0..255) to HSL (h 0..360, s 0..100, l 0..100)
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}

function rgbToHwb(r: number, g: number, b: number): [number, number, number] {
  const [h] = rgbToHsl(r, g, b)
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  const w = Math.min(rn, gn, bn)
  const bl = 1 - Math.max(rn, gn, bn)
  return [h, Math.round(w * 100), Math.round(bl * 100)]
}

// OKLCH/OKLab conversion helpers
function srgbToLinear(u: number): number {
  const v = u / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function linearToSrgb(u: number): number {
  const v = u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055
  return Math.round(Math.max(0, Math.min(1, v)) * 255)
}

function oklchToRgb(
  L: number,
  C: number,
  hDeg: number
): [number, number, number] {
  const h = (hDeg * Math.PI) / 180
  const a_ = Math.cos(h) * C
  const b_ = Math.sin(h) * C

  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_
  const s_ = L - 0.0894841775 * a_ - 1.291485548 * b_

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  return [linearToSrgb(rLin), linearToSrgb(gLin), linearToSrgb(bLin)]
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r)
  const gl = srgbToLinear(g)
  const bl = srgbToLinear(b)

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a_ = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const C = Math.sqrt(a_ * a_ + b_ * b_)
  let h = (Math.atan2(b_, a_) * 180) / Math.PI
  if (h < 0) h += 360
  return [L, C, h]
}

function formatColor(
  r: number,
  g: number,
  b: number,
  a: number,
  fmt: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'oklch',
  alphaEnabled?: boolean
): string {
  switch (fmt) {
    case 'hex':
      if (alphaEnabled) {
        const toHex = (n: number) => n.toString(16).padStart(2, '0')
        const aa = Math.max(0, Math.min(255, Math.round(a * 255)))
        return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(aa)}`
      }
      return rgbToHex(r, g, b)
    case 'rgb':
      return `rgb(${r}, ${g}, ${b})`
    case 'rgba':
      return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`
    case 'hsl': {
      const [h, s, l] = rgbToHsl(r, g, b)
      return `hsl(${h}, ${s}%, ${l}%)`
    }
    case 'hsla': {
      const [h, s, l] = rgbToHsl(r, g, b)
      return `hsla(${h}, ${s}%, ${l}%, ${Math.round(a * 100) / 100})`
    }
    case 'hwb': {
      const [h, w, bl] = rgbToHwb(r, g, b)
      return a < 1
        ? `hwb(${h} ${w}% ${bl}% / ${Math.round(a * 100) / 100})`
        : `hwb(${h} ${w}% ${bl}%)`
    }
    case 'oklch': {
      const [L, C, h] = rgbToOklch(r, g, b)
      const Ls = (Math.round(L * 1000) / 1000).toFixed(3)
      const Cs = (Math.round(C * 1000) / 1000).toFixed(3)
      const hs = (Math.round(h * 10) / 10).toFixed(1)
      const as = Math.round(a * 100) / 100
      return alphaEnabled || a < 1
        ? `oklch(${Ls} ${Cs} ${hs} / ${as})`
        : `oklch(${Ls} ${Cs} ${hs})`
    }
  }
}

function resolveEffectiveFormat(
  fmt: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'oklch',
  alphaEnabled: boolean
): 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'oklch' {
  if (alphaEnabled) {
    if (fmt === 'rgb') return 'rgba'
    if (fmt === 'hsl') return 'hsla'
    return fmt
  } else {
    if (fmt === 'rgba') return 'rgb'
    if (fmt === 'hsla') return 'hsl'
    return fmt
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
            const [r, g, b] = hexToRgb(hex)
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
            const [r, g, b] = hexToRgb(hex)
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
      attr.class('bc-color-input__alpha'),
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
        html.span(attr.class('bc-color-input__rgb'), rgbText)
      ),
      AlphaSlider,
      options.after
    ),
  })
}
