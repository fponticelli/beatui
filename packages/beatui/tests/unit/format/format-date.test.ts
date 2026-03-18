import { describe, it, expect } from 'vitest'
import { formatDate } from '../../../src/components/format/format-date'
import type { TemporalDateLike } from '../../../src/components/format/format-date'

const fixedDate = new Date('2026-03-17T14:30:00Z')

describe('formatDate', () => {
  describe('basic formatting with Date objects', () => {
    it('should format with medium dateStyle by default-like options', () => {
      const result = formatDate(fixedDate, 'en-US', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      })
      expect(result).toBe('Mar 17, 2026')
    })

    it('should format with full dateStyle', () => {
      const result = formatDate(fixedDate, 'en-US', {
        dateStyle: 'full',
        timeZone: 'UTC',
      })
      expect(result).toBe('Tuesday, March 17, 2026')
    })

    it('should format with long dateStyle', () => {
      const result = formatDate(fixedDate, 'en-US', {
        dateStyle: 'long',
        timeZone: 'UTC',
      })
      expect(result).toBe('March 17, 2026')
    })

    it('should format with short dateStyle', () => {
      const result = formatDate(fixedDate, 'en-US', {
        dateStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('3/17/26')
    })
  })

  describe('locale differences', () => {
    it('should format in de-DE locale', () => {
      const result = formatDate(fixedDate, 'de-DE', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      })
      expect(result).toBe('17.03.2026')
    })

    it('should format in de-DE with full dateStyle', () => {
      const result = formatDate(fixedDate, 'de-DE', {
        dateStyle: 'full',
        timeZone: 'UTC',
      })
      expect(result).toBe('Dienstag, 17. März 2026')
    })
  })

  describe('string input (ISO 8601)', () => {
    it('should parse and format an ISO date string', () => {
      const result = formatDate('2026-03-17T14:30:00Z', 'en-US', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      })
      expect(result).toBe('Mar 17, 2026')
    })
  })

  describe('number input (timestamp)', () => {
    it('should parse and format a Unix timestamp', () => {
      const timestamp = fixedDate.getTime()
      const result = formatDate(timestamp, 'en-US', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      })
      expect(result).toBe('Mar 17, 2026')
    })
  })

  describe('TemporalDateLike input', () => {
    it('should delegate to toLocaleString for Temporal-like objects', () => {
      const temporal: TemporalDateLike = {
        toLocaleString(locale?: string, options?: Intl.DateTimeFormatOptions) {
          return `temporal:${locale}:${options?.dateStyle ?? 'none'}`
        },
      }
      const result = formatDate(temporal, 'en-US', { dateStyle: 'full' })
      expect(result).toBe('temporal:en-US:full')
    })
  })

  describe('fine-grained options', () => {
    it('should format with weekday and month', () => {
      const result = formatDate(fixedDate, 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
      expect(result).toBe('Tue, Mar 17')
    })

    it('should format with numeric year, month, day', () => {
      const result = formatDate(fixedDate, 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC',
      })
      expect(result).toBe('03/17/2026')
    })
  })

  describe('edge cases', () => {
    it('should handle epoch date', () => {
      const result = formatDate(new Date(0), 'en-US', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      })
      expect(result).toBe('Jan 1, 1970')
    })

    it('should handle dates far in the future', () => {
      const result = formatDate(new Date('2999-12-31T00:00:00Z'), 'en-US', {
        dateStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('12/31/99')
    })
  })
})
