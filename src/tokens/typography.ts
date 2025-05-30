// Typography Design Tokens
// TypeScript-defined typography values that generate CSS variables at build time

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
  base: ['1rem', { lineHeight: '1.5rem' }], // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1' }], // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
  '8xl': ['6rem', { lineHeight: '1' }], // 96px
  '9xl': ['8rem', { lineHeight: '1' }], // 128px
} as const

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// Font families
export const fontFamily = {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ],
  serif: [
    'ui-serif',
    'Georgia',
    'Cambria',
    '"Times New Roman"',
    'Times',
    'serif',
  ],
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    '"SF Mono"',
    'Consolas',
    '"Liberation Mono"',
    'Menlo',
    'monospace',
  ],
} as const

// CSS Variable accessors
export const fontSizeXs = 'var(--font-size-xs)'
export const fontSizeSm = 'var(--font-size-sm)'
export const fontSizeBase = 'var(--font-size-base)'
export const fontSizeLg = 'var(--font-size-lg)'
export const fontSizeXl = 'var(--font-size-xl)'
export const fontSize2xl = 'var(--font-size-2xl)'
export const fontSize3xl = 'var(--font-size-3xl)'
export const fontSize4xl = 'var(--font-size-4xl)'

export const fontWeightNormal = 'var(--font-weight-normal)'
export const fontWeightMedium = 'var(--font-weight-medium)'
export const fontWeightSemibold = 'var(--font-weight-semibold)'
export const fontWeightBold = 'var(--font-weight-bold)'

export const fontFamilySans = 'var(--font-family-sans)'
export const fontFamilySerif = 'var(--font-family-serif)'
export const fontFamilyMono = 'var(--font-family-mono)'

// Helper functions
export function getFontSizeVar(size: keyof typeof fontSize): string {
  return `var(--font-size-${size})`
}

export function getFontWeightVar(weight: keyof typeof fontWeight): string {
  return `var(--font-weight-${weight})`
}

// Generate CSS variables from typography tokens
export function generateTypographyVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  // Font sizes
  Object.entries(fontSize).forEach(([key, value]) => {
    const [size] = Array.isArray(value) ? value : [value]
    variables[`--font-size-${key}`] = size as string
  })

  // Font weights
  Object.entries(fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value
  })

  // Line heights
  Object.entries(lineHeight).forEach(([key, value]) => {
    variables[`--line-height-${key}`] = value
  })

  // Letter spacing
  Object.entries(letterSpacing).forEach(([key, value]) => {
    variables[`--letter-spacing-${key}`] = value
  })

  // Font families
  Object.entries(fontFamily).forEach(([key, value]) => {
    variables[`--font-family-${key}`] = value.join(', ')
  })

  return variables
}
