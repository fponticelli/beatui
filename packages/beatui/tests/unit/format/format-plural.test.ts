import { describe, it, expect } from 'vitest'
import {
  formatPlural,
  resolvePluralCategory,
} from '../../../src/components/format/format-plural'
import type { PluralMessages } from '../../../src/components/format/format-plural'

describe('resolvePluralCategory', () => {
  describe('cardinal (default)', () => {
    it('should return "one" for 1 in en-US', () => {
      expect(resolvePluralCategory(1, 'en-US')).toBe('one')
    })

    it('should return "other" for 0 in en-US', () => {
      expect(resolvePluralCategory(0, 'en-US')).toBe('other')
    })

    it('should return "other" for 2 in en-US', () => {
      expect(resolvePluralCategory(2, 'en-US')).toBe('other')
    })

    it('should return "other" for 5 in en-US', () => {
      expect(resolvePluralCategory(5, 'en-US')).toBe('other')
    })

    it('should return "other" for 100 in en-US', () => {
      expect(resolvePluralCategory(100, 'en-US')).toBe('other')
    })
  })

  describe('ordinal', () => {
    it('should return "one" for 1 (1st) in en-US', () => {
      expect(
        resolvePluralCategory(1, 'en-US', { type: 'ordinal' })
      ).toBe('one')
    })

    it('should return "two" for 2 (2nd) in en-US', () => {
      expect(
        resolvePluralCategory(2, 'en-US', { type: 'ordinal' })
      ).toBe('two')
    })

    it('should return "few" for 3 (3rd) in en-US', () => {
      expect(
        resolvePluralCategory(3, 'en-US', { type: 'ordinal' })
      ).toBe('few')
    })

    it('should return "other" for 4 (4th) in en-US', () => {
      expect(
        resolvePluralCategory(4, 'en-US', { type: 'ordinal' })
      ).toBe('other')
    })

    it('should return "other" for 11 (11th) in en-US', () => {
      expect(
        resolvePluralCategory(11, 'en-US', { type: 'ordinal' })
      ).toBe('other')
    })

    it('should return "one" for 21 (21st) in en-US', () => {
      expect(
        resolvePluralCategory(21, 'en-US', { type: 'ordinal' })
      ).toBe('one')
    })
  })

  describe('locale differences', () => {
    it('should handle Arabic plural rules (zero category)', () => {
      expect(resolvePluralCategory(0, 'ar')).toBe('zero')
    })

    it('should handle Arabic plural rules (two category)', () => {
      expect(resolvePluralCategory(2, 'ar')).toBe('two')
    })
  })
})

describe('formatPlural', () => {
  const itemMessages: PluralMessages = {
    one: '{count} item',
    other: '{count} items',
  }

  describe('basic cardinal formatting', () => {
    it('should select "one" message for 1', () => {
      expect(formatPlural(1, itemMessages, 'en-US')).toBe('1 item')
    })

    it('should select "other" message for 0', () => {
      expect(formatPlural(0, itemMessages, 'en-US')).toBe('0 items')
    })

    it('should select "other" message for 5', () => {
      expect(formatPlural(5, itemMessages, 'en-US')).toBe('5 items')
    })

    it('should select "other" message for 42', () => {
      expect(formatPlural(42, itemMessages, 'en-US')).toBe('42 items')
    })
  })

  describe('{count} interpolation', () => {
    it('should format the number with locale-specific separators', () => {
      expect(formatPlural(1000, itemMessages, 'en-US')).toBe('1,000 items')
    })

    it('should format with de-DE separators', () => {
      expect(formatPlural(1000, itemMessages, 'de-DE')).toBe('1.000 items')
    })

    it('should replace multiple {count} occurrences', () => {
      const msgs: PluralMessages = {
        other: '{count} of {count} items',
      }
      expect(formatPlural(5, msgs, 'en-US')).toBe('5 of 5 items')
    })
  })

  describe('ordinal formatting', () => {
    const ordinalMessages: PluralMessages = {
      one: '{count}st',
      two: '{count}nd',
      few: '{count}rd',
      other: '{count}th',
    }

    it('should format 1st', () => {
      expect(
        formatPlural(1, ordinalMessages, 'en-US', { type: 'ordinal' })
      ).toBe('1st')
    })

    it('should format 2nd', () => {
      expect(
        formatPlural(2, ordinalMessages, 'en-US', { type: 'ordinal' })
      ).toBe('2nd')
    })

    it('should format 3rd', () => {
      expect(
        formatPlural(3, ordinalMessages, 'en-US', { type: 'ordinal' })
      ).toBe('3rd')
    })

    it('should format 4th', () => {
      expect(
        formatPlural(4, ordinalMessages, 'en-US', { type: 'ordinal' })
      ).toBe('4th')
    })

    it('should format 11th (not 11st)', () => {
      expect(
        formatPlural(11, ordinalMessages, 'en-US', { type: 'ordinal' })
      ).toBe('11th')
    })

    it('should format 21st', () => {
      expect(
        formatPlural(21, ordinalMessages, 'en-US', { type: 'ordinal' })
      ).toBe('21st')
    })
  })

  describe('fallback to other', () => {
    it('should fall back to "other" when category message is missing', () => {
      const msgs: PluralMessages = {
        other: '{count} things',
      }
      expect(formatPlural(1, msgs, 'en-US')).toBe('1 things')
    })
  })

  describe('messages without {count} placeholder', () => {
    it('should return message as-is when no {count} placeholder', () => {
      const msgs: PluralMessages = {
        one: 'one item',
        other: 'many items',
      }
      expect(formatPlural(1, msgs, 'en-US')).toBe('one item')
      expect(formatPlural(5, msgs, 'en-US')).toBe('many items')
    })
  })

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      // -1 resolves to "one" category in en-US cardinal rules
      expect(formatPlural(-1, itemMessages, 'en-US')).toBe('-1 item')
    })

    it('should handle decimal numbers', () => {
      expect(formatPlural(1.5, itemMessages, 'en-US')).toBe('1.5 items')
    })

    it('should handle zero', () => {
      expect(formatPlural(0, itemMessages, 'en-US')).toBe('0 items')
    })
  })
})
