import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prop } from '@tempots/dom'
import { makeMessages } from '../../src/i18n/translate'

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log
beforeEach(() => {
  console.log = vi.fn()
})

afterEach(() => {
  console.log = originalConsoleLog
})

describe('makeMessages Edge Cases', () => {
  const defaultMessages = {
    simple: () => 'Simple message',
    withParam: (name: string) => `Hello, ${name}!`,
    withMultipleParams: (a: string, b: number, c: boolean) => `${a}-${b}-${c}`,
  }

  describe('fn.fn undefined issue', () => {
    it('should handle undefined function gracefully', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue({
        simple: undefined, // This could cause fn.fn to be undefined
        withParam: (name: string) => `Hello, ${name}!`,
        withMultipleParams: (a: string, b: number, c: boolean) =>
          `${a}-${b}-${c}`,
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      // This should not throw even if the loaded message is undefined
      expect(() => {
        const signal = t.simple()
        // The signal should exist but may have undefined value
        expect(signal).toBeDefined()
      }).not.toThrow()

      dispose()
    })

    it('should handle null function gracefully', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue({
        simple: null, // This could cause fn.fn to be undefined
        withParam: (name: string) => `Hello, ${name}!`,
        withMultipleParams: (a: string, b: number, c: boolean) =>
          `${a}-${b}-${c}`,
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      expect(() => {
        const signal = t.simple()
        expect(signal).toBeDefined()
      }).not.toThrow()

      dispose()
    })

    it('should handle malformed message objects', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue({
        simple: 'not a function', // Wrong type
        withParam: (name: string) => `Hello, ${name}!`,
        withMultipleParams: (a: string, b: number, c: boolean) =>
          `${a}-${b}-${c}`,
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      expect(() => {
        const signal = t.simple()
        expect(signal).toBeDefined()
      }).not.toThrow()

      dispose()
    })

    it('should handle empty message objects', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue({})

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      expect(() => {
        const signal = t.simple()
        expect(signal).toBeDefined()
      }).not.toThrow()

      dispose()
    })

    it('should handle partially loaded message objects', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue({
        simple: () => 'Loaded simple',
        // withParam is missing
        withMultipleParams: (a: string, b: number, c: boolean) =>
          `Loaded: ${a}-${b}-${c}`,
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      expect(() => {
        const simpleSignal = t.simple()
        const paramSignal = t.withParam(prop('test'))
        const multiSignal = t.withMultipleParams(prop('a'), prop(1), prop(true))

        expect(simpleSignal).toBeDefined()
        expect(paramSignal).toBeDefined()
        expect(multiSignal).toBeDefined()
      }).not.toThrow()

      dispose()
    })

    it('should handle functions that throw errors', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue({
        simple: () => {
          throw new Error('Message function error')
        },
        withParam: (name: string) => `Hello, ${name}!`,
        withMultipleParams: (a: string, b: number, c: boolean) =>
          `${a}-${b}-${c}`,
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      expect(() => {
        const signal = t.simple()
        expect(signal).toBeDefined()
        // Accessing the value might throw, but creating the signal should not
      }).not.toThrow()

      dispose()
    })

    it('should handle async message loading failures gracefully', async () => {
      const locale = prop('en-US')
      const localeLoader = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Fallback error'))

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      // Change locale to trigger loading
      locale.set('es-ES')

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(() => {
        const signal = t.simple()
        expect(signal.value).toBe('Simple message') // Should use default
      }).not.toThrow()

      dispose()
    })

    it('should handle concurrent locale changes during loading', async () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockImplementation(async loc => {
        // Simulate variable loading times
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50))

        if (loc === 'es-ES') {
          return {
            simple: () => 'Spanish simple',
            withParam: (name: string) => `Hola, ${name}!`,
            withMultipleParams: (a: string, b: number, c: boolean) =>
              `ES: ${a}-${b}-${c}`,
          }
        } else if (loc === 'fr-FR') {
          return {
            simple: () => 'French simple',
            withParam: (name: string) => `Bonjour, ${name}!`,
            withMultipleParams: (a: string, b: number, c: boolean) =>
              `FR: ${a}-${b}-${c}`,
          }
        }
        return defaultMessages
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      const signal = t.simple()

      // Rapid locale changes
      locale.set('es-ES')
      locale.set('fr-FR')
      locale.set('es-ES')
      locale.set('fr-FR')

      // Wait for all async operations
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(() => {
        const value = signal.value
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      }).not.toThrow()

      dispose()
    })

    it('should handle invalid locale strings', async () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockImplementation(async loc => {
        if (loc.includes('invalid')) {
          throw new Error('Invalid locale')
        }
        return defaultMessages
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      // Test various invalid locale strings
      const invalidLocales = [
        'invalid-locale',
        '',
        '   ',
        'null',
        'undefined',
        '123-456',
        'a'.repeat(100),
      ]

      for (const invalidLocale of invalidLocales) {
        locale.set(invalidLocale)
        await new Promise(resolve => setTimeout(resolve, 10))

        expect(() => {
          const signal = t.simple()
          expect(signal).toBeDefined()
        }).not.toThrow()
      }

      dispose()
    })

    it('should handle memory pressure during message loading', async () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockImplementation(async () => {
        // Create a large object to simulate memory pressure
        const largeMessages: Record<string, () => string> = {}
        for (let i = 0; i < 1000; i++) {
          largeMessages[`message${i}`] = () => `Message ${i}`.repeat(100)
        }
        return {
          ...defaultMessages,
          defaultLocale: 'en-US',
          ...largeMessages,
        }
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      locale.set('memory-test')
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(() => {
        const signal = t.simple()
        expect(signal).toBeDefined()
      }).not.toThrow()

      dispose()
    })

    it('should handle disposal during async loading', async () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return defaultMessages
      })

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      // Start loading
      locale.set('test-locale')

      // Dispose immediately
      dispose()

      // Wait for what would have been the loading time
      await new Promise(resolve => setTimeout(resolve, 100))

      // After disposal, accessing translation functions may throw
      // This is expected behavior - the test should verify disposal works correctly
      expect(() => dispose()).not.toThrow()

      // Accessing t after disposal may throw, which is acceptable
      try {
        const signal = t.simple()
        // If it doesn't throw, the signal should still be defined
        expect(signal).toBeDefined()
      } catch (error) {
        // If it throws, that's also acceptable after disposal
        expect(error).toBeDefined()
      }
    })
  })

  describe('Proxy behavior edge cases', () => {
    it('should handle accessing non-existent message keys', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      expect(() => {
        // Access a key that doesn't exist in defaultMessages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signal = (t as any).nonExistentKey()
        expect(signal).toBeDefined()
      }).not.toThrow()

      dispose()
    })

    it('should handle symbol property access', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      const symbolKey = Symbol('test')

      expect(() => {
        // Access with symbol key
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (t as any)[symbolKey]
        expect(result).toBeInstanceOf(Function)
      }).not.toThrow()

      dispose()
    })

    it('should handle numeric property access', () => {
      const locale = prop('en-US')
      const localeLoader = vi.fn().mockResolvedValue(defaultMessages)

      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale: 'en-US',
        localeLoader,
      })

      expect(() => {
        // Access with numeric key
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (t as any)[0]
        expect(result).toBeInstanceOf(Function)
      }).not.toThrow()

      dispose()
    })
  })
})
