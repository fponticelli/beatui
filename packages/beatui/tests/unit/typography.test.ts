import { describe, it, expect } from 'vitest'
import { getFontWeightVar, getFontWeightVarName } from '../../src/tokens/typography'

describe('Typography Tokens', () => {
  it('getFontWeightVar should return CSS variable string', () => {
    expect(getFontWeightVar('bold')).toBe(`var(${getFontWeightVarName('bold')})`)
  })
})
