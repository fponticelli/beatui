import {
  BackgroundColorName,
  backgroundConfig,
  bgColors,
  ColorShade,
  getColorVar,
  ThemeColorName,
  themeColorNames,
} from '@/tokens/colors'

type Mode = 'light' | 'dark'

type BackgroundVariant = 'solid' | 'soft' | 'light' | 'lighter'

type SupportedThemeColor = ThemeColorName | 'white' | 'black'

type SupportedSurfaceColor =
  | SupportedThemeColor
  | 'transparent'
  | BackgroundColorName

const themeColorSet = new Set<string>(themeColorNames)
const backgroundColorSet = new Set<BackgroundColorName>(
  Object.keys(bgColors.light) as BackgroundColorName[]
)

export function isThemeColor(
  color: SupportedSurfaceColor
): color is ThemeColorName {
  return themeColorSet.has(color as string)
}

export function isBackgroundColor(
  color: SupportedSurfaceColor
): color is BackgroundColorName {
  return backgroundColorSet.has(color as BackgroundColorName)
}

export function colorShade(
  color: SupportedThemeColor,
  shade: ColorShade
): string {
  switch (color) {
    case 'white':
      return 'var(--color-white)'
    case 'black':
      return 'var(--color-black)'
    default:
      return getColorVar(color, shade)
  }
}

export function surfaceColor(color: BackgroundColorName, mode: Mode): string {
  const [themeColor, shade] = bgColors[mode][color]
  return getColorVar(themeColor, shade)
}

type BackgroundPalette = {
  backgroundColor: string
  textColor: string
}

type BackgroundResult = {
  light: BackgroundPalette
  dark: BackgroundPalette
}

export function backgroundPalette(
  color: SupportedSurfaceColor,
  variant: BackgroundVariant = 'solid'
): BackgroundResult {
  if (color === 'transparent') {
    return {
      light: { backgroundColor: 'transparent', textColor: 'inherit' },
      dark: { backgroundColor: 'transparent', textColor: 'inherit' },
    }
  }

  if (isBackgroundColor(color)) {
    return {
      light: {
        backgroundColor: surfaceColor(color, 'light'),
        textColor: 'var(--text-normal-light)',
      },
      dark: {
        backgroundColor: surfaceColor(color, 'dark'),
        textColor: 'var(--text-normal-dark)',
      },
    }
  }

  if (color === 'white') {
    const override = backgroundConfig.overrides.white
    return {
      light:
        override?.light != null
          ? {
              backgroundColor: override.light.backgroundColor,
              textColor: override.light.color,
            }
          : {
              backgroundColor: 'var(--color-white)',
              textColor: 'var(--color-base-900)',
            },
      dark:
        override?.dark != null
          ? {
              backgroundColor: override.dark.backgroundColor,
              textColor: override.dark.color,
            }
          : {
              backgroundColor: 'var(--color-black)',
              textColor: 'var(--color-base-100)',
            },
    }
  }

  if (color === 'black') {
    const override = backgroundConfig.overrides.black
    return {
      light:
        override?.light != null
          ? {
              backgroundColor: override.light.backgroundColor,
              textColor: override.light.color,
            }
          : {
              backgroundColor: 'var(--color-black)',
              textColor: 'var(--color-white)',
            },
      dark:
        override?.dark != null
          ? {
              backgroundColor: override.dark.backgroundColor,
              textColor: override.dark.color,
            }
          : {
              backgroundColor: 'var(--color-black)',
              textColor: 'var(--color-white)',
            },
    }
  }

  const variantConfig = backgroundConfig.variants[variant]

  const lightShade = variantConfig.light.bgShade as ColorShade
  const darkShade = variantConfig.dark.bgShade as ColorShade

  return {
    light: {
      backgroundColor: colorShade(color, lightShade),
      textColor: variantConfig.light.textColor,
    },
    dark: {
      backgroundColor: colorShade(color, darkShade),
      textColor: variantConfig.dark.textColor,
    },
  }
}

type ForegroundPalette = {
  light: string
  dark: string
}

export function solidForegroundPalette(
  color: SupportedThemeColor
): ForegroundPalette {
  return {
    light: colorShade(color, 500),
    dark: colorShade(color, 600),
  }
}

export function softForegroundPalette(
  color: SupportedThemeColor
): ForegroundPalette {
  return {
    light: colorShade(color, 300),
    dark: colorShade(color, 700),
  }
}

export function textTonePalette(
  color: SupportedThemeColor,
  lightShade: ColorShade,
  darkShade: ColorShade
): ForegroundPalette {
  return {
    light: colorShade(color, lightShade),
    dark: colorShade(color, darkShade),
  }
}

export function borderPalette(
  color: SupportedThemeColor,
  lightShade: ColorShade = 500,
  darkShade: ColorShade = 600
): ForegroundPalette {
  return {
    light: colorShade(color, lightShade),
    dark: colorShade(color, darkShade),
  }
}
