import { describe, it, expect } from 'vitest'
import { formatNumber } from '../../../src/components/format/format-number'

describe('formatNumber', () => {
  describe('basic formatting', () => {
    it('should format an integer with grouping separators', () => {
      expect(formatNumber(1234567, 'en-US')).toBe('1,234,567')
    })

    it('should format a decimal number', () => {
      expect(formatNumber(1234.5, 'en-US')).toBe('1,234.5')
    })

    it('should format zero', () => {
      expect(formatNumber(0, 'en-US')).toBe('0')
    })

    it('should format negative numbers', () => {
      expect(formatNumber(-42, 'en-US')).toBe('-42')
    })

    it('should format very large numbers', () => {
      expect(formatNumber(1_000_000_000, 'en-US')).toBe('1,000,000,000')
    })

    it('should format very small decimals', () => {
      expect(formatNumber(0.001, 'en-US')).toBe('0.001')
    })
  })

  describe('locale differences', () => {
    it('should use period as decimal separator for en-US', () => {
      expect(formatNumber(1234.56, 'en-US')).toBe('1,234.56')
    })

    it('should use comma as decimal separator for de-DE', () => {
      expect(formatNumber(1234.56, 'de-DE')).toBe('1.234,56')
    })
  })

  describe('currency style', () => {
    it('should format as USD currency', () => {
      expect(
        formatNumber(1234, 'en-US', { style: 'currency', currency: 'USD' })
      ).toBe('$1,234.00')
    })

    it('should format as EUR currency', () => {
      expect(
        formatNumber(1234, 'en-US', { style: 'currency', currency: 'EUR' })
      ).toBe('€1,234.00')
    })

    it('should format currency with de-DE locale', () => {
      const result = formatNumber(1234, 'de-DE', {
        style: 'currency',
        currency: 'EUR',
      })
      expect(result).toContain('1.234,00')
      expect(result).toContain('€')
    })
  })

  describe('percent style', () => {
    it('should format as percentage', () => {
      expect(formatNumber(0.85, 'en-US', { style: 'percent' })).toBe('85%')
    })

    it('should format 100% correctly', () => {
      expect(formatNumber(1, 'en-US', { style: 'percent' })).toBe('100%')
    })
  })

  describe('unit style', () => {
    it('should format with unit', () => {
      expect(
        formatNumber(100, 'en-US', { style: 'unit', unit: 'kilometer' })
      ).toBe('100 km')
    })

    it('should format with long unit display', () => {
      expect(
        formatNumber(1, 'en-US', {
          style: 'unit',
          unit: 'liter',
          unitDisplay: 'long',
        })
      ).toBe('1 liter')
    })
  })

  describe('notation options', () => {
    it('should format with compact notation', () => {
      const result = formatNumber(1500, 'en-US', { notation: 'compact' })
      expect(result).toBe('1.5K')
    })

    it('should format with scientific notation', () => {
      const result = formatNumber(123456, 'en-US', { notation: 'scientific' })
      expect(result).toContain('E')
    })
  })

  describe('digit options', () => {
    it('should respect minimumFractionDigits', () => {
      expect(
        formatNumber(42, 'en-US', { minimumFractionDigits: 2 })
      ).toBe('42.00')
    })

    it('should respect maximumFractionDigits', () => {
      expect(
        formatNumber(3.14159, 'en-US', { maximumFractionDigits: 2 })
      ).toBe('3.14')
    })

    it('should respect minimumIntegerDigits', () => {
      expect(
        formatNumber(5, 'en-US', { minimumIntegerDigits: 3 })
      ).toBe('005')
    })
  })

  describe('edge cases', () => {
    it('should format NaN', () => {
      expect(formatNumber(NaN, 'en-US')).toBe('NaN')
    })

    it('should format Infinity', () => {
      expect(formatNumber(Infinity, 'en-US')).toBe('∞')
    })

    it('should format negative Infinity', () => {
      expect(formatNumber(-Infinity, 'en-US')).toBe('-∞')
    })
  })
})
