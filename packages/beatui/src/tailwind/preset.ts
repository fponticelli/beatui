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
import type { FontFamilyOverrides } from '../tokens/typography'

export interface BeatuiPresetOptions {
  /**
   * Override the semantic color mapping BeatUI uses (e.g. map `primary` to `emerald`).
   */
  semanticColors?: SemanticColorOverrides
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

  if (options.fontFamilies) {
    base[':root'] = {
      ...(base[':root'] ?? {}),
      ...generateFontFamilyOverrideVariables(options.fontFamilies),
    }
  }

  return base
}

interface TailwindPluginApi {
  addBase: (base: Record<string, Record<string, string>>) => void
  addVariant: (name: string, variant: string | string[]) => void
}

interface TailwindPreset {
  darkMode: string
  theme: {
    extend: Record<string, unknown>
  }
  plugins: TailwindPluginConfig[]
}

interface TailwindPluginConfig {
  handler: (api: TailwindPluginApi) => void
  config?: Record<string, unknown>
}

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

export const beatuiPreset = createBeatuiPreset()

export type { SemanticColorOverrides as BeatuiSemanticColorOverrides }
