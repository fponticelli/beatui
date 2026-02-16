/**
 * Color validation, conversion, and formatting utilities for BeatUI.
 *
 * Provides comprehensive color handling including validation for multiple color
 * formats (hex, RGB, RGBA, HSL), conversion between color spaces (RGB, HSL, HWB,
 * OKLCH), contrast ratio calculation, and color string formatting.
 *
 * @module
 */

/**
 * Validates if a string is a valid hex color (3 or 6 character format, with or without `#`).
 *
 * @param color - The color string to validate
 * @returns `true` if valid hex color, `false` otherwise
 *
 * @example
 * ```ts
 * isValidHexColor('#ff0000') // true
 * isValidHexColor('abc')     // true
 * isValidHexColor('#gggggg') // false
 * ```
 */
export function isValidHexColor(color: string): boolean {
  if (typeof color !== 'string') return false

  // Remove # if present
  const hex = color.startsWith('#') ? color.slice(1) : color

  // Check if it's 3 or 6 characters and all are valid hex digits
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)
}

/**
 * Validates if a string is a valid CSS `rgb()` color with values in range 0-255.
 *
 * @param color - The color string to validate (e.g., `"rgb(255, 0, 0)"`)
 * @returns `true` if valid RGB color, `false` otherwise
 *
 * @example
 * ```ts
 * isValidRgbColor('rgb(255, 0, 0)')   // true
 * isValidRgbColor('rgb(300, 0, 0)')   // false (out of range)
 * isValidRgbColor('rgba(0, 0, 0, 1)') // false (use isValidRgbaColor)
 * ```
 */
export function isValidRgbColor(color: string): boolean {
  if (typeof color !== 'string') return false

  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i
  const match = color.match(rgbRegex)

  if (!match) return false

  const [, r, g, b] = match
  const red = parseInt(r, 10)
  const green = parseInt(g, 10)
  const blue = parseInt(b, 10)

  return (
    red >= 0 &&
    red <= 255 &&
    green >= 0 &&
    green <= 255 &&
    blue >= 0 &&
    blue <= 255
  )
}

/**
 * Validates if a string is a valid CSS `rgba()` color with values in range
 * 0-255 for RGB and 0-1 for alpha.
 *
 * @param color - The color string to validate (e.g., `"rgba(255, 0, 0, 0.5)"`)
 * @returns `true` if valid RGBA color, `false` otherwise
 *
 * @example
 * ```ts
 * isValidRgbaColor('rgba(255, 0, 0, 0.5)') // true
 * isValidRgbaColor('rgba(255, 0, 0, 2)')   // false (alpha out of range)
 * ```
 */
export function isValidRgbaColor(color: string): boolean {
  if (typeof color !== 'string') return false

  const rgbaRegex =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i
  const match = color.match(rgbaRegex)

  if (!match) return false

  const [, r, g, b, a] = match
  const red = parseInt(r, 10)
  const green = parseInt(g, 10)
  const blue = parseInt(b, 10)
  const alpha = parseFloat(a)

  return (
    red >= 0 &&
    red <= 255 &&
    green >= 0 &&
    green <= 255 &&
    blue >= 0 &&
    blue <= 255 &&
    alpha >= 0 &&
    alpha <= 1
  )
}

/**
 * Validates if a string is a valid CSS `hsl()` color with hue 0-360 and
 * saturation/lightness 0-100%.
 *
 * @param color - The color string to validate (e.g., `"hsl(120, 100%, 50%)"`)
 * @returns `true` if valid HSL color, `false` otherwise
 *
 * @example
 * ```ts
 * isValidHslColor('hsl(120, 100%, 50%)') // true
 * isValidHslColor('hsl(400, 100%, 50%)') // false (hue out of range)
 * ```
 */
export function isValidHslColor(color: string): boolean {
  if (typeof color !== 'string') return false

  const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i
  const match = color.match(hslRegex)

  if (!match) return false

  const [, h, s, l] = match
  const hue = parseInt(h, 10)
  const saturation = parseInt(s, 10)
  const lightness = parseInt(l, 10)

  return (
    hue >= 0 &&
    hue <= 360 &&
    saturation >= 0 &&
    saturation <= 100 &&
    lightness >= 0 &&
    lightness <= 100
  )
}

/**
 * Validates if a string is a valid color in any supported format
 * (hex, RGB, RGBA, or HSL).
 *
 * @param color - The color string to validate
 * @returns `true` if valid color in any supported format, `false` otherwise
 *
 * @example
 * ```ts
 * isValidColor('#ff0000')            // true
 * isValidColor('rgb(255, 0, 0)')     // true
 * isValidColor('not-a-color')        // false
 * ```
 */
export function isValidColor(color: string): boolean {
  return (
    isValidHexColor(color) ||
    isValidRgbColor(color) ||
    isValidRgbaColor(color) ||
    isValidHslColor(color)
  )
}

/**
 * Normalizes a hex color to always include the `#` prefix and be 6 characters
 * (lowercase). Expands 3-character shorthand to full 6-character form.
 *
 * @param color - The hex color to normalize
 * @returns Normalized hex color string (e.g., `'#ff0000'`) or `null` if invalid
 *
 * @example
 * ```ts
 * normalizeHexColor('abc')     // '#aabbcc'
 * normalizeHexColor('#FF0000') // '#ff0000'
 * normalizeHexColor('invalid') // null
 * ```
 */
export function normalizeHexColor(color: string): string | null {
  if (!isValidHexColor(color)) return null

  let hex = color.startsWith('#') ? color.slice(1) : color

  // Convert 3-character hex to 6-character
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  return `#${hex.toLowerCase()}`
}

/**
 * Converts RGB channel values to a hex color string. Values are clamped to 0-255.
 *
 * @param r - Red channel value (0-255)
 * @param g - Green channel value (0-255)
 * @param b - Blue channel value (0-255)
 * @returns Hex color string with `#` prefix (e.g., `'#ff0000'`)
 *
 * @example
 * ```ts
 * rgbToHex(255, 0, 0)   // '#ff0000'
 * rgbToHex(0, 128, 255)  // '#0080ff'
 * ```
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Converts a hex color string to RGB channel values. Handles both 3-character
 * and 6-character hex values, with or without the `#` prefix.
 *
 * @param hex - Hex color string (with or without `#`)
 * @returns Object with `r`, `g`, `b` properties (0-255 each) or `null` if invalid
 *
 * @example
 * ```ts
 * hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }
 * hexToRgb('abc')     // { r: 170, g: 187, b: 204 }
 * hexToRgb('invalid') // null
 * ```
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return null

  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculates the WCAG 2.0 contrast ratio between two hex colors.
 * The ratio ranges from 1:1 (identical) to 21:1 (black on white).
 * A ratio of at least 4.5 is required for WCAG AA text compliance.
 *
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @returns The contrast ratio as a number, or `null` if either color is invalid
 *
 * @example
 * ```ts
 * getContrastRatio('#000000', '#ffffff') // 21
 * getContrastRatio('#ff0000', '#00ff00') // ~2.91
 * ```
 */
export function getContrastRatio(
  color1: string,
  color2: string
): number | null {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return null

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Parses any supported CSS color string into an `[r, g, b, a]` tuple.
 *
 * Supported formats:
 * - Hex: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` (with or without `#`)
 * - RGB: `rgb(r, g, b)`
 * - RGBA: `rgba(r, g, b, a)`
 * - HSL/HSLA: `hsl(h, s%, l%)`, `hsla(h, s%, l%, a)`, and modern syntax
 * - HWB: `hwb(h w% b% / a)`
 * - OKLCH: `oklch(L C h / a)`
 *
 * @param v - The color string to parse
 * @returns A tuple of `[red, green, blue, alpha]` where RGB are 0-255 and alpha is 0-1.
 *   Returns `[0, 0, 0, 1]` for empty or unparseable input.
 *
 * @example
 * ```ts
 * parseAnyColor('#ff0000')             // [255, 0, 0, 1]
 * parseAnyColor('rgba(0, 128, 255, 0.5)') // [0, 128, 255, 0.5]
 * parseAnyColor('oklch(0.623 0.214 259.815)') // [approximately 59, 130, 246, 1]
 * ```
 */
export function parseAnyColor(v: string): [number, number, number, number] {
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
  const color = hexToRgb(v)
  if (color) return [color.r, color.g, color.b, 1]
  return [0, 0, 0, 1]
}

/**
 * Formats RGBA values into a CSS `rgba()` string. Alpha is clamped to 0-1
 * and rounded to 2 decimal places; RGB values are rounded to integers.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @param a - Alpha channel (0-1)
 * @returns A CSS `rgba()` string (e.g., `'rgba(255, 0, 0, 0.5)'`)
 *
 * @example
 * ```ts
 * toRgbaString(255, 0, 0, 0.5) // 'rgba(255, 0, 0, 0.5)'
 * ```
 */
export function toRgbaString(r: number, g: number, b: number, a: number) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.max(
    0,
    Math.min(1, Math.round(a * 100) / 100)
  )})`
}

/**
 * Creates a seeded pseudo-random number generator using the Mulberry32 algorithm.
 * Useful for generating deterministic "random" values (e.g., for color hashing).
 *
 * @param seed - The integer seed value
 * @returns A function that returns the next pseudo-random number in the range [0, 1)
 *
 * @example
 * ```ts
 * const random = mulberry32(42)
 * random() // 0.6011037519201636 (deterministic)
 * random() // 0.4321023514959961
 * ```
 */
export function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Converts HSL color values to RGB. Hue is wrapped to 0-360 range.
 *
 * @param h - Hue in degrees (0-360)
 * @param s - Saturation as a fraction (0-1)
 * @param l - Lightness as a fraction (0-1)
 * @returns A tuple of `[red, green, blue]` with values 0-255
 *
 * @example
 * ```ts
 * hslToRgb(0, 1, 0.5)   // [255, 0, 0] (red)
 * hslToRgb(120, 1, 0.5)  // [0, 255, 0] (green)
 * ```
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r1: number, g1: number, b1: number
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

/**
 * Converts HWB (Hue-Whiteness-Blackness) color values to RGB.
 * If whiteness + blackness exceeds 1, they are scaled proportionally.
 *
 * @param h - Hue in degrees (0-360)
 * @param w - Whiteness as a fraction (0-1)
 * @param bl - Blackness as a fraction (0-1)
 * @returns A tuple of `[red, green, blue]` with values 0-255
 *
 * @example
 * ```ts
 * hwbToRgb(0, 0, 0)     // [255, 0, 0] (pure red)
 * hwbToRgb(0, 0.5, 0.5) // [128, 128, 128] (gray)
 * ```
 */
export function hwbToRgb(
  h: number,
  w: number,
  bl: number
): [number, number, number] {
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

/**
 * Converts RGB color values to HSL. Returns rounded integer values.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns A tuple of `[hue, saturation, lightness]` where hue is 0-360 and
 *   saturation/lightness are 0-100 (percentage)
 *
 * @example
 * ```ts
 * rgbToHsl(255, 0, 0)   // [0, 100, 50]
 * rgbToHsl(0, 128, 255)  // [210, 100, 50]
 * ```
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
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

/**
 * Converts RGB color values to HWB (Hue-Whiteness-Blackness).
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns A tuple of `[hue, whiteness, blackness]` where hue is 0-360 and
 *   whiteness/blackness are 0-100 (percentage)
 *
 * @example
 * ```ts
 * rgbToHwb(255, 0, 0)   // [0, 0, 0]
 * rgbToHwb(128, 128, 128) // [0, 50, 50]
 * ```
 */
export function rgbToHwb(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const [h] = rgbToHsl(r, g, b)
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  const w = Math.min(rn, gn, bn)
  const bl = 1 - Math.max(rn, gn, bn)
  return [h, Math.round(w * 100), Math.round(bl * 100)]
}

/**
 * Converts an sRGB channel value (0-255) to linear RGB (0-1).
 * Applies the standard sRGB gamma decompression curve.
 *
 * @param u - sRGB channel value (0-255)
 * @returns Linear RGB value (0-1)
 */
export function srgbToLinear(u: number): number {
  const v = u / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/**
 * Converts a linear RGB value (0-1) to an sRGB channel value (0-255).
 * Applies the standard sRGB gamma compression curve, clamping and rounding the result.
 *
 * @param u - Linear RGB value (0-1)
 * @returns sRGB channel value (0-255)
 */
export function linearToSrgb(u: number): number {
  const v = u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055
  return Math.round(Math.max(0, Math.min(1, v)) * 255)
}

/**
 * Converts OKLCH color values to sRGB. Uses the OKLab intermediate color space
 * with matrix transforms to linear sRGB.
 *
 * @param L - Lightness (0-1)
 * @param C - Chroma (0 to approximately 0.4)
 * @param hDeg - Hue angle in degrees (0-360)
 * @returns A tuple of `[red, green, blue]` with values 0-255
 *
 * @example
 * ```ts
 * oklchToRgb(0.623, 0.214, 259.815) // approximately [59, 130, 246] (blue-500)
 * ```
 */
export function oklchToRgb(
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

/**
 * Converts sRGB color values to OKLCH color space.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns A tuple of `[lightness, chroma, hue]` where lightness is 0-1,
 *   chroma is 0 to ~0.4, and hue is 0-360 degrees
 *
 * @example
 * ```ts
 * rgbToOklch(59, 130, 246) // approximately [0.623, 0.214, 259.815]
 * ```
 */
export function rgbToOklch(
  r: number,
  g: number,
  b: number
): [number, number, number] {
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

/**
 * Formats RGBA color values into a CSS color string in the specified format.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @param a - Alpha channel (0-1)
 * @param fmt - The output format: `'hex'`, `'rgb'`, `'rgba'`, `'hsl'`, `'hsla'`, `'hwb'`, or `'oklch'`
 * @param alphaEnabled - Whether to include alpha in formats that support it (hex, oklch)
 * @returns A CSS color string in the requested format
 *
 * @example
 * ```ts
 * formatColor(255, 0, 0, 1, 'hex')           // '#ff0000'
 * formatColor(255, 0, 0, 0.5, 'hex', true)   // '#ff000080'
 * formatColor(255, 0, 0, 1, 'hsl')           // 'hsl(0, 100%, 50%)'
 * formatColor(255, 0, 0, 1, 'oklch')         // 'oklch(0.628 0.258 29.2)'
 * ```
 */
export function formatColor(
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

/**
 * Resolves the effective color format based on whether alpha is enabled.
 * When alpha is enabled, `'rgb'` becomes `'rgba'` and `'hsl'` becomes `'hsla'`.
 * When alpha is disabled, `'rgba'` becomes `'rgb'` and `'hsla'` becomes `'hsl'`.
 * Other formats (hex, hwb, oklch) are returned unchanged.
 *
 * @param fmt - The requested color format
 * @param alphaEnabled - Whether alpha channel is enabled
 * @returns The resolved effective color format
 *
 * @example
 * ```ts
 * resolveEffectiveFormat('rgb', true)   // 'rgba'
 * resolveEffectiveFormat('rgba', false) // 'rgb'
 * resolveEffectiveFormat('hex', true)   // 'hex'
 * ```
 */
export function resolveEffectiveFormat(
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
