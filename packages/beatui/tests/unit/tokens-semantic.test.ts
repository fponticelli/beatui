import { describe, it, expect } from 'vitest'
import { generateSemanticTokenVariables } from '../../src/tokens'

describe('generateSemanticTokenVariables', () => {
  it('includes default semantic font aliases', () => {
    const variables = generateSemanticTokenVariables()
    expect(variables['--font-heading']).toBe('var(--font-family-sans)')
    expect(variables['--font-body']).toBe('var(--font-family-sans)')
    expect(variables['--font-mono']).toBe('var(--font-family-mono)')
    expect(variables['--font-prose']).toBe('var(--font-family-serif)')
    expect(variables['--default-font-family']).toBe('var(--font-family-sans)')
    expect(variables['--default-mono-font-family']).toBe('var(--font-family-mono)')
    expect(variables['--default-heading-font-family']).toBe(
      'var(--font-family-sans)'
    )
  })

  it('allows overriding fonts via semantic options', () => {
    const variables = generateSemanticTokenVariables({
      fonts: {
        heading: 'var(--font-family-serif)',
        body: '"Custom Body"',
      },
    })

    expect(variables['--font-heading']).toBe('var(--font-family-serif)')
    expect(variables['--font-body']).toBe('"Custom Body"')
  })

  it('supports legacy color overrides', () => {
    const variables = generateSemanticTokenVariables({ primary: 'emerald' })
    expect(variables['--color-primary-500']).toBe('var(--color-emerald-500)')
  })
})
