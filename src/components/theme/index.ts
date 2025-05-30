// Core theme system exports
export * from './types'
export * from './bem-classes'
export * from './css-variables'
export * from './css-generator'
export * from './theme'

// BEM theme exports
export type { ThemeColor, ThemeColorShade, ThemedColor } from './theme-system'

export {
  allColors,
  darkerShade,
  lighterShade,
  bemTheme,
  bemTheme as defaultTheme,
} from './theme-system'
