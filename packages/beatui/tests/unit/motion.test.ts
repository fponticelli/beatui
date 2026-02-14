import { describe, it, expect } from 'vitest'
import {
  baseMotionDuration,
  generateMotionVariables,
  getMotionDurationVarName,
} from '../../src/tokens/motion'

describe('Motion Tokens', () => {
  it('emits --motion-duration-base with the literal base value', () => {
    const variables = generateMotionVariables()
    expect(variables[getMotionDurationVarName('base')]).toBe(baseMotionDuration)
  })

  it('duration variables reference --motion-duration-base via calc', () => {
    const variables = generateMotionVariables()
    expect(variables['--motion-duration-fast']).toContain(
      'var(--motion-duration-base)'
    )
    expect(variables['--motion-duration-slow']).toContain(
      'var(--motion-duration-base)'
    )
    expect(variables['--motion-duration-relaxed']).toContain(
      'var(--motion-duration-base)'
    )
  })

  it('instant duration stays as 0s', () => {
    const variables = generateMotionVariables()
    expect(variables['--motion-duration-instant']).toBe('0s')
  })

  it('easing values are unchanged', () => {
    const variables = generateMotionVariables()
    expect(variables['--motion-easing-standard']).toContain('cubic-bezier')
  })
})
