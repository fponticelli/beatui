import { localStorageProp } from '@tempots/dom'
import {
  Appearance,
  AppearancePreference,
  PanelColor,
  PanelShadow,
  Roundedness,
  Side,
  ThemeValue,
} from './types'
import {
  bgColors,
  borderColors,
  darkerShade,
  lighterShade,
  outlineColors,
  textColors,
  ThemeColor,
  ThemeColorShade,
  ThemedColor,
} from './colors'

export type ThemeOptions = {
  mainShade?: ThemeColorShade
  primaryColor?: ThemeColor
  secondaryColor?: ThemeColor
  neutralColor?: ThemeColor
  outlineColor?: ThemeColor
}

export const shades = {
  lightest: 50,
  lighter: 100,
  light: 200,
  medium: 600,
  dark: 800,
  darker: 900,
  darkest: 950,
} as const

export const defaultTheme = ({
  mainShade = shades.medium,
  primaryColor = 'sky',
  secondaryColor = 'green',
  neutralColor = 'neutral',
  outlineColor = 'sky',
}: ThemeOptions = {}): [ThemeValue, () => void] => {
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

  const getRoundedness = (roundedness: Roundedness) => {
    switch (roundedness) {
      case 'full':
        return 'rounded-full'
      case 'large':
        return 'rounded-xl'
      case 'medium':
        return 'rounded-lg'
      case 'small':
        return 'rounded-sm'
      case 'none':
        return 'rounded-none'
    }
  }

  const getOutline = (color: ThemeColor) => {
    const classes = [
      'focus:outline',
      'focus:outline-2',
      'focus:outline-offset-1',
      'focus:outline-sky-400',
      outlineColors[color][mainShade].focus,
    ]
    return classes
  }

  const getColor = (themedColor: ThemedColor) => {
    if (themedColor === 'primary') {
      return primaryColor
    }
    if (themedColor === 'secondary') {
      return secondaryColor
    }
    if (themedColor === 'neutral') {
      return neutralColor
    }
    return themedColor
  }

  const getBorder = (side: 'left' | 'top' | 'bottom' | 'right') => {
    if (side === 'left') return 'border-l'
    if (side === 'top') return 'border-t'
    if (side === 'bottom') return 'border-b'
    return 'border-r'
  }

  const getBordersFromSide = (side: Side) => {
    if (side === 'none') {
      return []
    }
    if (side === 'all') {
      return ['border']
    }
    if (Array.isArray(side)) {
      return side.map(getBorder)
    }
    return [getBorder(side)]
  }

  const getShadow = (shadow: PanelShadow) => {
    if (shadow === 'none') {
      return 'shadow-none'
    }
    if (shadow === 'small') {
      return 'shadow-sm'
    }
    if (shadow === 'medium') {
      return 'shadow-md'
    }
    return 'shadow-lg'
  }

  return [
    {
      appearance,
      appearancePreference,
      setAppearance,
      theme: {
        button: ({
          disabled,
          variant,
          size,
          color: colorName = 'primary',
          roundedness = 'medium',
          fill = false,
        }): string => {
          const color = getColor(colorName)
          const classes = [
            'transition',
            'font-semibold',
            'border',
            'uppercase',
            'inline-flex',
            'items-center',
            'justify-center',
            'text-shadow-xs',
            getRoundedness(roundedness),
          ]
          classes.push(...getOutline(outlineColor))
          // fill
          if (fill) {
            classes.push('w-full')
          }
          // disabled
          if (disabled) {
            classes.push('opacity-50 cursor-not-allowed')
          } else {
            classes.push(
              'hover:scale-105',
              'cursor-pointer',
              'active:translate-y-0.5'
            )
          }
          // variant and color
          if (variant === 'filled') {
            // common filled
            classes.push('border-transparent text-white')
            // color
            classes.push(bgColors[color][mainShade].normal)
            classes.push(bgColors[color][darkerShade(mainShade, 2)].dark)
            if (!disabled) {
              classes.push(bgColors[color][darkerShade(mainShade)].hover)
            }
          } else if (variant === 'light') {
            const shade = lighterShade(mainShade, 3)
            // common filled
            classes.push('border-transparent text-black')
            // color
            classes.push(bgColors[color][shade].normal)
            if (!disabled) {
              classes.push(bgColors[color][darkerShade(shade)].hover)
            }
          } else if (variant === 'outline') {
            const lighter = lighterShade(mainShade, 1)
            // common outline
            classes.push(
              'bg-white',
              'dark:bg-black',
              textColors[color][mainShade].normal,
              borderColors[color][mainShade].normal,
              textColors[color][lighter].dark,
              borderColors[color][lighter].dark
            )
            if (!disabled) {
              const shade = darkerShade(mainShade, 1)
              const lighter = lighterShade(shade, 3)
              classes.push(
                bgColors[neutralColor][shades.light].hover,
                textColors[color][shade].hover,
                borderColors[color][shade].hover,
                bgColors[neutralColor][shades.dark].darkhover,
                textColors[color][lighter].darkhover,
                borderColors[color][lighter].darkhover
              )
            }
          } else if (variant === 'default') {
            // common default
            classes.push(
              'border-transparent',
              bgColors[neutralColor][shades.light].normal,
              textColors[color][darkerShade(mainShade, 2)].normal,
              bgColors[neutralColor][shades.dark].dark,
              textColors[color][lighterShade(mainShade, 2)].dark
            )
            if (!disabled) {
              classes.push(
                bgColors[neutralColor][darkerShade(shades.light)].hover,
                textColors[color][darkerShade(mainShade, 3)].hover,
                bgColors[neutralColor][lighterShade(shades.dark)].darkhover,
                textColors[color][lighterShade(mainShade, 3)].darkhover
              )
            }
          } else if (variant === 'text') {
            classes.push(
              'border-transparent',
              textColors[color][darkerShade(mainShade, 1)].normal,
              textColors[color][lighterShade(mainShade, 1)].dark
              // 'border-transparent text-blue-600 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-400'
            )
            if (!disabled) {
              classes.push(bgColors[color][lighterShade(shades.light, 1)].hover)
              classes.push(
                bgColors[color][darkerShade(shades.dark, 3)].darkhover
              )
            }
          }
          // size
          if (size === 'small') {
            classes.push('px-1 py-1 text-xs gap-0.5')
          } else if (size === 'medium') {
            classes.push('px-1.5 py-1.5 text-sm gap-1')
          } else if (size === 'large') {
            classes.push('px-2 py-2 text-md gap-1.5')
          }
          return classes.join(' ')
        },
        iconContainer: ({ size, color }): string => {
          const classes = ['inline-flex', 'items-center', 'justify-center']

          if (color) {
            classes.push(color)
          } else {
            classes.push('text-current')
          }

          if (size === 'small') {
            classes.push('size-3')
          } else if (size === 'medium') {
            classes.push('size-4')
          } else if (size === 'large') {
            classes.push('size-6')
          }

          return classes.join(' ')
        },
        icon: 'w-full h-full',
        overlay: ({ effect, mode }) => {
          const classes = [
            'absolute inset-0 flex items-center justify-center z-50 w-full h-full top-0 left-0 bottom-0 right-0',
          ]
          if (effect === 'transparent') {
            classes.push('bg-gray-400/10')
          } else {
            classes.push('backdrop-blur-xs bg-black/30')
          }
          if (mode !== 'capturing') {
            classes.push('pointer-events-none *:pointer-events-auto')
          }
          return classes.join(' ')
        },
        fadeInOut: ({ state }) => {
          if (state === 'initial') {
            return 'opacity-0 transition-opacity duration-0 ease-in-out'
          }
          if (state === 'entering') {
            return 'opacity-100 transition-opacity duration-300 ease-in-out'
          }
          if (state === 'exiting') {
            return 'opacity-0 transition-opacity duration-300 ease-in-out'
          }
          return 'opacity-100 transition-opacity duration-300 ease-in-out'
        },
        panel: ({
          side,
          color: colorName,
          shadow,
        }: {
          side: Side
          color: PanelColor
          shadow: PanelShadow
        }): string => {
          const classes: string[] = []
          if (colorName === 'transparent') {
            classes.push('bg-transparent')
          } else if (colorName === 'white') {
            classes.push('bg-white dark:bg-black')
          } else if (colorName === 'black') {
            classes.push('bg-black dark:bg-white')
          } else {
            const color = getColor(colorName)
            classes.push(bgColors[color][shades.lightest].normal)
            classes.push(bgColors[color][shades.darkest].dark)
          }
          if (side !== 'none') {
            if (colorName === 'transparent') {
              classes.push('border-transparent')
            } else if (colorName === 'white' || colorName === 'black') {
              const color = getColor('neutral')
              classes.push(borderColors[color][shades.light].normal)
            } else {
              const color = getColor(colorName)
              classes.push(borderColors[color][shades.light].normal)
              classes.push(borderColors[color][shades.dark].dark)
            }
          }
          classes.push(...getBordersFromSide(side))
          classes.push(getShadow(shadow))
          return classes.join(' ')
        },
      },
    },
    dispose,
  ]
}
