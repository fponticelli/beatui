import { Signal, Provider, makeProviderMark, signal, Value } from '@tempots/dom'

export interface Theme {}

export interface ThemeOptions {
  theme?: Value<Theme>
}

const defaultTheme: Theme = {}

export const ThemeProvider: Provider<Signal<Theme>, ThemeOptions> = {
  mark: makeProviderMark<Signal<Theme>>('Theme'),

  // Create function returns the value and cleanup
  create: ({ theme = defaultTheme }: ThemeOptions = {}) => {
    return {
      value: Value.toSignal(theme),
      dispose: () => {},
    }
  },
}
