import { describe, it, expect } from 'vitest'
import { formatList } from '../../../src/components/format/format-list'

describe('formatList', () => {
  describe('conjunction (and)', () => {
    it('should join three items with commas and "and"', () => {
      expect(formatList(['Red', 'Green', 'Blue'], 'en-US')).toBe(
        'Red, Green, and Blue'
      )
    })

    it('should join two items with "and"', () => {
      expect(formatList(['Red', 'Green'], 'en-US')).toBe('Red and Green')
    })

    it('should return single item as-is', () => {
      expect(formatList(['Red'], 'en-US')).toBe('Red')
    })

    it('should handle four items', () => {
      expect(formatList(['A', 'B', 'C', 'D'], 'en-US')).toBe(
        'A, B, C, and D'
      )
    })
  })

  describe('disjunction (or)', () => {
    it('should join items with "or"', () => {
      expect(
        formatList(['A', 'B'], 'en-US', { type: 'disjunction' })
      ).toBe('A or B')
    })

    it('should join three items with commas and "or"', () => {
      expect(
        formatList(['A', 'B', 'C'], 'en-US', { type: 'disjunction' })
      ).toBe('A, B, or C')
    })
  })

  describe('unit type', () => {
    it('should join items without conjunction words', () => {
      const result = formatList(['3 feet', '7 inches'], 'en-US', {
        type: 'unit',
      })
      expect(result).toBe('3 feet, 7 inches')
    })

    it('should join with narrow style', () => {
      const result = formatList(['3 feet', '7 inches'], 'en-US', {
        type: 'unit',
        style: 'narrow',
      })
      expect(result).toBe('3 feet 7 inches')
    })
  })

  describe('style options', () => {
    it('should format with long style (default)', () => {
      expect(
        formatList(['A', 'B', 'C'], 'en-US', { style: 'long' })
      ).toBe('A, B, and C')
    })

    it('should format with short style', () => {
      const result = formatList(['A', 'B', 'C'], 'en-US', { style: 'short' })
      expect(result).toBe('A, B, & C')
    })

    it('should format with narrow style', () => {
      const result = formatList(['A', 'B', 'C'], 'en-US', { style: 'narrow' })
      expect(result).toBe('A, B, C')
    })
  })

  describe('locale differences', () => {
    it('should format conjunction in de-DE', () => {
      expect(formatList(['Rot', 'Grün', 'Blau'], 'de-DE')).toBe(
        'Rot, Grün und Blau'
      )
    })

    it('should format disjunction in de-DE', () => {
      expect(
        formatList(['A', 'B', 'C'], 'de-DE', { type: 'disjunction' })
      ).toBe('A, B oder C')
    })
  })

  describe('edge cases', () => {
    it('should handle empty array', () => {
      expect(formatList([], 'en-US')).toBe('')
    })

    it('should handle items with special characters', () => {
      const result = formatList(['foo & bar', 'baz'], 'en-US')
      expect(result).toBe('foo & bar and baz')
    })

    it('should handle items with commas in text', () => {
      const result = formatList(['A, Inc.', 'B, Ltd.'], 'en-US')
      expect(result).toContain('A, Inc.')
      expect(result).toContain('B, Ltd.')
    })
  })
})
