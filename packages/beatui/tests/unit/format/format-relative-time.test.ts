import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from '../../../src/components/format/format-relative-time'

describe('formatRelativeTime', () => {
  describe('basic past formatting', () => {
    it('should format days ago', () => {
      expect(formatRelativeTime(-2, 'day', 'en-US')).toBe('2 days ago')
    })

    it('should format hours ago', () => {
      expect(formatRelativeTime(-3, 'hour', 'en-US')).toBe('3 hours ago')
    })

    it('should format minutes ago', () => {
      expect(formatRelativeTime(-10, 'minute', 'en-US')).toBe('10 minutes ago')
    })

    it('should format seconds ago', () => {
      expect(formatRelativeTime(-30, 'second', 'en-US')).toBe('30 seconds ago')
    })
  })

  describe('basic future formatting', () => {
    it('should format days in future', () => {
      expect(formatRelativeTime(3, 'day', 'en-US')).toBe('in 3 days')
    })

    it('should format hours in future', () => {
      expect(formatRelativeTime(5, 'hour', 'en-US')).toBe('in 5 hours')
    })

    it('should format months in future', () => {
      expect(formatRelativeTime(2, 'month', 'en-US')).toBe('in 2 months')
    })

    it('should format years in future', () => {
      expect(formatRelativeTime(1, 'year', 'en-US')).toBe('in 1 year')
    })
  })

  describe('numeric auto option', () => {
    it('should format -1 day as yesterday', () => {
      expect(
        formatRelativeTime(-1, 'day', 'en-US', { numeric: 'auto' })
      ).toBe('yesterday')
    })

    it('should format 1 day as tomorrow', () => {
      expect(
        formatRelativeTime(1, 'day', 'en-US', { numeric: 'auto' })
      ).toBe('tomorrow')
    })

    it('should format 0 day as today', () => {
      expect(
        formatRelativeTime(0, 'day', 'en-US', { numeric: 'auto' })
      ).toBe('today')
    })

    it('should still use numeric for -2 days even with auto', () => {
      expect(
        formatRelativeTime(-2, 'day', 'en-US', { numeric: 'auto' })
      ).toBe('2 days ago')
    })
  })

  describe('locale differences', () => {
    it('should format in de-DE locale', () => {
      expect(formatRelativeTime(-2, 'day', 'de-DE')).toBe('vor 2 Tagen')
    })

    it('should format yesterday in de-DE with auto', () => {
      expect(
        formatRelativeTime(-1, 'day', 'de-DE', { numeric: 'auto' })
      ).toBe('gestern')
    })

    it('should format future in de-DE', () => {
      expect(formatRelativeTime(3, 'hour', 'de-DE')).toBe('in 3 Stunden')
    })
  })

  describe('style options', () => {
    it('should format with short style', () => {
      const result = formatRelativeTime(-2, 'day', 'en-US', {
        style: 'short',
      })
      expect(result).toBe('2 days ago')
    })

    it('should format with narrow style', () => {
      const result = formatRelativeTime(-2, 'day', 'en-US', {
        style: 'narrow',
      })
      expect(result).toBe('2d ago')
    })

    it('should format with long style', () => {
      const result = formatRelativeTime(-2, 'day', 'en-US', {
        style: 'long',
      })
      expect(result).toBe('2 days ago')
    })
  })

  describe('all unit types', () => {
    it('should format quarter', () => {
      expect(formatRelativeTime(-1, 'quarter', 'en-US')).toBe('1 quarter ago')
    })

    it('should format week', () => {
      expect(formatRelativeTime(-1, 'week', 'en-US')).toBe('1 week ago')
    })

    it('should format month', () => {
      expect(formatRelativeTime(-1, 'month', 'en-US')).toBe('1 month ago')
    })

    it('should format year', () => {
      expect(formatRelativeTime(-1, 'year', 'en-US')).toBe('1 year ago')
    })
  })

  describe('edge cases', () => {
    it('should handle zero offset', () => {
      const result = formatRelativeTime(0, 'second', 'en-US')
      expect(result).toBe('in 0 seconds')
    })

    it('should handle large numbers', () => {
      const result = formatRelativeTime(-365, 'day', 'en-US')
      expect(result).toBe('365 days ago')
    })
  })
})
