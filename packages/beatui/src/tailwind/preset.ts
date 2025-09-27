import { beatuiScreens, beatuiThemeExtensions } from './tokens'

export interface BeatUIPresetOptions {
  /**
   * Optional safelist entries appended to the preset defaults.
   */
  safelist?: (string | RegExp)[]
  /**
   * Wrapper selector used to trigger dark mode. Defaults to `.b-dark`.
   */
  darkWrapper?: string
}

export interface BeatUIPreset {
  darkMode: ['class', string]
  theme: {
    screens: Record<string, string>
    extend: typeof beatuiThemeExtensions
  }
  safelist: (string | RegExp)[]
}

const DEFAULT_SAFELIST: (string | RegExp)[] = []

export const beatuiPreset = (
  options: BeatUIPresetOptions = {}
): BeatUIPreset => {
  const darkWrapper = options.darkWrapper ?? '.b-dark'

  return {
    darkMode: ['class', darkWrapper],
    theme: {
      screens: beatuiScreens,
      extend: beatuiThemeExtensions,
    },
    safelist: [...DEFAULT_SAFELIST, ...(options.safelist ?? [])],
  }
}

export default beatuiPreset
