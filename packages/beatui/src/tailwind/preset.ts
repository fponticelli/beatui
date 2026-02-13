/**
 * BeatUI Tailwind CSS preset.
 *
 * Generates a Tailwind preset that registers BeatUI's design-token CSS
 * custom properties (colors, spacing, typography, motion, etc.) as base
 * styles and extends Tailwind's color palette with semantic aliases.
 *
 * @module
 */

import {
  generateCoreTokenVariables,
  generateSemanticTokenVariables,
  generateFontFamilyOverrideVariables,
} from '../tokens'
import {
  colorShades,
  semanticColorNames,
  type SemanticColorOverrides,
} from '../tokens/colors'
import type {
  FontFamilyOverrides,
  SemanticFontOverrides,
} from '../tokens/typography'
import type { SemanticRadiusOverrides } from '../tokens/radius'
import type { SemanticShadowOverrides } from '../tokens/shadows'
import type { SemanticMotionOverrides } from '../tokens/motion'
import type { SemanticSpacingOverrides } from '../tokens/spacing'
import type { SemanticTextShadowOverrides } from '../tokens/text-shadows'

/**
 * Options for customising the BeatUI Tailwind preset.
 *
 * Allows overriding semantic design tokens (colors, fonts, radii, shadows,
 * motion, spacing, text-shadows) and controlling which token layers are
 * included.
 *
 * @example
 * ```ts
 * const preset = createBeatuiPreset({
 *   semanticColors: { primary: 'emerald' },
 *   extendTheme: true,
 * })
 * ```
 */
export interface BeatuiPresetOptions {
  /**
   * Override the semantic color mapping BeatUI uses (e.g. map `primary` to `emerald`).
   */
  semanticColors?: SemanticColorOverrides
  /**
   * Override semantic font aliases (e.g. map `heading` to `var(--font-family-serif)`).
   */
  semanticFonts?: SemanticFontOverrides
  /**
   * Override semantic radius aliases for controls, surfaces, etc.
   */
  semanticRadii?: SemanticRadiusOverrides
  /**
   * Override semantic shadow aliases (elevation levels for surfaces, overlays, etc.).
   */
  semanticShadows?: SemanticShadowOverrides
  /**
   * Override semantic motion tokens (transition durations/easing).
   */
  semanticMotion?: SemanticMotionOverrides
  /**
   * Override spacing stack aliases for layout stacks.
   */
  semanticSpacing?: SemanticSpacingOverrides
  /**
   * Override semantic text shadow aliases (e.g. button emphasis shadows).
   */
  semanticTextShadows?: SemanticTextShadowOverrides
  /**
   * Override the default font family tokens (e.g. set `sans` to a custom stack).
   */
  fontFamilies?: FontFamilyOverrides
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

/**
 * Builds a Tailwind color theme object mapping each semantic color name to
 * its CSS variable shades (e.g. `primary.500` -> `var(--color-primary-500)`).
 *
 * @returns An object suitable for `theme.extend.colors`.
 */
function buildSemanticColorTheme() {
  return Object.fromEntries(
    semanticColorNames.map(semanticName => [
      semanticName,
      Object.fromEntries(
        colorShades.map(shade => [
          shade,
          `var(--color-${semanticName}-${shade})`,
        ])
      ),
    ])
  )
}

/**
 * Builds the `:root` CSS variable declarations for BeatUI's core and
 * semantic tokens, including any user-provided overrides.
 *
 * @param options - Preset options controlling which tokens to generate.
 * @returns An object mapping CSS selectors to variable declarations.
 */
function buildBaseDeclarations(options: BeatuiPresetOptions) {
  const { includeCoreTokens = true, includeSemanticTokens = true } = options
  const base: Record<string, Record<string, string>> = {}

  if (includeCoreTokens) {
    base[':root'] = {
      ...generateCoreTokenVariables(),
    }
  }

  if (includeSemanticTokens) {
    base[':root'] = {
      ...(base[':root'] ?? {}),
      ...generateSemanticTokenVariables({
        colors: options.semanticColors,
        fonts: options.semanticFonts,
        radii: options.semanticRadii,
        shadows: options.semanticShadows,
        motion: options.semanticMotion,
        spacing: options.semanticSpacing,
        textShadows: options.semanticTextShadows,
      }),
    }
  }

  if (options.fontFamilies) {
    base[':root'] = {
      ...(base[':root'] ?? {}),
      ...generateFontFamilyOverrideVariables(options.fontFamilies),
    }
  }

  return base
}

/**
 * Subset of the Tailwind plugin API used by the BeatUI preset to register
 * base styles and custom variants.
 */
interface TailwindPluginApi {
  /** Register base CSS declarations (injected into `@layer base`). */
  addBase: (base: Record<string, Record<string, string>>) => void
  /** Register a custom variant selector (e.g. `beatui-dark`). */
  addVariant: (name: string, variant: string | string[]) => void
}

/**
 * Shape of a Tailwind CSS preset object returned by {@link createBeatuiPreset}.
 */
interface TailwindPreset {
  /** Dark mode strategy (always `'class'` for BeatUI). */
  darkMode: string
  /** Theme extensions (semantic color aliases). */
  theme: {
    extend: Record<string, unknown>
  }
  /** Array of Tailwind plugins registered by this preset. */
  plugins: TailwindPluginConfig[]
}

/**
 * Configuration shape for a single Tailwind plugin (handler + optional config).
 */
interface TailwindPluginConfig {
  /** The plugin handler function that receives the Tailwind plugin API. */
  handler: (api: TailwindPluginApi) => void
  /** Optional static configuration merged into Tailwind's config. */
  config?: Record<string, unknown>
}

/**
 * Minimal factory type that emulates `tailwindcss/plugin` for creating
 * plugin configs without importing the full Tailwind package at build time.
 */
type TailwindPluginFactory = {
  (
    handler: TailwindPluginConfig['handler'],
    config?: TailwindPluginConfig['config']
  ): TailwindPluginConfig
  withOptions<T>(
    pluginFunction: (options?: T) => TailwindPluginConfig['handler'],
    configFunction?: (options?: T) => TailwindPluginConfig['config']
  ): (options?: T) => TailwindPluginConfig
}

const tailwindPluginFactory: TailwindPluginFactory = Object.assign(
  (
    handler: TailwindPluginConfig['handler'],
    config?: TailwindPluginConfig['config']
  ) => ({
    handler,
    config,
  }),
  {
    withOptions<T>(
      pluginFunction: (options?: T) => TailwindPluginConfig['handler'],
      configFunction: (
        options?: T
      ) => TailwindPluginConfig['config'] = () => ({})
    ) {
      const pluginWithOptions = (options?: T) => ({
        handler: pluginFunction(options),
        config: configFunction(options),
      })
      ;(
        pluginWithOptions as { __isOptionsFunction?: boolean }
      ).__isOptionsFunction = true
      return pluginWithOptions
    },
  }
)

/**
 * Creates a Tailwind CSS preset configured with BeatUI's design tokens.
 *
 * The returned preset:
 * - Sets `darkMode: 'class'` so BeatUI's theme provider can toggle themes.
 * - Registers core and semantic CSS custom properties as base styles.
 * - Extends Tailwind's color palette with semantic aliases (e.g. `bg-primary-500`).
 * - Adds convenience variants: `beatui-dark`, `beatui-light`, `beatui-rtl`, `beatui-ltr`.
 *
 * @param options - Optional overrides for semantic tokens and feature flags.
 * @returns A Tailwind preset object to include in `tailwind.config.ts`.
 *
 * @example
 * ```ts
 * // tailwind.config.ts
 * import { createBeatuiPreset } from '@tempots/beatui/tailwind'
 *
 * export default {
 *   presets: [createBeatuiPreset({ semanticColors: { primary: 'emerald' } })],
 *   content: ['./src/** /*.tsx'],
 * }
 * ```
 */
export function createBeatuiPreset(
  options: BeatuiPresetOptions = {}
): TailwindPreset {
  const baseDeclarations = buildBaseDeclarations(options)
  const extendTheme = options.extendTheme ?? true

  const preset: TailwindPreset = {
    darkMode: 'class',
    theme: {
      extend: extendTheme
        ? {
            colors: buildSemanticColorTheme(),
          }
        : {},
    },
    plugins: [
      tailwindPluginFactory(({ addBase }: TailwindPluginApi) => {
        if (Object.keys(baseDeclarations).length > 0) {
          addBase(baseDeclarations)
        }
      }),
      tailwindPluginFactory(({ addVariant }: TailwindPluginApi) => {
        // Convenience variants for BeatUI theme helpers
        addVariant('beatui-dark', '.b-dark &')
        addVariant('beatui-light', '.b-light &')
        addVariant('beatui-rtl', '.b-rtl &')
        addVariant('beatui-ltr', '.b-ltr &')
      }),
    ],
  }

  return preset
}

/**
 * A ready-to-use BeatUI Tailwind preset with all default options.
 *
 * @example
 * ```ts
 * // tailwind.config.ts
 * import { beatuiPreset } from '@tempots/beatui/tailwind'
 *
 * export default {
 *   presets: [beatuiPreset],
 *   content: ['./src/** /*.tsx'],
 * }
 * ```
 */
export const beatuiPreset = createBeatuiPreset()

/**
 * Re-exported type alias for semantic color override configuration.
 */
export type { SemanticColorOverrides as BeatuiSemanticColorOverrides }
