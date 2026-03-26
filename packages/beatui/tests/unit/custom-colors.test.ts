import { describe, it, expect } from 'vitest'
import {
  generateCoreColorVariables,
  generateSemanticColorVariables,
  type ColorShadeMap,
} from '../../src/tokens/colors'
import {
  generateCoreTokenVariables,
  generateSemanticTokenVariables,
} from '../../src/tokens'

const rustPalette: ColorShadeMap = {
  50: 'oklch(0.97 0.02 50)',
  100: 'oklch(0.93 0.04 48)',
  200: 'oklch(0.87 0.07 46)',
  300: 'oklch(0.78 0.12 44)',
  400: 'oklch(0.68 0.17 42)',
  500: 'oklch(0.58 0.20 40)',
  600: 'oklch(0.50 0.18 38)',
  700: 'oklch(0.42 0.15 36)',
  800: 'oklch(0.35 0.12 34)',
  900: 'oklch(0.28 0.09 32)',
  950: 'oklch(0.22 0.07 30)',
}

const oceanPalette: ColorShadeMap = {
  50: 'oklch(0.97 0.02 220)',
  100: 'oklch(0.93 0.04 222)',
  200: 'oklch(0.87 0.07 224)',
  300: 'oklch(0.78 0.12 226)',
  400: 'oklch(0.68 0.17 228)',
  500: 'oklch(0.58 0.20 230)',
  600: 'oklch(0.50 0.18 232)',
  700: 'oklch(0.42 0.15 234)',
  800: 'oklch(0.35 0.12 236)',
  900: 'oklch(0.28 0.09 238)',
  950: 'oklch(0.22 0.07 240)',
}

describe('custom colors', () => {
  describe('generateCoreColorVariables', () => {
    it('generates variables for custom color palettes', () => {
      const vars = generateCoreColorVariables({ rust: rustPalette })
      expect(vars['--color-rust-500']).toBe('oklch(0.58 0.20 40)')
      expect(vars['--color-rust-50']).toBe('oklch(0.97 0.02 50)')
      expect(vars['--color-rust-950']).toBe('oklch(0.22 0.07 30)')
    })

    it('generates variables for multiple custom palettes', () => {
      const vars = generateCoreColorVariables({
        rust: rustPalette,
        ocean: oceanPalette,
      })
      expect(vars['--color-rust-500']).toBe('oklch(0.58 0.20 40)')
      expect(vars['--color-ocean-500']).toBe('oklch(0.58 0.20 230)')
    })

    it('includes built-in colors alongside custom colors', () => {
      const vars = generateCoreColorVariables({ rust: rustPalette })
      // Built-in blue should still exist
      expect(vars['--color-blue-500']).toBeDefined()
      expect(vars['--color-white']).toBe('white')
      expect(vars['--color-black']).toBe('black')
    })

    it('returns only built-in colors when no custom colors provided', () => {
      const vars = generateCoreColorVariables()
      expect(vars['--color-rust-500']).toBeUndefined()
      expect(vars['--color-blue-500']).toBeDefined()
    })
  })

  describe('generateSemanticColorVariables', () => {
    it('resolves semantic colors to custom palette names', () => {
      const vars = generateSemanticColorVariables({ primary: 'rust' })
      expect(vars['--color-primary-500']).toBe('var(--color-rust-500)')
      expect(vars['--color-primary-100']).toBe('var(--color-rust-100)')
      expect(vars['--color-primary-950']).toBe('var(--color-rust-950)')
    })

    it('can map multiple semantic roles to custom palettes', () => {
      const vars = generateSemanticColorVariables({
        primary: 'rust',
        danger: 'ocean',
      })
      expect(vars['--color-primary-500']).toBe('var(--color-rust-500)')
      expect(vars['--color-danger-500']).toBe('var(--color-ocean-500)')
      // Unoverridden roles keep defaults
      expect(vars['--color-success-500']).toBe('var(--color-green-500)')
    })

    it('mixes built-in and custom colors in overrides', () => {
      const vars = generateSemanticColorVariables({
        primary: 'rust',
        secondary: 'indigo',
      })
      expect(vars['--color-primary-500']).toBe('var(--color-rust-500)')
      expect(vars['--color-secondary-500']).toBe('var(--color-indigo-500)')
    })
  })

  describe('generateCoreTokenVariables', () => {
    it('threads custom colors through the full token pipeline', () => {
      const vars = generateCoreTokenVariables({ rust: rustPalette })
      expect(vars['--color-rust-500']).toBe('oklch(0.58 0.20 40)')
      // Other token types still present
      expect(vars['--spacing-base']).toBeDefined()
    })
  })

  describe('generateSemanticTokenVariables with structured options', () => {
    it('accepts custom color names in semantic color overrides', () => {
      const vars = generateSemanticTokenVariables({
        colors: { primary: 'rust' },
      })
      expect(vars['--color-primary-500']).toBe('var(--color-rust-500)')
      // Other semantic tokens still present
      expect(vars['--font-heading']).toBe('var(--font-family-sans)')
    })
  })
})
