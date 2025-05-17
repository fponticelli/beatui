import { Provider, makeProviderMark, Signal, Value } from '@tempots/dom'

// Import Tailwind CSS
import '../index.css'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface Theme {
  button: (options: {
    disabled: Value<boolean>
    variant: Value<ButtonVariant>
    size: Value<ButtonSize>
  }) => string
}

export interface ThemeOptions {
  theme?: Value<Theme>
}

const defaultTheme: Theme = {
  button: ({ disabled, variant, size }): string => {
    const classes = ['rounded-md']
    if (disabled) {
      classes.push('opacity-50 cursor-not-allowed')
    } else {
      classes.push('cursor-pointer')
    }
    if (variant === 'primary') {
      classes.push(
        'border border-transparent bg-blue-600 hover:bg-blue-700 text-white'
      )
    } else if (variant === 'secondary') {
      classes.push(
        'border border-transparent bg-gray-200 hover:bg-gray-300 text-gray-800'
      )
    } else if (variant === 'outline') {
      classes.push('border border-blue-600 text-blue-600 hover:bg-blue-50')
    } else if (variant === 'text') {
      classes.push('border border-transparent text-blue-600 hover:bg-blue-50')
    }
    if (size === 'small') {
      classes.push('px-3 py-1.5 text-sm')
    } else if (size === 'medium') {
      classes.push('px-4 py-2 text-base')
    } else if (size === 'large') {
      classes.push('px-6 py-3 text-lg')
    }
    return classes.join(' ')
  },
}

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
