import { describe, it, expect } from 'vitest'
import {
  getDirectionFromLocale,
  resolveDirection,
  getDirectionClassName,
  isRTLLocale,
  getOppositeDirection,
  getPhysicalProperty,
} from '../../src/i18n/direction'

describe('Direction Utilities', () => {
  describe('getDirectionFromLocale', () => {
    it('should return ltr for English locales', () => {
      expect(getDirectionFromLocale('en')).toBe('ltr')
      expect(getDirectionFromLocale('en-US')).toBe('ltr')
      expect(getDirectionFromLocale('en-GB')).toBe('ltr')
    })

    it('should return rtl for Arabic locales', () => {
      expect(getDirectionFromLocale('ar')).toBe('rtl')
      expect(getDirectionFromLocale('ar-SA')).toBe('rtl')
      expect(getDirectionFromLocale('ar-EG')).toBe('rtl')
    })

    it('should return rtl for Hebrew locales', () => {
      expect(getDirectionFromLocale('he')).toBe('rtl')
      expect(getDirectionFromLocale('he-IL')).toBe('rtl')
      expect(getDirectionFromLocale('iw')).toBe('rtl') // deprecated code
    })

    it('should return rtl for Persian locales', () => {
      expect(getDirectionFromLocale('fa')).toBe('rtl')
      expect(getDirectionFromLocale('fa-IR')).toBe('rtl')
    })

    it('should return rtl for Urdu locales', () => {
      expect(getDirectionFromLocale('ur')).toBe('rtl')
      expect(getDirectionFromLocale('ur-PK')).toBe('rtl')
    })

    it('should return rtl for other RTL languages', () => {
      expect(getDirectionFromLocale('ps')).toBe('rtl') // Pashto
      expect(getDirectionFromLocale('sd')).toBe('rtl') // Sindhi
      expect(getDirectionFromLocale('ku')).toBe('rtl') // Kurdish
      expect(getDirectionFromLocale('dv')).toBe('rtl') // Divehi
      expect(getDirectionFromLocale('yi')).toBe('rtl') // Yiddish
    })

    it('should return ltr for other languages', () => {
      expect(getDirectionFromLocale('fr')).toBe('ltr')
      expect(getDirectionFromLocale('de')).toBe('ltr')
      expect(getDirectionFromLocale('es')).toBe('ltr')
      expect(getDirectionFromLocale('zh')).toBe('ltr')
      expect(getDirectionFromLocale('ja')).toBe('ltr')
      expect(getDirectionFromLocale('ko')).toBe('ltr')
    })

    it('should handle empty or invalid locales', () => {
      expect(getDirectionFromLocale('')).toBe('ltr')
      expect(getDirectionFromLocale('invalid')).toBe('ltr')
    })

    it('should handle locales with underscores', () => {
      expect(getDirectionFromLocale('ar_SA')).toBe('rtl')
      expect(getDirectionFromLocale('en_US')).toBe('ltr')
    })

    it('should be case insensitive', () => {
      expect(getDirectionFromLocale('AR')).toBe('rtl')
      expect(getDirectionFromLocale('EN')).toBe('ltr')
      expect(getDirectionFromLocale('Ar-SA')).toBe('rtl')
    })
  })

  describe('resolveDirection', () => {
    it('should return auto-detected direction when preference is auto', () => {
      expect(resolveDirection('auto', 'ar-SA')).toBe('rtl')
      expect(resolveDirection('auto', 'en-US')).toBe('ltr')
      expect(resolveDirection('auto', 'he-IL')).toBe('rtl')
    })

    it('should return forced direction when preference is explicit', () => {
      expect(resolveDirection('ltr', 'ar-SA')).toBe('ltr')
      expect(resolveDirection('rtl', 'en-US')).toBe('rtl')
      expect(resolveDirection('ltr', 'he-IL')).toBe('ltr')
      expect(resolveDirection('rtl', 'fr-FR')).toBe('rtl')
    })
  })

  describe('getDirectionClassName', () => {
    it('should return correct CSS class names', () => {
      expect(getDirectionClassName('ltr')).toBe('b-ltr')
      expect(getDirectionClassName('rtl')).toBe('b-rtl')
    })
  })

  describe('isRTLLocale', () => {
    it('should correctly identify RTL locales', () => {
      expect(isRTLLocale('ar-SA')).toBe(true)
      expect(isRTLLocale('he-IL')).toBe(true)
      expect(isRTLLocale('fa-IR')).toBe(true)
      expect(isRTLLocale('ur-PK')).toBe(true)
    })

    it('should correctly identify LTR locales', () => {
      expect(isRTLLocale('en-US')).toBe(false)
      expect(isRTLLocale('fr-FR')).toBe(false)
      expect(isRTLLocale('de-DE')).toBe(false)
      expect(isRTLLocale('zh-CN')).toBe(false)
    })
  })

  describe('getOppositeDirection', () => {
    it('should return opposite directions', () => {
      expect(getOppositeDirection('ltr')).toBe('rtl')
      expect(getOppositeDirection('rtl')).toBe('ltr')
    })
  })

  describe('getPhysicalProperty', () => {
    it('should map logical properties correctly for LTR', () => {
      expect(getPhysicalProperty('inline-start', 'ltr')).toBe('left')
      expect(getPhysicalProperty('inline-end', 'ltr')).toBe('right')
      expect(getPhysicalProperty('block-start', 'ltr')).toBe('top')
      expect(getPhysicalProperty('block-end', 'ltr')).toBe('bottom')
    })

    it('should map logical properties correctly for RTL', () => {
      expect(getPhysicalProperty('inline-start', 'rtl')).toBe('right')
      expect(getPhysicalProperty('inline-end', 'rtl')).toBe('left')
      expect(getPhysicalProperty('block-start', 'rtl')).toBe('top')
      expect(getPhysicalProperty('block-end', 'rtl')).toBe('bottom')
    })
  })
})
