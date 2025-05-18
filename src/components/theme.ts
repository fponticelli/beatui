import { Provider, makeProviderMark } from '@tempots/dom'

// Import Tailwind CSS
import '../index.css'
import { ThemeValue } from './theme/types'
import { defaultTheme } from './theme/default-theme'

export interface ThemeOptions {
  theme?: [ThemeValue, () => void]
}

export const ThemeProvider: Provider<ThemeValue, ThemeOptions> = {
  mark: makeProviderMark<ThemeValue>('Theme'),

  // Create function returns the value and cleanup
  create: ({ theme }: ThemeOptions = {}) => {
    const [selectedTheme, dispose] = theme ?? defaultTheme()
    return {
      value: selectedTheme,
      dispose: () => dispose(),
    }
  },
}
