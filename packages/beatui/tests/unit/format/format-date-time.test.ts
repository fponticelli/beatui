import { describe, it, expect } from 'vitest'
import { formatDateTime } from '../../../src/components/format/format-date-time'
import type { TemporalDateLike } from '../../../src/components/format/format-date'

const fixedDate = new Date('2026-03-17T14:30:00Z')

describe('formatDateTime', () => {
  describe('basic formatting', () => {
    it('should format with medium date and short time', () => {
      const result = formatDateTime(fixedDate, 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('Mar 17, 2026, 2:30 PM')
    })

    it('should format with full date and long time', () => {
      const result = formatDateTime(fixedDate, 'en-US', {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: 'UTC',
      })
      expect(result).toContain('Tuesday, March 17, 2026')
      expect(result).toContain('2:30:00 PM')
      expect(result).toContain('UTC')
    })

    it('should format with short date and short time', () => {
      const result = formatDateTime(fixedDate, 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('3/17/26, 2:30 PM')
    })
  })

  describe('locale differences', () => {
    it('should format in de-DE locale', () => {
      const result = formatDateTime(fixedDate, 'de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toContain('17.03.2026')
      expect(result).toContain('14:30')
    })

    it('should format full date-time in de-DE', () => {
      const result = formatDateTime(fixedDate, 'de-DE', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toContain('Dienstag')
      expect(result).toContain('März')
      expect(result).toContain('14:30')
    })
  })

  describe('hour12 option', () => {
    it('should force 12-hour format', () => {
      const result = formatDateTime(fixedDate, 'de-DE', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
        hour12: true,
      })
      expect(result).toContain('2:30')
      expect(result.toLowerCase()).toContain('pm')
    })

    it('should force 24-hour format', () => {
      const result = formatDateTime(fixedDate, 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
        hour12: false,
      })
      expect(result).toContain('14:30')
    })
  })

  describe('string input', () => {
    it('should parse and format an ISO date-time string', () => {
      const result = formatDateTime('2026-03-17T14:30:00Z', 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('Mar 17, 2026, 2:30 PM')
    })
  })

  describe('number input (timestamp)', () => {
    it('should parse and format a Unix timestamp', () => {
      const result = formatDateTime(fixedDate.getTime(), 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('Mar 17, 2026, 2:30 PM')
    })
  })

  describe('TemporalDateLike input', () => {
    it('should delegate to toLocaleString for Temporal-like objects', () => {
      const temporal: TemporalDateLike = {
        toLocaleString(locale?: string, options?: Intl.DateTimeFormatOptions) {
          return `temporal-dt:${locale}:${options?.dateStyle}:${options?.timeStyle}`
        },
      }
      const result = formatDateTime(temporal, 'en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      })
      expect(result).toBe('temporal-dt:en-US:full:short')
    })
  })

  describe('edge cases', () => {
    it('should handle epoch date-time', () => {
      const result = formatDateTime(new Date(0), 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('Jan 1, 1970, 12:00 AM')
    })

    it('should handle midnight of a date', () => {
      const midnight = new Date('2026-03-17T00:00:00Z')
      const result = formatDateTime(midnight, 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('3/17/26, 12:00 AM')
    })
  })
})
