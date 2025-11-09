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

    it('should apply correct thumb positioning in RTL mode', async () => {
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

      // Switch behavior using transform translateX
      // When switch is off (false), thumb should be at the start (translateX(0))
      const transform = thumb.style.transform
      expect(transform).toBe('translateX(0)')

      // Toggle the switch to on
      value.set(true)

      // Wait for reactive update
      await new Promise(resolve => setTimeout(resolve, 10))

      // When switch is on (true), thumb should be at the end
      // Since ElementRect returns 0px width in test environment, we get calc with proper thumb size
      const newTransform = thumb.style.transform
      expect(newTransform).toContain(
        'translateX(calc((var(--spacing-base) * 6) - 0px))'
      )
    })

    it('should apply correct thumb positioning in LTR mode', async () => {
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

      // In LTR mode, when switch is off (false), thumb should be at the start (translateX(0))
      const transform = thumb.style.transform
      expect(transform).toBe('translateX(0)')

      // Toggle the switch to on
      value.set(true)

      // Wait for reactive update
      await new Promise(resolve => setTimeout(resolve, 10))

      // In LTR mode, when switch is on (true), thumb should be at the end
      // Since ElementRect returns 0px width in test environment, we get calc with proper thumb size
      const newTransform = thumb.style.transform
      expect(newTransform).toContain(
        'translateX(calc(0px - (var(--spacing-base) * 6)))'
      )
    })

    it('should maintain consistent thumb positioning regardless of direction', async () => {
      const value = prop(true) // Start with switch on
      let capturedSetLocale: ((locale: string) => void) | undefined

      render(
        Provide(Locale, {}, () =>
          Use(Locale, ({ setLocale }) => {
            capturedSetLocale = setLocale
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

      // Start with LTR - switch on should be at end (translateX with distance)
      capturedSetLocale!('en-US')
      await new Promise(resolve => setTimeout(resolve, 10))
      let transform = thumb.style.transform
      expect(transform).toContain(
        'translateX(calc(0px - (var(--spacing-base) * 6)))'
      )

      // Switch to RTL - switch on should be at different position (RTL behavior)
      capturedSetLocale!('ar-SA')
      await new Promise(resolve => setTimeout(resolve, 10))
      transform = thumb.style.transform
      expect(transform).toContain(
        'translateX(calc((var(--spacing-base) * 6) - 0px))'
      )

      // Switch back to LTR - should return to LTR position
      capturedSetLocale!('en-US')
      await new Promise(resolve => setTimeout(resolve, 10))
      transform = thumb.style.transform
      expect(transform).toContain(
        'translateX(calc(0px - (var(--spacing-base) * 6)))'
      )
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
