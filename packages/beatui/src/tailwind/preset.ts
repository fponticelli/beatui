import plugin from 'tailwindcss/plugin'
import type { Config } from 'tailwindcss'

import {
  generateCoreTokenVariables,
  generateSemanticTokenVariables,
} from '../tokens'
import {
  colorShades,
  semanticColorNames,
  type SemanticColorOverrides,
} from '../tokens/colors'

export interface BeatuiPresetOptions {
  /**
   * Override the semantic color mapping BeatUI uses (e.g. map `primary` to `emerald`).
   */
  semanticColors?: SemanticColorOverrides
  /**
   * When false, skip registering core token variables (spacing, typography, etc.).
   */
  includeCoreTokens?: boolean
  /**
   * When false, skip registering semantic token aliases.
   */
  includeSemanticTokens?: boolean
  /**
   * Extend Tailwind's theme with BeatUI semantic color aliases.
   */
  extendTheme?: boolean
}

function buildSemanticColorTheme() {
  return Object.fromEntries(
    semanticColorNames.map(semanticName => [
      semanticName,
      Object.fromEntries(
        colorShades.map(shade => [shade, `var(--color-${semanticName}-${shade})`])
      ),
    ])
  )
}

function buildBaseDeclarations(options: BeatuiPresetOptions) {
  const { includeCoreTokens = true, includeSemanticTokens = true } = options
  const semanticOverrides = options.semanticColors

  const base: Record<string, Record<string, string>> = {}

  if (includeCoreTokens) {
    base[':root'] = {
      ...generateCoreTokenVariables(),
    }
  }

  if (includeSemanticTokens) {
    base[':root'] = {
      ...(base[':root'] ?? {}),
      ...generateSemanticTokenVariables(semanticOverrides),
    }
  }

  return base
}

export function createBeatuiPreset(
  options: BeatuiPresetOptions = {}
): Config {
  const baseDeclarations = buildBaseDeclarations(options)
  const extendTheme = options.extendTheme ?? true

  return {
    darkMode: 'class',
    theme: {
      extend: extendTheme
        ? {
            colors: buildSemanticColorTheme(),
          }
        : {},
    },
    plugins: [
      plugin(({ addBase }) => {
        if (Object.keys(baseDeclarations).length > 0) {
          addBase(baseDeclarations)
        }
      }),
      plugin(({ addVariant }) => {
        // Convenience variants for BeatUI theme helpers
        addVariant('beatui-dark', '.b-dark &')
        addVariant('beatui-light', '.b-light &')
        addVariant('beatui-rtl', '.b-rtl &')
        addVariant('beatui-ltr', '.b-ltr &')
      }),
    ],
  } as Config
}

export const beatuiPreset = createBeatuiPreset()

export type { SemanticColorOverrides as BeatuiSemanticColorOverrides }
