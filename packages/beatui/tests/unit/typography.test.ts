import { describe, it, expect } from 'vitest'
import {
  baseFontSize,
  fontSize,
  generateFontFamilyOverrideVariables,
  generateTypographyVariables,
  getBaseFontSizeVarName,
  getFontSizeLineHeightVarName,
  getFontWeightVar,
  getFontWeightVarName,
  type FontSize,
} from '../../src/tokens/typography'

describe('Typography Tokens', () => {
  it('getFontWeightVar should return CSS variable string', () => {
    expect(getFontWeightVar('bold')).toBe(
      `var(${getFontWeightVarName('bold')})`
    )
  })

  it('exposes Tailwind font aliases alongside BeatUI tokens', () => {
    const variables = generateTypographyVariables()
    expect(variables['--font-sans']).toContain('system-ui')
    expect(variables['--font-serif']).toContain('ui-serif')
    expect(variables['--font-mono']).toContain('ui-monospace')
  })

  it('propagates overrides to Tailwind font aliases', () => {
    const overrides = generateFontFamilyOverrideVariables({
      sans: ['Inter', 'system-ui'],
    })
    expect(overrides['--font-sans']).toBe('Inter, system-ui')
  })

  it('emits --base-font-size variable', () => {
    const variables = generateTypographyVariables()
    expect(variables[getBaseFontSizeVarName()]).toBe(baseFontSize)
  })

  it('font size variables reference --base-font-size', () => {
    const variables = generateTypographyVariables()
    expect(variables['--font-size-md']).toBe('var(--base-font-size)')
    expect(variables['--font-size-sm']).toContain('var(--base-font-size)')
    expect(variables['--font-size-lg']).toContain('var(--base-font-size)')
    expect(variables['--font-size-3xs']).toContain('var(--base-font-size)')
    expect(variables['--font-size-9xl']).toContain('var(--base-font-size)')
  })

  it('emits --font-size-*-lh variables for each font size', () => {
    const variables = generateTypographyVariables()
    const sizes = Object.keys(fontSize) as FontSize[]

    for (const size of sizes) {
      const varName = getFontSizeLineHeightVarName(size)
      expect(variables[varName]).toBeDefined()
    }

    // rem-based line heights reference --base-font-size
    expect(variables['--font-size-md-lh']).toContain('var(--base-font-size)')
    expect(variables['--font-size-sm-lh']).toContain('var(--base-font-size)')

    // unitless line heights stay as '1'
    expect(variables['--font-size-5xl-lh']).toBe('1')
    expect(variables['--font-size-9xl-lh']).toBe('1')
  })
})
