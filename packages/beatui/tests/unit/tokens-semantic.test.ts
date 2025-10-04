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
    expect(variables['--shadow-surface']).toBe('var(--shadow-sm)')
    expect(variables['--shadow-popover']).toBe('var(--shadow-lg)')
    expect(variables['--motion-transition-fast']).toBe(
      'var(--motion-duration-fast)'
    )
    expect(variables['--motion-easing-standard']).toBe(
      'var(--motion-easing-standard)'
    )
    expect(variables['--spacing-stack-sm']).toBe('calc(var(--spacing-base) * 2)')
    expect(variables['--text-shadow-button-filled']).toBe(
      'var(--text-shadow-sm)'
    )
    expect(variables['--text-shadow-button-light']).toBe(
      'var(--text-shadow-xs)'
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

  it('allows overriding shadow aliases', () => {
    const variables = generateSemanticTokenVariables({
      shadows: {
        surface: 'var(--shadow-lg)',
        overlay: '0 20px 50px rgba(0, 0, 0, 0.4)',
      },
    })

    expect(variables['--shadow-surface']).toBe('var(--shadow-lg)')
    expect(variables['--shadow-overlay']).toBe(
      '0 20px 50px rgba(0, 0, 0, 0.4)'
    )
  })

  it('allows overriding motion aliases', () => {
    const variables = generateSemanticTokenVariables({
      motion: {
        'transition-fast': '100ms',
        'easing-standard': 'linear',
      },
    })

    expect(variables['--motion-transition-fast']).toBe('100ms')
    expect(variables['--motion-easing-standard']).toBe('linear')
  })

  it('allows overriding spacing stack aliases', () => {
    const variables = generateSemanticTokenVariables({
      spacing: {
        'stack-sm': '1.5rem',
      },
    })

    expect(variables['--spacing-stack-sm']).toBe('1.5rem')
  })

  it('allows overriding text shadow aliases', () => {
    const variables = generateSemanticTokenVariables({
      textShadows: {
        'button-filled': '0 0 4px rgba(255, 255, 255, 0.6)',
      },
    })

    expect(variables['--text-shadow-button-filled']).toBe(
      '0 0 4px rgba(255, 255, 255, 0.6)'
    )
  })
})
