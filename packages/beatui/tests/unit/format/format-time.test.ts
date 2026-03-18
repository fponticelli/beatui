import { describe, it, expect } from 'vitest'
import { formatTime } from '../../../src/components/format/format-time'
import type { TemporalDateLike } from '../../../src/components/format/format-date'

const fixedDate = new Date('2026-03-17T14:30:45Z')

describe('formatTime', () => {
  describe('basic formatting', () => {
    it('should format with short timeStyle', () => {
      const result = formatTime(fixedDate, 'en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('2:30 PM')
    })

    it('should format with medium timeStyle', () => {
      const result = formatTime(fixedDate, 'en-US', {
        timeStyle: 'medium',
        timeZone: 'UTC',
      })
      expect(result).toBe('2:30:45 PM')
    })

    it('should format with long timeStyle', () => {
      const result = formatTime(fixedDate, 'en-US', {
        timeStyle: 'long',
        timeZone: 'UTC',
      })
      expect(result).toContain('2:30:45 PM')
      expect(result).toContain('UTC')
    })
  })

  describe('locale differences', () => {
    it('should format in en-US with 12-hour time', () => {
      const result = formatTime(fixedDate, 'en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('2:30 PM')
    })

    it('should format in de-DE with 24-hour time', () => {
      const result = formatTime(fixedDate, 'de-DE', {
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('14:30')
    })

    it('should format medium time in de-DE', () => {
      const result = formatTime(fixedDate, 'de-DE', {
        timeStyle: 'medium',
        timeZone: 'UTC',
      })
      expect(result).toBe('14:30:45')
    })
  })

  describe('hour12 option', () => {
    it('should force 12-hour format', () => {
      const result = formatTime(fixedDate, 'de-DE', {
        timeStyle: 'short',
        timeZone: 'UTC',
        hour12: true,
      })
      expect(result).toContain('2:30')
      expect(result.toLowerCase()).toContain('pm')
    })

    it('should force 24-hour format', () => {
      const result = formatTime(fixedDate, 'en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
        hour12: false,
      })
      expect(result).toContain('14:30')
    })
  })

  describe('fine-grained options', () => {
    it('should format with hour and minute only', () => {
      const result = formatTime(fixedDate, 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      })
      expect(result).toContain('2:30')
    })

    it('should format with hour, minute, and second', () => {
      const result = formatTime(fixedDate, 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
      })
      expect(result).toContain('30')
      expect(result).toContain('45')
    })
  })

  describe('string input', () => {
    it('should format an ISO date string', () => {
      const result = formatTime('2026-03-17T14:30:45Z', 'en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('2:30 PM')
    })
  })

  describe('number input (timestamp)', () => {
    it('should format a Unix timestamp', () => {
      const result = formatTime(fixedDate.getTime(), 'en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('2:30 PM')
    })
  })

  describe('TemporalDateLike input', () => {
    it('should delegate to toLocaleString for Temporal-like objects', () => {
      const temporal: TemporalDateLike = {
        toLocaleString(locale?: string, options?: Intl.DateTimeFormatOptions) {
          return `temporal-time:${locale}:${options?.timeZone ?? 'default'}`
        },
      }
      const result = formatTime(temporal, 'en-US', { timeZone: 'UTC' })
      expect(result).toBe('temporal-time:en-US:UTC')
    })
  })

  describe('edge cases', () => {
    it('should format midnight', () => {
      const midnight = new Date('2026-03-17T00:00:00Z')
      const result = formatTime(midnight, 'en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('12:00 AM')
    })

    it('should format noon', () => {
      const noon = new Date('2026-03-17T12:00:00Z')
      const result = formatTime(noon, 'en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
      })
      expect(result).toBe('12:00 PM')
    })
  })
})
