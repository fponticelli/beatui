import { Provider, makeProviderMark } from '@tempots/dom'

// Import Tailwind CSS
import './index.css'
import { ThemeValue } from './types'
import { defaultTheme } from './default-theme'

export const ThemeProvider: Provider<ThemeValue, object> = {
  mark: makeProviderMark<ThemeValue>('Theme'),

  // Create function returns the value and cleanup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create: (_options?: object) => {
    const [selectedTheme, dispose] = defaultTheme()
    return {
      value: selectedTheme,
      dispose: () => dispose(),
    }
  },
}
