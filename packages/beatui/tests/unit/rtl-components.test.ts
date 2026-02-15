import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Provide, Use, prop } from '@tempots/dom'
import { Locale } from '../../src/components/i18n/locale'
import { Switch } from '../../src/components/form/input/switch'
import { DirectionPreference } from '../../src/i18n'

describe('RTL Component Behavior', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('Switch Component RTL', () => {
    it('should render correctly in RTL context', () => {
      const value = prop(false)

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale }) => {
            setLocale('ar-SA') // Set RTL locale
            return Switch({
              value,
              onChange: () => {},
              onLabel: 'تشغيل',
              offLabel: 'إيقاف',
            })
          })
        ),
        container
      )

      const switchElement = container.querySelector('.bc-switch')
      expect(switchElement).toBeTruthy()

      const onLabel = container.querySelector('.bc-switch__track-label--on')
      const offLabel = container.querySelector('.bc-switch__track-label--off')

      expect(onLabel?.textContent).toBe('تشغيل')
      expect(offLabel?.textContent).toBe('إيقاف')
    })

    it('should apply correct thumb class in off state', () => {
      const value = prop(false)

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale }) => {
            setLocale('ar-SA') // Set RTL locale
            return Switch({
              value,
              onChange: () => {},
            })
          })
        ),
        container
      )

      const thumb = container.querySelector('.bc-switch__thumb') as HTMLElement
      expect(thumb).toBeTruthy()

      // Thumb positioning is now CSS-driven via classes.
      // When off, thumb should have the --off class (positioned at start via CSS inset-inline-start: 0)
      expect(thumb.classList.contains('bc-switch__thumb--off')).toBe(true)
      expect(thumb.classList.contains('bc-switch__thumb--on')).toBe(false)
    })

    it('should toggle thumb class between on and off', async () => {
      const value = prop(false)

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale }) => {
            setLocale('en-US') // Set LTR locale
            return Switch({
              value,
              onChange: () => {},
            })
          })
        ),
        container
      )

      const thumb = container.querySelector('.bc-switch__thumb') as HTMLElement
      expect(thumb).toBeTruthy()

      // Off state
      expect(thumb.classList.contains('bc-switch__thumb--off')).toBe(true)

      // Toggle the switch to on
      value.set(true)

      // Wait for reactive update
      await new Promise(resolve => setTimeout(resolve, 10))

      // On state — CSS handles positioning via inset-inline-start
      expect(thumb.classList.contains('bc-switch__thumb--on')).toBe(true)
      expect(thumb.classList.contains('bc-switch__thumb--off')).toBe(false)
    })

    it('should use CSS class for positioning regardless of direction', async () => {
      const value = prop(true) // Start with switch on

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale }) => {
            setLocale('en-US')
            return Switch({
              value,
              onChange: () => {},
            })
          })
        ),
        container
      )

      const thumb = container.querySelector('.bc-switch__thumb') as HTMLElement
      expect(thumb).toBeTruthy()

      // Thumb positioning is CSS-driven via inset-inline-start (logical property).
      // RTL is handled automatically by the browser — no JS direction logic needed.
      expect(thumb.classList.contains('bc-switch__thumb--on')).toBe(true)
    })
  })

  describe('Direction Detection', () => {
    it('should detect RTL direction for Arabic locale', () => {
      let capturedDirection: string | undefined

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale, direction }) => {
            setLocale('ar-SA')
            capturedDirection = direction.get()
            return null
          })
        ),
        container
      )

      expect(capturedDirection).toBe('rtl')
    })

    it('should detect LTR direction for English locale', () => {
      let capturedDirection: string | undefined

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale, direction }) => {
            setLocale('en-US')
            capturedDirection = direction.get()
            return null
          })
        ),
        container
      )

      expect(capturedDirection).toBe('ltr')
    })

    it('should update direction when locale changes', () => {
      let capturedSetLocale: ((locale: string) => void) | undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let capturedDirection: any

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale, direction }) => {
            capturedSetLocale = setLocale
            capturedDirection = direction
            return null
          })
        ),
        container
      )

      // Start with English (LTR)
      capturedSetLocale!('en-US')
      expect(capturedDirection.get()).toBe('ltr')

      // Switch to Arabic (RTL)
      capturedSetLocale!('ar-SA')
      expect(capturedDirection.get()).toBe('rtl')

      // Switch back to English (LTR)
      capturedSetLocale!('en-US')
      expect(capturedDirection.get()).toBe('ltr')
    })
  })

  describe('Direction Preference Override', () => {
    it('should respect direction preference override', () => {
      let capturedSetLocale: ((locale: string) => void) | undefined
      let capturedSetDirectionPreference:
        | ((pref: DirectionPreference) => void)
        | undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let capturedDirection: any

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale, setDirectionPreference, direction }) => {
            capturedSetLocale = setLocale
            capturedSetDirectionPreference = setDirectionPreference
            capturedDirection = direction
            return null
          })
        ),
        container
      )

      // Set Arabic locale (normally RTL)
      capturedSetLocale!('ar-SA')
      expect(capturedDirection.get()).toBe('rtl')

      // Force LTR direction
      capturedSetDirectionPreference!('ltr')
      expect(capturedDirection.get()).toBe('ltr')

      // Force RTL direction for English
      capturedSetLocale!('en-US')
      capturedSetDirectionPreference!('rtl')
      expect(capturedDirection.get()).toBe('rtl')
    })
  })
})
