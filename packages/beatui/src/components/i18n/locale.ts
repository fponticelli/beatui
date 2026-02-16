import {
  Signal,
  Provider,
  localStorageProp,
  makeProviderMark,
  computedOf,
} from '@tempots/dom'
import {
  DirectionValue,
  DirectionPreference,
  resolveDirection,
} from '../../i18n/direction'

/**
 * Value provided by the Locale provider containing locale state, direction, and setters.
 */
export type LocaleValue = {
  /** Reactive signal containing the current locale string (e.g., 'en-US', 'es-ES') */
  locale: Signal<string>
  /** Function to update the current locale */
  setLocale: (locale: string) => void
  /** Reactive signal containing the computed text direction based on locale and preference */
  direction: Signal<DirectionValue>
  /** Reactive signal containing the user's direction preference */
  directionPreference: Signal<DirectionPreference>
  /** Function to update the direction preference */
  setDirectionPreference: (preference: DirectionPreference) => void
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
export const Locale: Provider<LocaleValue> = {
  mark: makeProviderMark<LocaleValue>('Locale'),
  create: (_options?: object) => {
    const locale = localStorageProp({
      defaultValue: navigator.language ?? 'en-US',
      key: 'beatui-locale',
    })

    const directionPreference = localStorageProp<DirectionPreference>({
      defaultValue: 'auto',
      key: 'beatui-direction-preference',
    })

    // Computed direction based on locale and preference
    const direction = computedOf(
      locale,
      directionPreference
    )((currentLocale, preference) =>
      resolveDirection(preference, currentLocale)
    )

    const dispose = () => {
      locale.dispose()
      directionPreference.dispose()
      direction.dispose()
    }

    return {
      value: {
        locale,
        setLocale: (newLocale: string) => locale.set(newLocale),
        direction,
        directionPreference,
        setDirectionPreference: (preference: DirectionPreference) =>
          directionPreference.set(preference),
      },
      dispose,
    }
  },
}
