import { describe, it, expect } from 'vitest'
import {
  generateFontFamilyOverrideVariables,
  generateTypographyVariables,
  getFontWeightVar,
  getFontWeightVarName,
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
})
