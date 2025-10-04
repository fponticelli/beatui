// Typography Design Tokens
// TypeScript-defined typography values that generate CSS variables at build time

export const fontSize = {
  '3xs': ['0.5rem', { lineHeight: '0.75rem' }], // 8px
  '2xs': ['0.625rem', { lineHeight: '0.75rem' }], // 10px
  xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
  md: ['1rem', { lineHeight: '1.5rem' }], // 16px
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

export function changeFontSize(size: FontSize, steps: number) {
  const sizes = Object.keys(fontSize) as FontSize[]
  const index = sizes.indexOf(size)
  if (index === -1) {
    throw new Error(`Invalid font size: ${size}`)
  }
  const newIndex = Math.min(Math.max(index + steps, 0), sizes.length - 1)
  return sizes[newIndex]
}

export type FontSize = keyof typeof fontSize

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

export type FontWeight = keyof typeof fontWeight

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

export type LineHeight = keyof typeof lineHeight

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

export type LetterSpacing = keyof typeof letterSpacing

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

export type FontFamily = keyof typeof fontFamily

export type FontFamilyOverrides = Partial<
  Record<FontFamily, string | readonly string[]>
>

function normalizeFontFamilyValue(value: string | readonly string[]) {
  return Array.isArray(value) ? value.join(', ') : (value as string)
}

export const semanticFontNames = [
  'body',
  'heading',
  'display',
  'mono',
  'ui',
  'prose',
] as const

export type SemanticFontName = (typeof semanticFontNames)[number]

export type SemanticFontOverrides = Partial<Record<SemanticFontName, string>>

const defaultSemanticFonts: Record<SemanticFontName, string> = {
  body: getFontFamilyVar('sans'),
  heading: getFontFamilyVar('sans'),
  display: getFontFamilyVar('sans'),
  mono: getFontFamilyVar('mono'),
  ui: getFontFamilyVar('sans'),
  prose: getFontFamilyVar('serif'),
}

// Helper functions
export function getFontSizeVarName(size: FontSize): string {
  return `--font-size-${size}`
}

export function getFontSizeVar(size: FontSize): string {
  return `var(${getFontSizeVarName(size)})`
}

export function getFontWeightVarName(weight: FontWeight): string {
  return `--font-weight-${weight}`
}

export function getFontWeightVar(weight: FontWeight): string {
  return `var(${getFontWeightVarName(weight)})`
}

export function getLineHeightVarName(height: LineHeight): string {
  return `--line-height-${height}`
}

export function getLineHeightVar(height: LineHeight): string {
  return `var(${getLineHeightVarName(height)})`
}

export function getLetterSpacingVarName(spacing: LetterSpacing): string {
  return `--letter-spacing-${spacing}`
}

export function getLetterSpacingVar(spacing: LetterSpacing): string {
  return `var(${getLetterSpacingVarName(spacing)})`
}

export function getFontFamilyVarName(family: FontFamily): string {
  return `--font-family-${family}`
}

export function getFontFamilyVar(family: FontFamily): string {
  return `var(${getFontFamilyVarName(family)})`
}

export function getSemanticFontVarName(name: SemanticFontName): string {
  return `--font-${name}`
}

export function getSemanticFontVar(name: SemanticFontName): string {
  return `var(${getSemanticFontVarName(name)})`
}

// Generate CSS variables from typography tokens
export function generateTypographyVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  // Font sizes
  Object.entries(fontSize).forEach(([key, value]) => {
    const [size] = Array.isArray(value) ? value : [value]
    variables[getFontSizeVarName(key as FontSize)] = size as string
  })

  // Font weights
  Object.entries(fontWeight).forEach(([key, value]) => {
    variables[getFontWeightVarName(key as FontWeight)] = value
  })

  // Line heights
  Object.entries(lineHeight).forEach(([key, value]) => {
    variables[getLineHeightVarName(key as LineHeight)] = value
  })

  // Letter spacing
  Object.entries(letterSpacing).forEach(([key, value]) => {
    variables[getLetterSpacingVarName(key as LetterSpacing)] = value
  })

  // Font families
  Object.entries(fontFamily).forEach(([key, value]) => {
    const normalizedValue = normalizeFontFamilyValue(value)
    variables[getFontFamilyVarName(key as FontFamily)] = normalizedValue
    variables[`--font-${key}`] = normalizedValue
  })

  return variables
}

export function generateFontFamilyOverrideVariables(
  overrides?: FontFamilyOverrides
): Record<string, string> {
  if (!overrides) {
    return {}
  }

  const variables: Record<string, string> = {}

  Object.entries(overrides).forEach(([key, value]) => {
    if (value == null) {
      return
    }
    const normalizedValue = normalizeFontFamilyValue(value)
    variables[getFontFamilyVarName(key as FontFamily)] = normalizedValue
    variables[`--font-${key}`] = normalizedValue
  })

  return variables
}

export function generateSemanticFontVariables(
  overrides?: SemanticFontOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticFonts, ...overrides }

  Object.entries(mapping).forEach(([key, value]) => {
    variables[getSemanticFontVarName(key as SemanticFontName)] = value
  })

  variables['--default-font-family'] = getSemanticFontVar('body')
  variables['--default-heading-font-family'] = getSemanticFontVar('heading')
  variables['--default-display-font-family'] = getSemanticFontVar('display')
  variables['--default-ui-font-family'] = getSemanticFontVar('ui')
  variables['--default-prose-font-family'] = getSemanticFontVar('prose')
  variables['--default-mono-font-family'] = getSemanticFontVar('mono')

  return variables
}
