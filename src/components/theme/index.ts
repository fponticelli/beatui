// New Layered CSS Theme System
export * from './types'

// Export design tokens
export * from '../../tokens'

// Export new theme system
export {
  LayeredTheme,
  theme as defaultTheme,
  createTheme,
  type ComponentClassOptions,
} from '../../theme/new-theme-system'

// Legacy exports for backward compatibility (deprecated)
export * from './theme'

// Legacy color utilities (deprecated - use new color tokens instead)
export {
  allColors,
  darkerShade,
  lighterShade,
  type ThemeColor,
  type ThemeColorShade,
  type ThemedColor,
} from './colors'
