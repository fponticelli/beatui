import {
  Signal,
  Provider,
  localStorageProp,
  makeProviderMark,
} from '@tempots/dom'

/**
 * Value provided by the Locale provider containing locale state and setter.
 */
export type LocaleValue = {
  /** Reactive signal containing the current locale string (e.g., 'en-US', 'es-ES') */
  locale: Signal<string>
  /** Function to update the current locale */
  setLocale: (locale: string) => void
}

/**
 * Locale provider that manages the current application locale with persistent storage.
 *
 * Features:
 * - Automatically detects browser language as default
 * - Persists locale selection to localStorage with key 'beatui-locale'
 * - Provides reactive updates when locale changes
 * - Includes proper cleanup for memory management
 *
 * @example
 * ```typescript
 * import { Use } from '@tempots/dom'
 * import { Locale } from '@tempots/beatui'
 *
 * // Use in component
 * Use(Locale, ({ locale, setLocale }) => html.div(locale))
 * ```
 */
export const Locale: Provider<LocaleValue, object> = {
  mark: makeProviderMark<LocaleValue>('Locale'),
  create: (_options?: object) => {
    const locale = localStorageProp({
      defaultValue: navigator.language ?? 'en-US',
      key: 'beatui-locale',
    })
    const dispose = () => {
      locale.dispose()
    }
    return {
      value: {
        locale,
        setLocale: (newLocale: string) => locale.set(newLocale),
      },
      dispose,
    }
  },
}
