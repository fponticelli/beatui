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
import { BeatUITheme } from '../../theme/beatui-theme'
import { useAppearence } from '@tempots/ui'

export const Theme: Provider<ThemeValue, object> = {
  mark: makeProviderMark<ThemeValue>('Theme'),

  // Create function returns the value and cleanup
  create: (_options?: object) => {
    const theme = new BeatUITheme()
    const systemAppearance = useAppearence()
    const appearancePreference = localStorageProp<AppearancePreference>({
      key: 'beatui-appearance-preference',
      defaultValue: 'system',
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
        theme,
        appearance,
        appearancePreference,
        setAppearancePreference,
      },
      dispose,
    }
  },
}

export const ThemeAppearance = () => {
  return Use(Theme, ({ appearance }) =>
    attr.class(appearance.map(a => `b-${a}`))
  )
}
