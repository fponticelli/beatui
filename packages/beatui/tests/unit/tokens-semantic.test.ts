import { describe, it, expect } from 'vitest'
import { generateSemanticTokenVariables } from '../../src/tokens'

describe('generateSemanticTokenVariables', () => {
  it('includes default semantic font aliases', () => {
    const variables = generateSemanticTokenVariables()
    expect(variables['--font-heading']).toBe('var(--font-family-sans)')
    expect(variables['--font-body']).toBe('var(--font-family-sans)')
    expect(variables['--font-mono']).toBe('var(--font-family-mono)')
    expect(variables['--font-prose']).toBe('var(--font-family-serif)')
    expect(variables['--default-font-family']).toBe('var(--font-body)')
    expect(variables['--default-mono-font-family']).toBe('var(--font-mono)')
    expect(variables['--default-heading-font-family']).toBe('var(--font-heading)')
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

  it('includes default semantic radius aliases', () => {
    const variables = generateSemanticTokenVariables()
    expect(variables['--radius-control']).toBe('var(--radius-md)')
    expect(variables['--radius-surface']).toBe('var(--radius-lg)')
    expect(variables['--radius-button']).toBe('var(--radius-md)')
    expect(variables['--radius-popover']).toBe('var(--radius-md)')
    expect(variables['--radius-pill']).toBe('var(--radius-full)')
    expect(variables['--radius-focus']).toBe('var(--radius-sm)')
  })

  it('allows overriding radius aliases', () => {
    const variables = generateSemanticTokenVariables({
      radii: {
        control: '12px',
        surface: 'var(--radius-xl)',
      },
    })

    expect(variables['--radius-control']).toBe('12px')
    expect(variables['--radius-surface']).toBe('var(--radius-xl)')
  })
})
