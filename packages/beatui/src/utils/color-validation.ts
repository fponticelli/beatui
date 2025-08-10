/**
 * Color validation utilities for BeatUI color inputs
 */

/**
 * Validates if a string is a valid hex color
 * @param color - The color string to validate
 * @returns true if valid hex color, false otherwise
 */
export function isValidHexColor(color: string): boolean {
  if (typeof color !== 'string') return false

  // Remove # if present
  const hex = color.startsWith('#') ? color.slice(1) : color

  // Check if it's 3 or 6 characters and all are valid hex digits
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)
}

/**
 * Validates if a string is a valid RGB color
 * @param color - The color string to validate (e.g., "rgb(255, 0, 0)")
 * @returns true if valid RGB color, false otherwise
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
 * Validates if a string is a valid RGBA color
 * @param color - The color string to validate (e.g., "rgba(255, 0, 0, 0.5)")
 * @returns true if valid RGBA color, false otherwise
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
 * Validates if a string is a valid HSL color
 * @param color - The color string to validate (e.g., "hsl(120, 100%, 50%)")
 * @returns true if valid HSL color, false otherwise
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
 * Validates if a string is any valid color format
 * @param color - The color string to validate
 * @returns true if valid color in any supported format, false otherwise
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
 * Normalizes a hex color to always include the # prefix and be 6 characters
 * @param color - The hex color to normalize
 * @returns normalized hex color or null if invalid
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
 * Converts RGB values to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Converts hex color to RGB values
 * @param hex - Hex color string (with or without #)
 * @returns RGB values object or null if invalid
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
 * Gets the contrast ratio between two colors
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns contrast ratio or null if invalid colors
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
