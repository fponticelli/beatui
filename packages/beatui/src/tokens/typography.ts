/**
 * Typography design tokens for BeatUI.
 *
 * Defines the complete typographic scale including font sizes, weights, line heights,
 * letter spacing, font families, and semantic font role mappings. All values are
 * converted to CSS custom properties at build time.
 *
 * @module
 */

/**
 * The base font size unit used as the foundation for the font size scale.
 *
 * @default '1rem'
 */
export const baseFontSize = '1rem'

/**
 * Font size scale mapping size names to `[fontSize, { lineHeight }]` tuples.
 * Each entry provides a font size derived from `--base-font-size` via `calc()`
 * and its recommended line height. When `--base-font-size` is `1rem` (default),
 * computed values match the pixel sizes shown.
 *
 * | Name | Multiplier | Line Height      | Pixels (at 1rem base) |
 * |------|------------|------------------|-----------------------|
 * | 3xs  | 0.5        | base * 0.75      | 8px                   |
 * | 2xs  | 0.625      | base * 0.75      | 10px                  |
 * | xs   | 0.75       | base             | 12px                  |
 * | sm   | 0.875      | base * 1.25      | 14px                  |
 * | md   | 1          | base * 1.5       | 16px                  |
 * | lg   | 1.125      | base * 1.75      | 18px                  |
 * | xl   | 1.25       | base * 1.75      | 20px                  |
 * | 2xl  | 1.5        | base * 2         | 24px                  |
 * | ...  | ...        | ...              | ...                   |
 * | 9xl  | 8          | 1 (unitless)     | 128px                 |
 */
export const fontSize = {
  '3xs': [
    'calc(var(--base-font-size) * 0.5)',
    { lineHeight: 'calc(var(--base-font-size) * 0.75)' },
  ], // 8px
  '2xs': [
    'calc(var(--base-font-size) * 0.625)',
    { lineHeight: 'calc(var(--base-font-size) * 0.75)' },
  ], // 10px
  xs: [
    'calc(var(--base-font-size) * 0.75)',
    { lineHeight: 'var(--base-font-size)' },
  ], // 12px
  sm: [
    'calc(var(--base-font-size) * 0.875)',
    { lineHeight: 'calc(var(--base-font-size) * 1.25)' },
  ], // 14px
  md: [
    'var(--base-font-size)',
    { lineHeight: 'calc(var(--base-font-size) * 1.5)' },
  ], // 16px
  lg: [
    'calc(var(--base-font-size) * 1.125)',
    { lineHeight: 'calc(var(--base-font-size) * 1.75)' },
  ], // 18px
  xl: [
    'calc(var(--base-font-size) * 1.25)',
    { lineHeight: 'calc(var(--base-font-size) * 1.75)' },
  ], // 20px
  '2xl': [
    'calc(var(--base-font-size) * 1.5)',
    { lineHeight: 'calc(var(--base-font-size) * 2)' },
  ], // 24px
  '3xl': [
    'calc(var(--base-font-size) * 1.875)',
    { lineHeight: 'calc(var(--base-font-size) * 2.25)' },
  ], // 30px
  '4xl': [
    'calc(var(--base-font-size) * 2.25)',
    { lineHeight: 'calc(var(--base-font-size) * 2.5)' },
  ], // 36px
  '5xl': ['calc(var(--base-font-size) * 3)', { lineHeight: '1' }], // 48px
  '6xl': ['calc(var(--base-font-size) * 3.75)', { lineHeight: '1' }], // 60px
  '7xl': ['calc(var(--base-font-size) * 4.5)', { lineHeight: '1' }], // 72px
  '8xl': ['calc(var(--base-font-size) * 6)', { lineHeight: '1' }], // 96px
  '9xl': ['calc(var(--base-font-size) * 8)', { lineHeight: '1' }], // 128px
} as const

/**
 * Returns a font size that is a given number of steps away from the provided size
 * in the font size scale. Positive steps move toward larger sizes; negative steps
 * move toward smaller sizes. The result is clamped to the available range.
 *
 * @param size - The starting font size name
 * @param steps - Number of steps to move (positive = larger, negative = smaller)
 * @returns The resulting font size name
 * @throws If the provided size is not a valid font size name
 *
 * @example
 * ```ts
 * changeFontSize('md', 1)  // 'lg'
 * changeFontSize('md', -1) // 'sm'
 * changeFontSize('9xl', 5) // '9xl' (clamped)
 * ```
 */
export function changeFontSize(size: FontSize, steps: number) {
  const sizes = Object.keys(fontSize) as FontSize[]
  const index = sizes.indexOf(size)
  if (index === -1) {
    throw new Error(`Invalid font size: ${size}`)
  }
  const newIndex = Math.min(Math.max(index + steps, 0), sizes.length - 1)
  return sizes[newIndex]
}

/**
 * Union type of all available font size names.
 */
export type FontSize = keyof typeof fontSize

/**
 * Font weight scale mapping weight names to their numeric CSS values.
 *
 * | Name       | Value |
 * |------------|-------|
 * | thin       | 100   |
 * | extralight | 200   |
 * | light      | 300   |
 * | normal     | 400   |
 * | medium     | 500   |
 * | semibold   | 600   |
 * | bold       | 700   |
 * | extrabold  | 800   |
 * | black      | 900   |
 */
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

/**
 * Union type of all available font weight names.
 */
export type FontWeight = keyof typeof fontWeight

/**
 * Line height scale mapping names to unitless multiplier values.
 *
 * | Name    | Value |
 * |---------|-------|
 * | none    | 1     |
 * | tight   | 1.25  |
 * | snug    | 1.375 |
 * | normal  | 1.5   |
 * | relaxed | 1.625 |
 * | loose   | 2     |
 */
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

/**
 * Union type of all available line height names.
 */
export type LineHeight = keyof typeof lineHeight

/**
 * Letter spacing scale mapping names to `em`-based values.
 *
 * | Name    | Value    |
 * |---------|----------|
 * | tighter | -0.05em  |
 * | tight   | -0.025em |
 * | normal  | 0em      |
 * | wide    | 0.025em  |
 * | wider   | 0.05em   |
 * | widest  | 0.1em    |
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

/**
 * Union type of all available letter spacing names.
 */
export type LetterSpacing = keyof typeof letterSpacing

/**
 * Font family stacks mapping family names to ordered arrays of font names.
 * Each stack provides a comprehensive fallback chain including system fonts and emoji support.
 */
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

/**
 * Union type of all available font family names.
 */
export type FontFamily = keyof typeof fontFamily

/**
 * Partial record for overriding default font family stacks.
 * Values can be a single font string or an array of font names.
 *
 * @example
 * ```ts
 * const overrides: FontFamilyOverrides = {
 *   sans: ['Inter', 'system-ui', 'sans-serif'],
 *   mono: '"Fira Code", monospace',
 * }
 * ```
 */
export type FontFamilyOverrides = Partial<
  Record<FontFamily, string | readonly string[]>
>

function normalizeFontFamilyValue(value: string | readonly string[]) {
  return Array.isArray(value) ? value.join(', ') : (value as string)
}

/**
 * Tuple of all semantic font role names.
 */
export const semanticFontNames = [
  'body',
  'heading',
  'display',
  'mono',
  'ui',
  'prose',
] as const

/**
 * Union type of all semantic font role names.
 */
export type SemanticFontName = (typeof semanticFontNames)[number]

/**
 * Partial record for overriding default semantic font family assignments.
 *
 * @example
 * ```ts
 * const overrides: SemanticFontOverrides = {
 *   heading: 'var(--font-family-serif)',
 * }
 * ```
 */
export type SemanticFontOverrides = Partial<Record<SemanticFontName, string>>

const defaultSemanticFonts: Record<SemanticFontName, string> = {
  body: getFontFamilyVar('sans'),
  heading: getFontFamilyVar('sans'),
  display: getFontFamilyVar('sans'),
  mono: getFontFamilyVar('mono'),
  ui: getFontFamilyVar('sans'),
  prose: getFontFamilyVar('serif'),
}

/**
 * Returns the CSS custom property name for a font size.
 *
 * @param size - The font size name
 * @returns The CSS variable name (e.g., `'--font-size-md'`)
 *
 * @example
 * ```ts
 * getFontSizeVarName('md') // '--font-size-md'
 * ```
 */
export function getFontSizeVarName(size: FontSize): string {
  return `--font-size-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the font size custom property.
 *
 * @param size - The font size name
 * @returns A CSS `var()` string (e.g., `'var(--font-size-md)'`)
 *
 * @example
 * ```ts
 * getFontSizeVar('md') // 'var(--font-size-md)'
 * ```
 */
export function getFontSizeVar(size: FontSize): string {
  return `var(${getFontSizeVarName(size)})`
}

/**
 * Returns the CSS custom property name for the base font size.
 *
 * @returns The CSS variable name `'--base-font-size'`
 */
export function getBaseFontSizeVarName(): string {
  return '--base-font-size'
}

/**
 * Returns a CSS `var()` expression referencing the base font size custom property.
 *
 * @returns A CSS `var()` string `'var(--base-font-size)'`
 */
export function getBaseFontSizeVar(): string {
  return `var(${getBaseFontSizeVarName()})`
}

/**
 * Returns the CSS custom property name for a font size's paired line height.
 *
 * @param size - The font size name
 * @returns The CSS variable name (e.g., `'--font-size-md-lh'`)
 */
export function getFontSizeLineHeightVarName(size: FontSize): string {
  return `--font-size-${size}-lh`
}

/**
 * Returns a CSS `var()` expression referencing the font size line height custom property.
 *
 * @param size - The font size name
 * @returns A CSS `var()` string (e.g., `'var(--font-size-md-lh)'`)
 */
export function getFontSizeLineHeightVar(size: FontSize): string {
  return `var(${getFontSizeLineHeightVarName(size)})`
}

/**
 * Returns the CSS custom property name for a font weight.
 *
 * @param weight - The font weight name
 * @returns The CSS variable name (e.g., `'--font-weight-bold'`)
 */
export function getFontWeightVarName(weight: FontWeight): string {
  return `--font-weight-${weight}`
}

/**
 * Returns a CSS `var()` expression referencing the font weight custom property.
 *
 * @param weight - The font weight name
 * @returns A CSS `var()` string (e.g., `'var(--font-weight-bold)'`)
 */
export function getFontWeightVar(weight: FontWeight): string {
  return `var(${getFontWeightVarName(weight)})`
}

/**
 * Returns the CSS custom property name for a line height.
 *
 * @param height - The line height name
 * @returns The CSS variable name (e.g., `'--line-height-normal'`)
 */
export function getLineHeightVarName(height: LineHeight): string {
  return `--line-height-${height}`
}

/**
 * Returns a CSS `var()` expression referencing the line height custom property.
 *
 * @param height - The line height name
 * @returns A CSS `var()` string (e.g., `'var(--line-height-normal)'`)
 */
export function getLineHeightVar(height: LineHeight): string {
  return `var(${getLineHeightVarName(height)})`
}

/**
 * Returns the CSS custom property name for a letter spacing value.
 *
 * @param spacing - The letter spacing name
 * @returns The CSS variable name (e.g., `'--letter-spacing-wide'`)
 */
export function getLetterSpacingVarName(spacing: LetterSpacing): string {
  return `--letter-spacing-${spacing}`
}

/**
 * Returns a CSS `var()` expression referencing the letter spacing custom property.
 *
 * @param spacing - The letter spacing name
 * @returns A CSS `var()` string (e.g., `'var(--letter-spacing-wide)'`)
 */
export function getLetterSpacingVar(spacing: LetterSpacing): string {
  return `var(${getLetterSpacingVarName(spacing)})`
}

/**
 * Returns the CSS custom property name for a font family.
 *
 * @param family - The font family name
 * @returns The CSS variable name (e.g., `'--font-family-sans'`)
 */
export function getFontFamilyVarName(family: FontFamily): string {
  return `--font-family-${family}`
}

/**
 * Returns a CSS `var()` expression referencing the font family custom property.
 *
 * @param family - The font family name
 * @returns A CSS `var()` string (e.g., `'var(--font-family-sans)'`)
 */
export function getFontFamilyVar(family: FontFamily): string {
  return `var(${getFontFamilyVarName(family)})`
}

/**
 * Returns the CSS custom property name for a semantic font role.
 *
 * @param name - The semantic font name
 * @returns The CSS variable name (e.g., `'--font-body'`)
 */
export function getSemanticFontVarName(name: SemanticFontName): string {
  return `--font-${name}`
}

/**
 * Returns a CSS `var()` expression referencing the semantic font custom property.
 *
 * @param name - The semantic font name
 * @returns A CSS `var()` string (e.g., `'var(--font-body)'`)
 */
export function getSemanticFontVar(name: SemanticFontName): string {
  return `var(${getSemanticFontVarName(name)})`
}

/**
 * Generates CSS custom property declarations for all typography tokens, including
 * the base font size, font sizes, per-size line heights, font weights, semantic
 * line heights, letter spacing, and font families.
 *
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateTypographyVariables()
 * // vars['--base-font-size'] === '1rem'
 * // vars['--font-size-md'] === 'var(--base-font-size)'
 * // vars['--font-size-md-lh'] === 'calc(var(--base-font-size) * 1.5)'
 * // vars['--font-weight-bold'] === '700'
 * ```
 */
export function generateTypographyVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  // Base font size
  variables[getBaseFontSizeVarName()] = baseFontSize

  // Font sizes and their paired line heights
  Object.entries(fontSize).forEach(([key, value]) => {
    const [size, opts] = Array.isArray(value) ? value : [value, undefined]
    variables[getFontSizeVarName(key as FontSize)] = size as string
    if (opts && typeof opts === 'object' && 'lineHeight' in opts) {
      variables[getFontSizeLineHeightVarName(key as FontSize)] = (
        opts as { lineHeight: string }
      ).lineHeight
    }
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

/**
 * Generates CSS custom property declarations for font family overrides.
 * Only produces variables for the families specified in the overrides.
 *
 * @param overrides - Optional font family overrides
 * @returns A record mapping CSS variable names to their values, or an empty record if no overrides
 *
 * @example
 * ```ts
 * const vars = generateFontFamilyOverrideVariables({ sans: ['Inter', 'sans-serif'] })
 * // vars['--font-family-sans'] === 'Inter, sans-serif'
 * ```
 */
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

/**
 * Generates CSS custom property declarations for semantic font roles and
 * default font family aliases. Merges defaults with any provided overrides.
 *
 * @param overrides - Optional overrides for semantic font role assignments
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateSemanticFontVariables({ heading: 'var(--font-family-serif)' })
 * // vars['--font-heading'] === 'var(--font-family-serif)'
 * // vars['--default-font-family'] === 'var(--font-body)'
 * ```
 */
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
