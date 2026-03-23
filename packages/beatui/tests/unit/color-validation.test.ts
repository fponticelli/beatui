import { describe, it, expect } from 'vitest'
import {
  canParseColor,
  detectColorSpace,
  parseColor,
  colorToString,
  convertColor,
  rgb8a,
} from '@tempots/std/color'
import {
  canParseHex,
  rgb8aToHexString,
} from '@tempots/std/color-rgb'

describe('Color Validation Utilities', () => {
  describe('canParseHex (hex validation)', () => {
    it('should validate 3-character hex colors', () => {
      expect(canParseHex('#fff')).toBe(true)
      expect(canParseHex('#000')).toBe(true)
      expect(canParseHex('#abc')).toBe(true)
    })

    it('should validate 6-character hex colors', () => {
      expect(canParseHex('#ffffff')).toBe(true)
      expect(canParseHex('#000000')).toBe(true)
      expect(canParseHex('#abcdef')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      expect(canParseHex('#gggg')).toBe(false)
      expect(canParseHex('#fffffff')).toBe(false)
      expect(canParseHex('not-a-color')).toBe(false)
      expect(canParseHex('')).toBe(false)
    })
  })

  describe('detectColorSpace', () => {
    it('should detect hex colors as rgb8', () => {
      expect(detectColorSpace('#fff')).toBe('rgb8')
      expect(detectColorSpace('#ff0000')).toBe('rgb8')
    })

    it('should detect rgb() colors as rgb8', () => {
      expect(detectColorSpace('rgb(255, 0, 0)')).toBe('rgb8')
      expect(detectColorSpace('RGB(255, 255, 255)')).toBe('rgb8')
    })

    it('should detect hsl() colors as hsl', () => {
      expect(detectColorSpace('hsl(0, 100%, 50%)')).toBe('hsl')
      expect(detectColorSpace('HSL(180, 75%, 60%)')).toBe('hsl')
    })

    it('should return undefined for invalid colors', () => {
      expect(detectColorSpace('not-a-color')).toBeUndefined()
      expect(detectColorSpace('')).toBeUndefined()
    })
  })

  describe('canParseColor', () => {
    it('should validate any supported color format', () => {
      expect(canParseColor('#fff')).toBe(true)
      expect(canParseColor('rgb(255, 0, 0)')).toBe(true)
      expect(canParseColor('hsl(0, 100%, 50%)')).toBe(true)
    })

    it('should reject invalid colors', () => {
      expect(canParseColor('not-a-color')).toBe(false)
      expect(canParseColor('')).toBe(false)
    })
  })

  describe('colorToString', () => {
    it('should serialize RGB8A colors to rgb() format', () => {
      expect(colorToString(rgb8a(255, 0, 0))).toBe('rgb(255, 0, 0)')
      expect(colorToString(rgb8a(0, 255, 0))).toBe('rgb(0, 255, 0)')
      expect(colorToString(rgb8a(0, 0, 255))).toBe('rgb(0, 0, 255)')
      expect(colorToString(rgb8a(255, 255, 255))).toBe('rgb(255, 255, 255)')
    })
  })

  describe('rgb8aToHexString', () => {
    it('should serialize RGB8A colors to hex format', () => {
      expect(rgb8aToHexString(rgb8a(255, 0, 0))).toBe('#ff0000')
      expect(rgb8aToHexString(rgb8a(0, 255, 0))).toBe('#00ff00')
      expect(rgb8aToHexString(rgb8a(0, 0, 255))).toBe('#0000ff')
      expect(rgb8aToHexString(rgb8a(255, 255, 255))).toBe('#ffffff')
    })
  })

  describe('parseColor and convertColor round-trip', () => {
    it('should parse hex and convert to RGB8A', () => {
      const parsed = parseColor('#ff0000')
      const rgb = convertColor(parsed, 'rgb8')
      expect(rgb).toMatchObject({ r: 255, g: 0, b: 0 })
    })

    it('should parse 3-character hex', () => {
      const parsed = parseColor('#fff')
      const rgb = convertColor(parsed, 'rgb8')
      expect(rgb).toMatchObject({ r: 255, g: 255, b: 255 })
    })

    it('should parse rgb() strings', () => {
      const parsed = parseColor('rgb(255, 0, 0)')
      const rgb = convertColor(parsed, 'rgb8')
      expect(rgb).toMatchObject({ r: 255, g: 0, b: 0 })
    })

    it('should throw for invalid colors', () => {
      expect(() => parseColor('not-hex')).toThrow()
      expect(() => parseColor('#gg')).toThrow()
    })
  })
})
