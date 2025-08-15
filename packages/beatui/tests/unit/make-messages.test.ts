import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { bind, prop, Signal } from '@tempots/dom'
import { makeMessages } from '../../src/i18n/translate'

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log
beforeEach(() => {
  console.log = vi.fn()
})

afterEach(() => {
  console.log = originalConsoleLog
})

describe('makeMessages', () => {
  const defaultMessages = {
    welcome: 'Welcome!',
    greeting: (name: string) => `Hello, ${name}!`,
    itemCount: (count: number) => `${count} item${count !== 1 ? 's' : ''}`,
    complexMessage: (name: string, count: number, isActive: boolean) =>
      `${name} has ${count} item${count !== 1 ? 's' : ''} and is ${isActive ? 'active' : 'inactive'}`,
  }

  const spanishMessages = {
    welcome: '¡Bienvenido!',
    greeting: (name: string) => `¡Hola, ${name}!`,
    itemCount: (count: number) => `${count} elemento${count !== 1 ? 's' : ''}`,
    complexMessage: (name: string, count: number, isActive: boolean) =>
      `${name} tiene ${count} elemento${count !== 1 ? 's' : ''} y está ${isActive ? 'activo' : 'inactivo'}`,
  }

  const frenchMessages = {
    welcome: 'Bienvenue!',
    greeting: (name: string) => `Bonjour, ${name}!`,
    itemCount: (count: number) => `${count} élément${count !== 1 ? 's' : ''}`,
    complexMessage: (name: string, count: number, isActive: boolean) =>
      `${name} a ${count} élément${count !== 1 ? 's' : ''} et est ${isActive ? 'actif' : 'inactif'}`,
  }

  it('should create translation functions with default messages', () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    expect(t).toBeDefined()
    expect(t.$.welcome).toBeInstanceOf(Signal)
    expect(t.$.greeting).toBeInstanceOf(Signal)
    expect(t.$.itemCount).toBeInstanceOf(Signal)
    expect(t.$.complexMessage).toBeInstanceOf(Signal)

    dispose()
  })

  it('should return reactive signals from translation functions', () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    const welcomeSignal = t.$.welcome
    const greetingSignal = bind(t.$.greeting)(prop('John'))
    const countSignal = bind(t.$.itemCount)(prop(5))

    expect(welcomeSignal.value).toBe('Welcome!')
    expect(greetingSignal.value).toBe('Hello, John!')
    expect(countSignal.value).toBe('5 items')

    dispose()
  })

  it('should handle messages with no parameters', () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    const welcomeSignal = t.$.welcome
    expect(welcomeSignal.value).toBe('Welcome!')

    dispose()
  })

  it('should handle messages with single parameter', () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    const greetingSignal = bind(t.$.greeting)(prop('Alice'))
    expect(greetingSignal.value).toBe('Hello, Alice!')

    // Test reactive updates
    const nameSignal = prop('Bob')
    const reactiveGreeting = bind(t.$.greeting)(nameSignal)
    expect(reactiveGreeting.value).toBe('Hello, Bob!')

    nameSignal.set('Charlie')
    expect(reactiveGreeting.value).toBe('Hello, Charlie!')

    dispose()
  })

  it('should handle messages with multiple parameters', () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    const complexSignal = bind(t.$.complexMessage)(
      prop('John'),
      prop(3),
      prop(true)
    )
    expect(complexSignal.value).toBe('John has 3 items and is active')

    // Test with different values
    const nameSignal = prop('Jane')
    const countSignal = prop(1)
    const activeSignal = prop(false)

    const reactiveComplex = bind(t.$.complexMessage)(
      nameSignal,
      countSignal,
      activeSignal
    )
    expect(reactiveComplex.value).toBe('Jane has 1 item and is inactive')

    // Test reactive updates
    countSignal.set(2)
    expect(reactiveComplex.value).toBe('Jane has 2 items and is inactive')

    activeSignal.set(true)
    expect(reactiveComplex.value).toBe('Jane has 2 items and is active')

    dispose()
  })

  it('should load new messages when locale changes', async () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValueOnce(spanishMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    // Initial state
    const welcomeSignal = t.$.welcome
    expect(welcomeSignal.value).toBe('Welcome!')

    // Change locale
    locale.set('es-ES')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(localeLoader).toHaveBeenCalledWith('es-ES')
    expect(welcomeSignal.value).toBe('¡Bienvenido!')

    dispose()
  })

  it('should handle locale loading errors and fallback', async () => {
    const locale = prop('en-US')
    const localeLoader = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed to load'))
      .mockResolvedValueOnce(defaultMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    const welcomeSignal = t.$.welcome
    expect(welcomeSignal.value).toBe('Welcome!')

    // Change to unsupported locale
    locale.set('unsupported-LOCALE')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should try the unsupported locale first, then fallback
    expect(localeLoader).toHaveBeenCalledWith('unsupported-LOCALE')
    expect(localeLoader).toHaveBeenCalledWith('unsupported')

    // Should keep default messages since loading failed
    expect(welcomeSignal.value).toBe('Welcome!')

    dispose()
  })

  it('should handle locale fallbacks correctly', async () => {
    const locale = prop('en-US')
    const localeLoader = vi
      .fn()
      .mockRejectedValueOnce(new Error('en-US not found'))
      .mockResolvedValueOnce(defaultMessages) // fallback to 'en'

    const { dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    // Change locale to trigger loading
    locale.set('en-GB')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should try en-GB first, then fallback to en
    expect(localeLoader).toHaveBeenCalledWith('en-GB')
    expect(localeLoader).toHaveBeenCalledWith('en')

    dispose()
  })

  it("should not reload messages if locale hasn't changed", async () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const { dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    // Set same locale multiple times
    locale.set('en-US')
    locale.set('en-US')
    locale.set('en-US')

    // Wait for any potential async operations
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should not call loader since locale didn't change
    expect(localeLoader).not.toHaveBeenCalled()

    dispose()
  })

  it('should handle rapid locale changes correctly', async () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockImplementation(async loc => {
      // Simulate different loading times
      await new Promise(resolve =>
        setTimeout(resolve, loc === 'es-ES' ? 50 : 10)
      )
      return loc === 'es-ES' ? spanishMessages : frenchMessages
    })

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    const welcomeSignal = t.$.welcome

    // Rapid locale changes
    locale.set('es-ES')
    locale.set('fr-FR')

    // Wait for all async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should end up with the last locale (French)
    expect(welcomeSignal.value).toBe('Bienvenue!')

    dispose()
  })

  it('should dispose properly and clean up resources', () => {
    const locale = prop('en-US')
    const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

    const { t, dispose } = makeMessages({
      locale,
      defaultMessages,
      defaultLocale: 'en-US',
      localeLoader,
    })

    const welcomeSignal = t.$.welcome
    expect(welcomeSignal.value).toBe('Welcome!')

    // Dispose should not throw
    expect(() => dispose()).not.toThrow()

    // After disposal, changing locale should not trigger loading
    locale.set('es-ES')
    expect(localeLoader).not.toHaveBeenCalled()
  })

  it('should use custom default locale', async () => {
    const locale = prop('fr-FR')
    const localeLoader = vi.fn().mockRejectedValue(new Error('Not found'))

    const { t, dispose } = makeMessages({
      locale,
      defaultLocale: 'fr-FR',
      defaultMessages,
      localeLoader,
    })

    // Change to unsupported locale
    locale.set('unsupported-LOCALE')

    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should keep default messages
    const welcomeSignal = t.$.welcome
    expect(welcomeSignal.value).toBe('Welcome!')

    dispose()
  })
})
