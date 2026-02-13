import {
  Provider,
  Use,
  attr,
  computedOf,
  localStorageProp,
  makeProviderMark,
} from '@tempots/dom'

// Import CSS with new layered architecture
import '../../styles/index.css'
import { AppearancePreference, ThemeValue } from './types'
import { useAppearance } from '@tempots/ui'

/**
 * Configuration options for the Theme provider.
 */
export interface ThemeOptions {
  /** Initial appearance preference. Defaults to `'system'`. */
  defaultAppearance?: AppearancePreference
  /** localStorage key for persisting appearance preference. Defaults to `'bui-appearance'`. */
  appearancePreferenceKey?: string
}

/**
 * Theme provider that manages light/dark appearance mode.
 * Tracks system appearance, user preference, and persists settings to localStorage.
 * The resolved appearance is available as a reactive signal.
 *
 * @example
 * ```ts
 * import { Provide } from '@tempots/dom'
 * import { Theme } from '@tempots/beatui'
 *
 * Provide(Theme, { defaultAppearance: 'dark' },
 *   html.div({},
 *     html.p({}, 'Theme is active!')
 *   )
 * )
 * ```
 */
export const Theme: Provider<ThemeValue, ThemeOptions> = {
  mark: makeProviderMark<ThemeValue>('Theme'),

  // Create function returns the value and cleanup
  create: ({
    defaultAppearance = 'system',
    appearancePreferenceKey = 'bui-appearance',
  }: ThemeOptions = {}) => {
    const systemAppearance = useAppearance()
    const appearancePreference = localStorageProp<AppearancePreference>({
      key: appearancePreferenceKey,
      defaultValue: defaultAppearance,
    })
    const dispose = () => {
      systemAppearance.dispose()
      appearancePreference.dispose()
    }
    const appearance = computedOf(
      systemAppearance,
      appearancePreference
    )((system, pref) => {
      if (pref === 'system') {
        return system
      }
      return pref
    })
    const setAppearancePreference = (value: AppearancePreference) => {
      appearancePreference.set(value)
    }
    return {
      value: {
        appearance,
        appearancePreference,
        setAppearancePreference,
      },
      dispose,
    }
  },
}

/**
 * Reactive attribute that applies the current theme appearance as a CSS class.
 * Maps the resolved appearance ('light' or 'dark') to class names `'b-light'` or `'b-dark'`.
 * Typically attached to the document body or root element.
 *
 * @returns A reactive `attr.class` attribute
 *
 * @example
 * ```ts
 * import { html } from '@tempots/dom'
 * import { ThemeAppearance } from '@tempots/beatui'
 *
 * html.body(ThemeAppearance(),
 *   html.div({}, 'Content inherits theme appearance')
 * )
 * ```
 */
export const ThemeAppearance = () => {
  return Use(Theme, ({ appearance }) =>
    attr.class(appearance.map(a => `b-${a}`))
  )
}
