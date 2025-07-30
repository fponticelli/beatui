import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, Provide, Use, Signal } from '@tempots/dom'
import { Locale } from '../../src/i18n/locale'

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

  it('should create a locale provider with default locale', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedLocale: string | undefined
    let capturedSetLocale: ((locale: string) => void) | undefined

    render(
      Provide(Locale, {}, () =>
        Use(Locale, ({ locale, setLocale }) => {
          capturedLocale = locale.value
          capturedSetLocale = setLocale
          return null
        })
      ),
      container
    )

    expect(capturedLocale).toBe('en-US')
    expect(capturedSetLocale).toBeInstanceOf(Function)

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
})
