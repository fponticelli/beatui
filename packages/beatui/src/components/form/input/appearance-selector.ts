import { AppearancePreference, Theme } from '../../theme'
import { attr, html, TNode, Use, Value } from '@tempots/dom'
import { Icon } from '../../data'
import { SegmentedInput } from './segmented-input'

/**
 * Options for the {@link AppearanceSelector} component.
 */
export type AppearanceSelectorOptions = {
  /** The current appearance preference value. */
  value: Value<AppearancePreference>
  /** Callback invoked when the user selects a different appearance. */
  onChange?: (value: AppearancePreference) => void
  /**
   * Whether the selector is disabled.
   * @default false
   */
  disabled?: Value<boolean>
}

/**
 * A segmented input for selecting the application appearance (light, dark, or system).
 *
 * Renders three icon segments for system (laptop), light (sun), and dark (moon) modes
 * using the {@link SegmentedInput} component.
 *
 * @param options - Configuration options for the appearance selector.
 * @returns A renderable segmented appearance selector component.
 *
 * @example
 * ```ts
 * AppearanceSelector({
 *   value: prop<AppearancePreference>('system'),
 *   onChange: pref => console.log('Appearance:', pref),
 * })
 * ```
 */
export function AppearanceSelector({
  value,
  onChange,
  disabled,
}: AppearanceSelectorOptions) {
  return SegmentedInput<Record<AppearancePreference, TNode>>({
    size: 'sm',
    value,
    disabled,
    options: {
      system: html.span(
        attr.title('System'),
        Icon({ icon: 'line-md:laptop', color: 'gray' })
      ),
      light: html.span(
        attr.title('Light'),
        Icon({ icon: 'line-md:sunny-twotone-loop', color: 'yellow' })
      ),
      dark: html.span(
        attr.title('Dark'),
        Icon({
          icon: 'line-md:sunny-outline-to-moon-alt-loop-transition',
          color: 'blue',
        })
      ),
    },
    onChange,
  })
}

/**
 * A standalone appearance selector that automatically connects to the application's
 * {@link Theme} provider. Reads and writes the appearance preference from the
 * current theme context without requiring manual wiring.
 *
 * @returns A renderable standalone appearance selector component.
 *
 * @example
 * ```ts
 * // Just drop it in -- no props needed
 * StandaloneAppearanceSelector()
 * ```
 */
export function StandaloneAppearanceSelector() {
  return Use(Theme, ({ appearancePreference, setAppearancePreference }) =>
    AppearanceSelector({
      value: appearancePreference,
      onChange: setAppearancePreference,
    })
  )
}
