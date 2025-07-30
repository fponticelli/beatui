import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, Provide, Use } from '@tempots/dom'
import { makeI18nProvider } from '../../src/components/i18n/make-i18nprovider'
import { Locale } from '../../src/i18n/locale'
import { ReactiveMessages } from '@/i18n'

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
  vi.clearAllMocks()
})

describe('makeI18nProvider', () => {
  const defaultMessages = {
    welcome: () => 'Welcome!',
    greeting: (name: string) => `Hello, ${name}!`,
    itemCount: (count: number) => `${count} item${count !== 1 ? 's' : ''}`,
  }

  const spanishMessages = {
    welcome: () => '¡Bienvenido!',
    greeting: (name: string) => `¡Hola, ${name}!`,
    itemCount: (count: number) => `${count} elemento${count !== 1 ? 's' : ''}`,
  }

  it('should create a provider with default configuration', () => {
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader,
    })

    expect(I18nProvider).toBeDefined()
    expect(I18nProvider.mark).toBeDefined()
    expect(I18nProvider.create).toBeInstanceOf(Function)
  })

  it('should create a provider with custom name', () => {
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader,
      providerName: 'CustomI18nProvider',
    })

    expect(I18nProvider).toBeDefined()
    expect(I18nProvider.mark).toBeDefined()
    expect(I18nProvider.create).toBeInstanceOf(Function)
  })

  it('should provide translation functions through the provider', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedT:
      | ReactiveMessages<{
          welcome: () => string
          greeting: (name: string) => string
          itemCount: (count: number) => string
        }>
      | undefined = undefined

    render(
      Provide(Locale, {}, () =>
        Provide(I18nProvider, {}, () =>
          Use(I18nProvider, t => {
            capturedT = t
            return null
          })
        )
      ),
      container
    )

    expect(capturedT).toBeDefined()
    expect(capturedT!.welcome).toBeInstanceOf(Function)
    expect(capturedT!.greeting).toBeInstanceOf(Function)
    expect(capturedT!.itemCount).toBeInstanceOf(Function)

    document.body.removeChild(container)
  })

  it('should provide reactive translations', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedT: ReactiveMessages<{
      welcome: () => string
      greeting: (name: string) => string
      itemCount: (count: number) => string
    }>

    render(
      Provide(Locale, {}, () =>
        Provide(I18nProvider, {}, () =>
          Use(I18nProvider, t => {
            capturedT = t
            return null
          })
        )
      ),
      container
    )

    const welcomeSignal = capturedT!.welcome()
    expect(welcomeSignal.value).toBe('Welcome!')

    const greetingSignal = capturedT!.greeting('John')
    expect(greetingSignal.value).toBe('Hello, John!')

    document.body.removeChild(container)
  })

  it('should handle locale changes through the provider', async () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const localeLoader = vi
      .fn()
      .mockResolvedValueOnce(defaultMessages)
      .mockResolvedValueOnce(spanishMessages)

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedT: ReactiveMessages<{
      welcome: () => string
      greeting: (name: string) => string
      itemCount: (count: number) => string
    }>
    let capturedSetLocale: (locale: string) => void

    render(
      Provide(Locale, {}, () =>
        Provide(I18nProvider, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(I18nProvider, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    const welcomeSignal = capturedT!.welcome()
    expect(welcomeSignal.value).toBe('Welcome!')

    // Change locale
    capturedSetLocale!('es-ES')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(localeLoader).toHaveBeenCalledWith('es-ES')
    expect(welcomeSignal.value).toBe('¡Bienvenido!')

    document.body.removeChild(container)
  })

  it('should handle missing Locale provider gracefully', () => {
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    expect(() => {
      render(
        // Missing Locale provider
        Provide(I18nProvider, {}, () => Use(I18nProvider, () => null)),
        container
      )
    }).toThrow() // Should throw because Locale provider is required

    document.body.removeChild(container)
  })

  it('should handle loader errors gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const localeLoader = vi.fn().mockRejectedValue(new Error('Loading failed'))

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedT: ReactiveMessages<{
      welcome: () => string
      greeting: (name: string) => string
      itemCount: (count: number) => string
    }>
    let capturedSetLocale: (locale: string) => void

    render(
      Provide(Locale, {}, () =>
        Provide(I18nProvider, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
            return Use(I18nProvider, t => {
              capturedT = t
              return null
            })
          })
        )
      ),
      container
    )

    const welcomeSignal = capturedT!.welcome()
    expect(welcomeSignal.value).toBe('Welcome!')

    // Change to unsupported locale
    capturedSetLocale!('unsupported-LOCALE')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should still work with default messages
    expect(welcomeSignal.value).toBe('Welcome!')

    document.body.removeChild(container)
  })

  it('should handle complex message parameters', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const complexMessages = {
      ...defaultMessages,
      defaultLocale: 'en-US',
      complexMessage: (
        user: { name: string; age: number },
        items: string[],
        isActive: boolean
      ) =>
        `${user.name} (${user.age}) has ${items.length} items: ${items.join(', ')} - ${isActive ? 'active' : 'inactive'}`,
    }

    const localeLoader = vi.fn().mockResolvedValue(complexMessages)

    const I18nProvider = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages: complexMessages,
      localeLoader,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedT: ReactiveMessages<{
      complexMessage: (
        user: { name: string; age: number },
        items: string[],
        isActive: boolean
      ) => string
    }>

    render(
      Provide(Locale, {}, () =>
        Provide(I18nProvider, {}, () =>
          Use(I18nProvider, t => {
            capturedT = t
            return null
          })
        )
      ),
      container
    )

    const complexSignal = capturedT!.complexMessage(
      { name: 'John', age: 30 },
      ['item1', 'item2', 'item3'],
      true
    )

    expect(complexSignal.value).toBe(
      'John (30) has 3 items: item1, item2, item3 - active'
    )

    document.body.removeChild(container)
  })

  it('should handle multiple provider instances', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const localeLoader1 = vi.fn().mockResolvedValue(defaultMessages)
    const localeLoader2 = vi.fn().mockResolvedValue(spanishMessages)

    const I18nProvider1 = makeI18nProvider({
      defaultLocale: 'en-US',
      defaultMessages,
      localeLoader: localeLoader1,
      providerName: 'I18nProvider1',
    })

    const I18nProvider2 = makeI18nProvider({
      defaultLocale: 'es-ES',
      defaultMessages: spanishMessages,
      localeLoader: localeLoader2,
      providerName: 'I18nProvider2',
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    let capturedT1: ReactiveMessages<{
      welcome: () => string
      greeting: (name: string) => string
      itemCount: (count: number) => string
    }>
    let capturedT2: ReactiveMessages<{
      welcome: () => string
      greeting: (name: string) => string
      itemCount: (count: number) => string
    }>

    render(
      Provide(Locale, {}, () =>
        Provide(I18nProvider1, {}, () =>
          Provide(I18nProvider2, {}, () =>
            Use(I18nProvider1, t1 => {
              capturedT1 = t1
              return Use(I18nProvider2, t2 => {
                capturedT2 = t2
                return null
              })
            })
          )
        )
      ),
      container
    )

    const welcome1 = capturedT1!.welcome()
    const welcome2 = capturedT2!.welcome()

    expect(welcome1.value).toBe('Welcome!')
    expect(welcome2.value).toBe('¡Bienvenido!')

    document.body.removeChild(container)
  })
})
