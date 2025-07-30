import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, Provide } from '@tempots/dom'
import { LocaleSelector } from '../../src/components/i18n/locale-selector'
import { Locale } from '../../src/i18n/locale'
import { Theme } from '../../src/components/theme/theme'

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

beforeEach(() => {
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

describe('LocaleSelector Component', () => {
  const testLocales = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'fr-FR', name: 'Français (France)' },
    { code: 'de-DE', name: 'Deutsch (Deutschland)' },
    { code: 'ja-JP', name: '日本語 (日本)' },
  ]

  it('should render with default props', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select')
    expect(select).not.toBeNull()
    expect(select!.value).toBe('en-US')

    const options = container.querySelectorAll('option')
    expect(options).toHaveLength(testLocales.length)

    document.body.removeChild(container)
  })

  it('should display correct locale names', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
          })
        )
      ),
      container
    )

    const options = container.querySelectorAll('option')

    testLocales.forEach((locale, index) => {
      expect(options[index].value).toBe(locale.code)
      expect(options[index].textContent).toBe(locale.name)
    })

    document.body.removeChild(container)
  })

  it('should reflect current locale selection', () => {
    localStorageMock.getItem.mockReturnValue('fr-FR')

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('fr-FR')

    document.body.removeChild(container)
  })

  it('should update locale when selection changes', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('en-US')

    // Change selection
    select.value = 'es-ES'
    select.dispatchEvent(new Event('change', { bubbles: true }))

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'beatui-locale',
      'es-ES'
    )

    document.body.removeChild(container)
  })

  it('should call onChange callback when provided', () => {
    localStorageMock.getItem.mockReturnValue('en-US')
    const onChangeMock = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
            onChange: onChangeMock,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement

    // Change selection
    select.value = 'de-DE'
    select.dispatchEvent(new Event('change', { bubbles: true }))

    expect(onChangeMock).toHaveBeenCalledWith('de-DE')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'beatui-locale',
      'de-DE'
    )

    document.body.removeChild(container)
  })

  it('should not update locale when updateLocale is false', () => {
    localStorageMock.getItem.mockReturnValue('en-US')
    const onChangeMock = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
            onChange: onChangeMock,
            updateLocale: false,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement

    // Change selection
    select.value = 'ja-JP'
    select.dispatchEvent(new Event('change', { bubbles: true }))

    expect(onChangeMock).toHaveBeenCalledWith('ja-JP')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()

    document.body.removeChild(container)
  })

  it('should handle empty locales array', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: [],
          })
        )
      ),
      container
    )

    const select = container.querySelector('select')
    expect(select).not.toBeNull()

    const options = container.querySelectorAll('option')
    expect(options).toHaveLength(0)

    document.body.removeChild(container)
  })

  it('should handle single locale', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const singleLocale = [{ code: 'en-US', name: 'English (US)' }]

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: singleLocale,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('en-US')

    const options = container.querySelectorAll('option')
    expect(options).toHaveLength(1)
    expect(options[0].value).toBe('en-US')
    expect(options[0].textContent).toBe('English (US)')

    document.body.removeChild(container)
  })

  it('should handle locale not in the list', () => {
    localStorageMock.getItem.mockReturnValue('zh-CN') // Not in testLocales

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('zh-CN') // Should still reflect the current locale

    document.body.removeChild(container)
  })

  it('should handle special characters in locale codes and names', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const specialLocales = [
      { code: 'zh-Hans-CN', name: '中文 (简体，中国)' },
      { code: 'ar-SA', name: 'العربية (السعودية)' },
      { code: 'hi-IN', name: 'हिन्दी (भारत)' },
      { code: 'ru-RU', name: 'Русский (Россия)' },
    ]

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: specialLocales,
          })
        )
      ),
      container
    )

    const options = container.querySelectorAll('option')

    specialLocales.forEach((locale, index) => {
      expect(options[index].value).toBe(locale.code)
      expect(options[index].textContent).toBe(locale.name)
    })

    document.body.removeChild(container)
  })

  it('should handle rapid locale changes', () => {
    localStorageMock.getItem.mockReturnValue('en-US')
    const onChangeMock = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
            onChange: onChangeMock,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement

    // Rapid changes
    const localeChanges = ['es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'en-US']

    localeChanges.forEach(locale => {
      select.value = locale
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onChangeMock).toHaveBeenCalledTimes(localeChanges.length)
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(localeChanges.length)

    localeChanges.forEach((locale, index) => {
      expect(onChangeMock).toHaveBeenNthCalledWith(index + 1, locale)
      expect(localStorageMock.setItem).toHaveBeenNthCalledWith(
        index + 1,
        'beatui-locale',
        locale
      )
    })

    document.body.removeChild(container)
  })

  it('should have proper accessibility attributes', () => {
    localStorageMock.getItem.mockReturnValue('en-US')

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
          })
        )
      ),
      container
    )

    const wrapper = container.querySelector('.bc-input-wrapper')
    expect(wrapper).not.toBeNull()

    const label = container.querySelector('label')
    expect(label).not.toBeNull()
    expect(label!.textContent).toBe('Locale')

    const select = container.querySelector('select')
    expect(select).not.toBeNull()
    expect(select!.getAttribute('id')).toBeTruthy()
    expect(label!.getAttribute('for')).toBe(select!.getAttribute('id'))

    document.body.removeChild(container)
  })

  it('should handle onChange callback errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('en-US')
    const onChangeMock = vi.fn().mockImplementation(() => {
      throw new Error('onChange error')
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Provide(Locale, {}, () =>
          LocaleSelector({
            locales: testLocales,
            onChange: onChangeMock,
          })
        )
      ),
      container
    )

    const select = container.querySelector('select') as HTMLSelectElement

    expect(() => {
      select.value = 'es-ES'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }).not.toThrow() // The component should handle the error gracefully

    expect(onChangeMock).toHaveBeenCalledWith('es-ES')
    // Locale should still be updated even if onChange throws
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'beatui-locale',
      'es-ES'
    )

    document.body.removeChild(container)
  })
})
