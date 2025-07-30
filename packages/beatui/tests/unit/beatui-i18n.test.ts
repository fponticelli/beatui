import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, Provide, Use } from '@tempots/dom'
import { BeatUII18n } from '../../src/beatui-i18n/translations'
import { Locale } from '../../src/i18n/locale'
import { defaultMessages, defaultLocale } from '../../src/beatui-i18n/default'

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log
beforeEach(() => {
  console.log = vi.fn()
  vi.clearAllMocks()

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // Mock navigator
  Object.defineProperty(global, 'navigator', {
    value: { language: 'en-US' },
    writable: true,
  })
})

afterEach(() => {
  console.log = originalConsoleLog
})

describe('BeatUI I18n System', () => {
  it('should provide default messages', () => {
    expect(defaultMessages).toBeDefined()
    expect(defaultLocale).toBe('en')

    // Check that all expected message keys exist
    const expectedKeys = [
      'loadingExtended',
      'loadingShort',
      'iconDescription',
      'loadingIcon',
      'failedToLoadIcon',
      'editLabel',
      'selectOne',
      'passwordPlaceholderText',
      'togglePasswordVisibility',
      'toggleMenu',
      'toggleAside',
      'mainNavigation',
      'sidebar',
      'closeDrawer',
      'closeModal',
      'confirm',
      'cancel',
    ] as const

    expectedKeys.forEach(key => {
      expect(defaultMessages).toHaveProperty(key)
      expect(defaultMessages[key]).toBeInstanceOf(Function)
    })
  })

  it('should provide translation functions through BeatUII18n provider', () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(BeatUII18n, t => {
            capturedT = t
            return null
          })
        )
      ),
      container
    )

    expect(capturedT).toBeDefined()

    // Check that all translation functions are available
    Object.keys(defaultMessages).forEach(key => {
      expect(capturedT[key]).toBeInstanceOf(Function)
    })

    document.body.removeChild(container)
  })

  it('should return correct default English messages', () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(BeatUII18n, t => {
            capturedT = t
            return null
          })
        )
      ),
      container
    )

    // Test some key messages
    expect(capturedT.loadingExtended().value).toBe('Loading, please wait')
    expect(capturedT.loadingShort().value).toBe('Loading...')
    expect(capturedT.iconDescription().value).toBe('Icon')
    expect(capturedT.editLabel().value).toBe('Edit')
    expect(capturedT.confirm().value).toBe('Confirm')
    expect(capturedT.cancel().value).toBe('Cancel')

    document.body.removeChild(container)
  })

  it('should load Spanish translations', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    // Change to Spanish
    capturedSetLocale('es')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 50))

    // Test Spanish translations
    expect(capturedT.loadingExtended().value).toBe('Cargando, por favor espere')
    expect(capturedT.loadingShort().value).toBe('Cargando...')
    expect(capturedT.iconDescription().value).toBe('Icono')
    expect(capturedT.editLabel().value).toBe('Editar')
    expect(capturedT.confirm().value).toBe('Confirmar')
    expect(capturedT.cancel().value).toBe('Cancelar')

    document.body.removeChild(container)
  })

  it('should load Japanese translations', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    // Change to Japanese
    capturedSetLocale('ja')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 50))

    // Test Japanese translations
    expect(capturedT.loadingExtended().value).toBe(
      '読み込み中です、お待ちください'
    )
    expect(capturedT.loadingShort().value).toBe('読み込み中...')
    expect(capturedT.iconDescription().value).toBe('アイコン')
    expect(capturedT.editLabel().value).toBe('編集')
    expect(capturedT.confirm().value).toBe('確認')
    expect(capturedT.cancel().value).toBe('キャンセル')

    document.body.removeChild(container)
  })

  it('should load German translations', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    // Change to German
    capturedSetLocale('de')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 50))

    // Test German translations
    expect(capturedT.loadingExtended().value).toBe('Lädt, bitte warten')
    expect(capturedT.loadingShort().value).toBe('Lädt...')
    expect(capturedT.iconDescription().value).toBe('Symbol')
    expect(capturedT.editLabel().value).toBe('Bearbeiten')
    expect(capturedT.confirm().value).toBe('Bestätigen')
    expect(capturedT.cancel().value).toBe('Abbrechen')

    document.body.removeChild(container)
  })

  it('should handle unsupported locales gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    // Change to unsupported locale
    capturedSetLocale('unsupported-LOCALE')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 50))

    // Should fallback to default English messages
    expect(capturedT.loadingExtended().value).toBe('Loading, please wait')
    expect(capturedT.loadingShort().value).toBe('Loading...')
    expect(capturedT.confirm().value).toBe('Confirm')
    expect(capturedT.cancel().value).toBe('Cancel')

    document.body.removeChild(container)
  })

  it('should handle locale fallbacks correctly', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    // Change to Spanish variant (should fallback to 'es')
    capturedSetLocale('es-MX')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 50))

    // Should load Spanish translations (fallback from es-MX to es)
    expect(capturedT.loadingExtended().value).toBe('Cargando, por favor espere')
    expect(capturedT.confirm().value).toBe('Confirmar')

    document.body.removeChild(container)
  })

  it('should handle rapid locale changes', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    const confirmSignal = capturedT.confirm()

    // Rapid locale changes
    capturedSetLocale('es')
    capturedSetLocale('de')
    capturedSetLocale('fr')
    capturedSetLocale('ja')

    // Wait for all async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should end up with Japanese
    expect(confirmSignal.value).toBe('確認')

    document.body.removeChild(container)
  })

  it('should provide reactive updates', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    const confirmSignal = capturedT.confirm()
    const cancelSignal = capturedT.cancel()

    // Initial English
    expect(confirmSignal.value).toBe('Confirm')
    expect(cancelSignal.value).toBe('Cancel')

    // Change to Spanish
    capturedSetLocale('es')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(confirmSignal.value).toBe('Confirmar')
    expect(cancelSignal.value).toBe('Cancelar')

    // Change to German
    capturedSetLocale('de')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(confirmSignal.value).toBe('Bestätigen')
    expect(cancelSignal.value).toBe('Abbrechen')

    document.body.removeChild(container)
  })

  it('should handle all available locales', async () => {
    const availableLocales = [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'nl',
      'pl',
      'ru',
      'ja',
      'ko',
      'zh',
      'hi',
      'ar',
      'tr',
      'vi',
    ]

    localStorageMock.getItem.mockReturnValue('en')

    const container = document.createElement('div')
    document.body.appendChild(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedT: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedSetLocale: any

    render(
      Provide(Locale, {}, () =>
        Provide(BeatUII18n, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(BeatUII18n, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    // Test each locale
    for (const locale of availableLocales) {
      capturedSetLocale(locale)
      await new Promise(resolve => setTimeout(resolve, 20))

      // Should not throw and should have valid translations
      expect(() => {
        const confirm = capturedT.confirm().value
        const cancel = capturedT.cancel().value
        expect(typeof confirm).toBe('string')
        expect(typeof cancel).toBe('string')
        expect(confirm.length).toBeGreaterThan(0)
        expect(cancel.length).toBeGreaterThan(0)
      }).not.toThrow()
    }

    document.body.removeChild(container)
  })
})
