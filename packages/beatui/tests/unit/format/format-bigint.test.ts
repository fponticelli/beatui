import { describe, it, expect } from 'vitest'
import { formatBigInt } from '../../../src/components/format/format-bigint'

describe('formatBigInt', () => {
  describe('basic formatting', () => {
    it('should format a bigint with grouping separators', () => {
      expect(formatBigInt(9007199254740993n, 'en-US')).toBe(
        '9,007,199,254,740,993'
      )
    })

    it('should format zero', () => {
      expect(formatBigInt(0n, 'en-US')).toBe('0')
    })

    it('should format negative bigint', () => {
      expect(formatBigInt(-123456n, 'en-US')).toBe('-123,456')
    })

    it('should format small bigint without grouping', () => {
      expect(formatBigInt(42n, 'en-US')).toBe('42')
    })
  })

  describe('locale differences', () => {
    it('should use comma grouping for en-US', () => {
      expect(formatBigInt(1234567n, 'en-US')).toBe('1,234,567')
    })

    it('should use period grouping for de-DE', () => {
      expect(formatBigInt(1234567n, 'de-DE')).toBe('1.234.567')
    })
  })

  describe('currency style', () => {
    it('should format as JPY currency', () => {
      expect(
        formatBigInt(123456789n, 'en-US', {
          style: 'currency',
          currency: 'JPY',
        })
      ).toBe('¥123,456,789')
    })

    it('should format as USD currency', () => {
      expect(
        formatBigInt(1000n, 'en-US', { style: 'currency', currency: 'USD' })
      ).toBe('$1,000.00')
    })

    it('should format currency with de-DE locale', () => {
      const result = formatBigInt(1000n, 'de-DE', {
        style: 'currency',
        currency: 'EUR',
      })
      expect(result).toContain('1.000,00')
      expect(result).toContain('€')
    })
  })

  describe('unit style', () => {
    it('should format with unit', () => {
      expect(
        formatBigInt(500n, 'en-US', { style: 'unit', unit: 'kilometer' })
      ).toBe('500 km')
    })

    it('should format with long unit display', () => {
      expect(
        formatBigInt(1n, 'en-US', {
          style: 'unit',
          unit: 'meter',
          unitDisplay: 'long',
        })
      ).toBe('1 meter')
    })
  })

  describe('digit options', () => {
    it('should respect minimumIntegerDigits', () => {
      expect(
        formatBigInt(5n, 'en-US', { minimumIntegerDigits: 4 })
      ).toBe('0,005')
    })

    it('should respect minimumFractionDigits', () => {
      expect(
        formatBigInt(42n, 'en-US', { minimumFractionDigits: 2 })
      ).toBe('42.00')
    })
  })

  describe('sign display', () => {
    it('should show sign always', () => {
      expect(
        formatBigInt(10n, 'en-US', { signDisplay: 'always' })
      ).toBe('+10')
    })

    it('should never show sign', () => {
      expect(
        formatBigInt(-10n, 'en-US', { signDisplay: 'never' })
      ).toBe('10')
    })
  })

  describe('edge cases', () => {
    it('should format very large bigint values beyond Number.MAX_SAFE_INTEGER', () => {
      const big = 99999999999999999999n
      const result = formatBigInt(big, 'en-US')
      expect(result).toBe('99,999,999,999,999,999,999')
    })
  })
})
