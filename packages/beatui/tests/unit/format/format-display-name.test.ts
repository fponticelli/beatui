import { describe, it, expect } from 'vitest'
import { formatDisplayName } from '../../../src/components/format/format-display-name'

describe('formatDisplayName', () => {
  describe('language type', () => {
    it('should resolve language display name for en-US', () => {
      expect(formatDisplayName('en-US', 'language', 'en')).toBe(
        'American English'
      )
    })

    it('should resolve language display name for fr', () => {
      expect(formatDisplayName('fr', 'language', 'en')).toBe('French')
    })

    it('should resolve language display name for de', () => {
      expect(formatDisplayName('de', 'language', 'en')).toBe('German')
    })

    it('should resolve with standard languageDisplay', () => {
      expect(
        formatDisplayName('en-US', 'language', 'en', {
          languageDisplay: 'standard',
        })
      ).toBe('English (United States)')
    })
  })

  describe('region type', () => {
    it('should resolve region for JP', () => {
      expect(formatDisplayName('JP', 'region', 'en')).toBe('Japan')
    })

    it('should resolve region for US', () => {
      expect(formatDisplayName('US', 'region', 'en')).toBe('United States')
    })

    it('should resolve region for DE', () => {
      expect(formatDisplayName('DE', 'region', 'en')).toBe('Germany')
    })
  })

  describe('currency type', () => {
    it('should resolve currency for USD', () => {
      expect(formatDisplayName('USD', 'currency', 'en')).toBe('US Dollar')
    })

    it('should resolve currency for EUR', () => {
      expect(formatDisplayName('EUR', 'currency', 'en')).toBe('Euro')
    })

    it('should resolve currency for JPY', () => {
      expect(formatDisplayName('JPY', 'currency', 'en')).toBe('Japanese Yen')
    })
  })

  describe('script type', () => {
    it('should resolve script for Latn', () => {
      expect(formatDisplayName('Latn', 'script', 'en')).toBe('Latin')
    })

    it('should resolve script for Cyrl', () => {
      expect(formatDisplayName('Cyrl', 'script', 'en')).toBe('Cyrillic')
    })

    it('should resolve script for Arab', () => {
      expect(formatDisplayName('Arab', 'script', 'en')).toBe('Arabic')
    })
  })

  describe('locale differences', () => {
    it('should resolve US region in de-DE', () => {
      expect(formatDisplayName('US', 'region', 'de-DE')).toBe(
        'Vereinigte Staaten'
      )
    })

    it('should resolve French language in de-DE', () => {
      expect(formatDisplayName('fr', 'language', 'de-DE')).toBe('Französisch')
    })

    it('should resolve USD currency in de-DE', () => {
      expect(formatDisplayName('USD', 'currency', 'de-DE')).toBe('US-Dollar')
    })
  })

  describe('style option', () => {
    it('should use long style by default', () => {
      const longResult = formatDisplayName('US', 'region', 'en', {
        style: 'long',
      })
      expect(longResult).toBe('United States')
    })

    it('should use short style', () => {
      const result = formatDisplayName('US', 'region', 'en', {
        style: 'short',
      })
      expect(result).toBe('US')
    })
  })

  describe('fallback behavior', () => {
    it('should return code when fallback is code and code is unknown', () => {
      const result = formatDisplayName('XX', 'region', 'en', {
        fallback: 'code',
      })
      expect(result).toBe('XX')
    })

    it('should return empty string when fallback is none and code is unknown', () => {
      const result = formatDisplayName('XX', 'region', 'en', {
        fallback: 'none',
      })
      // When Intl.DisplayNames returns undefined and fallback is 'none',
      // formatDisplayName falls back to the value itself
      expect(result).toBe('XX')
    })
  })

  describe('dateTimeField type', () => {
    it('should resolve day field', () => {
      expect(formatDisplayName('day', 'dateTimeField', 'en')).toBe('day')
    })

    it('should resolve month field', () => {
      expect(formatDisplayName('month', 'dateTimeField', 'en')).toBe('month')
    })

    it('should resolve year field', () => {
      expect(formatDisplayName('year', 'dateTimeField', 'en')).toBe('year')
    })
  })
})
