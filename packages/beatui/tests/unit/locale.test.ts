import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, Provide, Use, Signal } from '@tempots/dom'
import { Locale } from '../../src/components/i18n/locale'
import { DirectionValue, DirectionPreference } from '../../src/i18n/direction'

// Mock navigator.language
const originalNavigator = global.navigator
const mockNavigator = {
  language: 'en-US',
}

describe('Locale Provider', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Clear localStorage
    localStorage.clear()

    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    })
  })

  afterEach(() => {
    // Clear localStorage
    localStorage.clear()

    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  it('should create a locale provider with default locale and direction', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedLocale: string | undefined
    let capturedSetLocale: ((locale: string) => void) | undefined
    let capturedDirection: DirectionValue | undefined
    let capturedDirectionPreference: DirectionPreference | undefined
    let capturedSetDirectionPreference:
      | ((pref: DirectionPreference) => void)
      | undefined

    render(
      Provide(Locale, {}, () =>
        Use(
          Locale,
          ({
            locale,
            setLocale,
            direction,
            directionPreference,
            setDirectionPreference,
          }) => {
            capturedLocale = locale.value
            capturedSetLocale = setLocale
            capturedDirection = direction.value
            capturedDirectionPreference = directionPreference.value
            capturedSetDirectionPreference = setDirectionPreference
            return null
          }
        )
      ),
      container
    )

    expect(capturedLocale).toBe('en-US')
    expect(capturedSetLocale).toBeInstanceOf(Function)
    expect(capturedDirection).toBe('ltr')
    expect(capturedDirectionPreference).toBe('auto')
    expect(capturedSetDirectionPreference).toBeInstanceOf(Function)

    document.body.removeChild(container)
  })

  it('should update locale reactively', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let localeSignal: Signal<string> | undefined
    let capturedSetLocale: ((locale: string) => void) | undefined

    render(
      Provide(Locale, {}, () =>
        Use(Locale, ({ locale, setLocale }) => {
          localeSignal = locale
          capturedSetLocale = setLocale
          return null
        })
      ),
      container
    )

    expect(localeSignal?.value).toBe('en-US')

    // Update locale
    capturedSetLocale!('es-ES')
    expect(localeSignal?.value).toBe('es-ES')

    // Update again
    capturedSetLocale!('fr-FR')
    expect(localeSignal?.value).toBe('fr-FR')

    document.body.removeChild(container)
  })

  it('should fallback to en-US when navigator.language is not available', () => {
    // Mock navigator without language property
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    let localeSignal: Signal<string> | undefined

    render(
      Provide(Locale, {}, () =>
        Use(Locale, ({ locale }) => {
          localeSignal = locale
          return null
        })
      ),
      container
    )

    expect(localeSignal?.value).toBe('en-US')

    document.body.removeChild(container)
  })

  it('should update direction when locale changes to RTL', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let localeSignal: Signal<string> | undefined
    let directionSignal: Signal<DirectionValue> | undefined
    let capturedSetLocale: ((locale: string) => void) | undefined

    render(
      Provide(Locale, {}, () =>
        Use(Locale, ({ locale, setLocale, direction }) => {
          localeSignal = locale
          directionSignal = direction
          capturedSetLocale = setLocale
          return null
        })
      ),
      container
    )

    expect(localeSignal?.value).toBe('en-US')
    expect(directionSignal?.value).toBe('ltr')

    // Update to Arabic locale
    capturedSetLocale!('ar-SA')
    expect(localeSignal?.value).toBe('ar-SA')
    expect(directionSignal?.value).toBe('rtl')

    // Update to Hebrew locale
    capturedSetLocale!('he-IL')
    expect(localeSignal?.value).toBe('he-IL')
    expect(directionSignal?.value).toBe('rtl')

    // Update back to English
    capturedSetLocale!('en-US')
    expect(localeSignal?.value).toBe('en-US')
    expect(directionSignal?.value).toBe('ltr')

    document.body.removeChild(container)
  })

  it('should allow overriding direction preference', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let directionSignal: Signal<DirectionValue> | undefined
    let directionPreferenceSignal: Signal<DirectionPreference> | undefined
    let capturedSetLocale: ((locale: string) => void) | undefined
    let capturedSetDirectionPreference:
      | ((pref: DirectionPreference) => void)
      | undefined

    render(
      Provide(Locale, {}, () =>
        Use(
          Locale,
          ({
            setLocale,
            direction,
            directionPreference,
            setDirectionPreference,
          }) => {
            directionSignal = direction
            directionPreferenceSignal = directionPreference
            capturedSetLocale = setLocale
            capturedSetDirectionPreference = setDirectionPreference
            return null
          }
        )
      ),
      container
    )

    // Start with Arabic locale (should be RTL by default)
    capturedSetLocale!('ar-SA')
    expect(directionSignal?.value).toBe('rtl')
    expect(directionPreferenceSignal?.value).toBe('auto')

    // Force LTR for Arabic
    capturedSetDirectionPreference!('ltr')
    expect(directionSignal?.value).toBe('ltr')
    expect(directionPreferenceSignal?.value).toBe('ltr')

    // Switch to English (should still be LTR due to preference)
    capturedSetLocale!('en-US')
    expect(directionSignal?.value).toBe('ltr')

    // Force RTL for English
    capturedSetDirectionPreference!('rtl')
    expect(directionSignal?.value).toBe('rtl')

    // Reset to auto
    capturedSetDirectionPreference!('auto')
    expect(directionSignal?.value).toBe('ltr') // English is LTR

    document.body.removeChild(container)
  })

  it('should persist direction preference to localStorage', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedSetDirectionPreference:
      | ((pref: DirectionPreference) => void)
      | undefined

    render(
      Provide(Locale, {}, () =>
        Use(Locale, ({ setDirectionPreference }) => {
          capturedSetDirectionPreference = setDirectionPreference
          return null
        })
      ),
      container
    )

    // Set direction preference
    capturedSetDirectionPreference!('rtl')
    expect(localStorage.getItem('beatui-direction-preference')).toBe('"rtl"')

    capturedSetDirectionPreference!('ltr')
    expect(localStorage.getItem('beatui-direction-preference')).toBe('"ltr"')

    capturedSetDirectionPreference!('auto')
    expect(localStorage.getItem('beatui-direction-preference')).toBe('"auto"')

    document.body.removeChild(container)
  })
})
