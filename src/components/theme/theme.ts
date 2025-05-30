import { Provider, makeProviderMark } from '@tempots/dom'

// Import CSS with new layered architecture
import './index.css'
import { ThemeValue } from './types'
import { createTheme } from '../../theme/new-theme-system'

export const ThemeProvider: Provider<ThemeValue, object> = {
  mark: makeProviderMark<ThemeValue>('Theme'),

  // Create function returns the value and cleanup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create: (_options?: object) => {
    const [selectedTheme, dispose] = createTheme()
    return {
      value: selectedTheme,
      dispose: () => dispose(),
    }
  },
}
