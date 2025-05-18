import { localStorageProp } from '@tempots/dom'
import { Appearance, AppearancePreference, ThemeValue } from './types'

export const defaultTheme = (): [ThemeValue, () => void] => {
  const appearancePreference = localStorageProp<AppearancePreference>({
    key: 'appearance',
    defaultValue: 'system',
  })
  const setAppearance = (value: Appearance) => {
    appearancePreference.set(value)
  }
  const appearance = appearancePreference.map(value => {
    if (value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return value
  })

  appearance.on(value => {
    document.documentElement.classList.toggle('dark', value === 'dark')
  })

  const dispose = () => appearancePreference.dispose()

  return [
    {
      appearance,
      appearancePreference,
      setAppearance,
      theme: {
        button: ({ disabled, variant, size }): string => {
          const classes = ['rounded-md', 'font-semibold']
          if (disabled) {
            classes.push('opacity-50 cursor-not-allowed')
          } else {
            classes.push('cursor-pointer')
          }
          if (variant === 'primary') {
            classes.push(
              'border border-transparent bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
            )
          } else if (variant === 'secondary') {
            classes.push(
              'border border-transparent bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
            )
          } else if (variant === 'outline') {
            classes.push(
              'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-400'
            )
          } else if (variant === 'text') {
            classes.push(
              'border border-transparent text-blue-600 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-400'
            )
          }
          if (size === 'small') {
            classes.push('px-2 py-1 text-sm')
          } else if (size === 'medium') {
            classes.push('px-3 py-1.5 text-base')
          } else if (size === 'large') {
            classes.push('px-4 py-2 text-lg')
          }
          return classes.join(' ')
        },
      },
    },
    dispose,
  ]
}
