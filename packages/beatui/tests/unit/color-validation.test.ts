import { describe, it, expect } from 'vitest'
import {
  isValidHexColor,
  isValidRgbColor,
  isValidRgbaColor,
  isValidHslColor,
  isValidColor,
  normalizeHexColor,
  rgbToHex,
  hexToRgb,
  getContrastRatio,
} from '../../src/utils/color-validation'

describe('Color Validation Utilities', () => {
  describe('isValidHexColor', () => {
    it('should validate 3-character hex colors', () => {
      expect(isValidHexColor('#fff')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#abc')).toBe(true)
      expect(isValidHexColor('fff')).toBe(true)
    })

    it('should validate 6-character hex colors', () => {
      expect(isValidHexColor('#ffffff')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#abcdef')).toBe(true)
      expect(isValidHexColor('ffffff')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('#gggg')).toBe(false)
      expect(isValidHexColor('#ff')).toBe(false)
      expect(isValidHexColor('#fffffff')).toBe(false)
      expect(isValidHexColor('not-a-color')).toBe(false)
      expect(isValidHexColor('')).toBe(false)
    })

    it('should handle non-string inputs', () => {
      expect(isValidHexColor(null as unknown)).toBe(false)
      expect(isValidHexColor(undefined as unknown)).toBe(false)
      expect(isValidHexColor(123 as unknown)).toBe(false)
    })
  })

  describe('isValidRgbColor', () => {
    it('should validate RGB colors', () => {
      expect(isValidRgbColor('rgb(255, 0, 0)')).toBe(true)
      expect(isValidRgbColor('rgb(0, 255, 0)')).toBe(true)
      expect(isValidRgbColor('rgb(0, 0, 255)')).toBe(true)
      expect(isValidRgbColor('RGB(255, 255, 255)')).toBe(true)
    })

    it('should reject invalid RGB colors', () => {
      expect(isValidRgbColor('rgb(256, 0, 0)')).toBe(false)
      expect(isValidRgbColor('rgb(-1, 0, 0)')).toBe(false)
      expect(isValidRgbColor('rgb(255, 0)')).toBe(false)
      expect(isValidRgbColor('not-rgb')).toBe(false)
    })
  })

  describe('isValidRgbaColor', () => {
    it('should validate RGBA colors', () => {
      expect(isValidRgbaColor('rgba(255, 0, 0, 1)')).toBe(true)
      expect(isValidRgbaColor('rgba(0, 255, 0, 0.5)')).toBe(true)
      expect(isValidRgbaColor('rgba(0, 0, 255, 0)')).toBe(true)
      expect(isValidRgbaColor('RGBA(255, 255, 255, 0.8)')).toBe(true)
    })

    it('should reject invalid RGBA colors', () => {
      expect(isValidRgbaColor('rgba(256, 0, 0, 1)')).toBe(false)
      expect(isValidRgbaColor('rgba(255, 0, 0, 2)')).toBe(false)
      expect(isValidRgbaColor('rgba(255, 0, 0, -1)')).toBe(false)
      expect(isValidRgbaColor('rgba(255, 0, 0)')).toBe(false)
    })
  })

  describe('isValidHslColor', () => {
    it('should validate HSL colors', () => {
      expect(isValidHslColor('hsl(0, 100%, 50%)')).toBe(true)
      expect(isValidHslColor('hsl(120, 50%, 25%)')).toBe(true)
      expect(isValidHslColor('hsl(360, 0%, 100%)')).toBe(true)
      expect(isValidHslColor('HSL(180, 75%, 60%)')).toBe(true)
    })

    it('should reject invalid HSL colors', () => {
      expect(isValidHslColor('hsl(361, 100%, 50%)')).toBe(false)
      expect(isValidHslColor('hsl(0, 101%, 50%)')).toBe(false)
      expect(isValidHslColor('hsl(0, 100%, 101%)')).toBe(false)
      expect(isValidHslColor('hsl(0, 100%)')).toBe(false)
    })
  })

  describe('isValidColor', () => {
    it('should validate any supported color format', () => {
      expect(isValidColor('#fff')).toBe(true)
      expect(isValidColor('rgb(255, 0, 0)')).toBe(true)
      expect(isValidColor('rgba(255, 0, 0, 0.5)')).toBe(true)
      expect(isValidColor('hsl(0, 100%, 50%)')).toBe(true)
    })

    it('should reject invalid colors', () => {
      expect(isValidColor('not-a-color')).toBe(false)
      expect(isValidColor('')).toBe(false)
    })
  })

  describe('normalizeHexColor', () => {
    it('should normalize 3-character hex to 6-character', () => {
      expect(normalizeHexColor('#fff')).toBe('#ffffff')
      expect(normalizeHexColor('#abc')).toBe('#aabbcc')
      expect(normalizeHexColor('fff')).toBe('#ffffff')
    })

    it('should normalize 6-character hex', () => {
      expect(normalizeHexColor('#FFFFFF')).toBe('#ffffff')
      expect(normalizeHexColor('ABCDEF')).toBe('#abcdef')
    })

    it('should return null for invalid hex colors', () => {
      expect(normalizeHexColor('not-hex')).toBe(null)
      expect(normalizeHexColor('#gg')).toBe(null)
    })
  })

  describe('rgbToHex', () => {
    it('should convert RGB values to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
    })

    it('should clamp values to valid range', () => {
      expect(rgbToHex(300, -10, 128)).toBe('#ff0080')
    })
  })

  describe('hexToRgb', () => {
    it('should convert hex to RGB values', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('should handle 3-character hex', () => {
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid hex', () => {
      expect(hexToRgb('not-hex')).toBe(null)
      expect(hexToRgb('#gg')).toBe(null)
    })
  })

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between colors', () => {
      // Black and white should have maximum contrast
      const blackWhiteRatio = getContrastRatio('#000000', '#ffffff')
      expect(blackWhiteRatio).toBeCloseTo(21, 1)

      // Same colors should have minimum contrast
      const sameColorRatio = getContrastRatio('#ff0000', '#ff0000')
      expect(sameColorRatio).toBe(1)
    })

    it('should return null for invalid colors', () => {
      expect(getContrastRatio('invalid', '#ffffff')).toBe(null)
      expect(getContrastRatio('#ffffff', 'invalid')).toBe(null)
    })
  })
})
