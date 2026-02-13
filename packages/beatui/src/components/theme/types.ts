import { BackgroundColorName, ThemeColorName } from '../../tokens'
import { Signal } from '@tempots/dom'
import { AppearanceType } from '@tempots/ui'

/**
 * Visual style variant for button components.
 * - `'filled'`: Solid background with theme color
 * - `'light'`: Light background with colored text
 * - `'outline'`: Transparent background with colored border
 * - `'default'`: Default subtle styling
 * - `'text'`: No background, text-only styling
 */
export type ButtonVariant =
  | 'filled'
  | 'light'
  | 'outline'
  | 'dashed'
  | 'default'
  | 'text'

/**
 * Size options for form controls and interactive elements.
 * Ranges from `'xs'` (extra small) to `'xl'` (extra large).
 */
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Size options for icon elements.
 * Ranges from `'xs'` (extra small) to `'xl'` (extra large).
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Internal array of size values in ascending order. */
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/**
 * Increases or decreases a size value by a specified number of steps.
 * Automatically clamps the result to valid size boundaries.
 *
 * @param size - The current size value
 * @param steps - Number of steps to increase (positive) or decrease (negative). Default is 1.
 * @returns The new size value after adjustment
 * @throws {Error} If the provided size is invalid
 *
 * @example
 * ```ts
 * increaseSize('sm', 1)  // Returns 'md'
 * increaseSize('xl', 2)  // Returns 'xl' (clamped)
 * increaseSize('lg', -2) // Returns 'sm'
 * ```
 */
export function increaseSize(size: IconSize | ControlSize, steps = 1) {
  const index = sizes.indexOf(size)
  if (index === -1) {
    throw new Error(`Invalid size: ${size}`)
  }
  const newIndex = Math.min(Math.max(index + steps, 0), sizes.length - 1)
  return sizes[newIndex]
}

/**
 * Visual effect for overlay backgrounds.
 * - `'transparent'`: Semi-transparent background (e.g., modal backdrop)
 * - `'opaque'`: Fully opaque background
 * - `'none'`: No visual overlay effect
 */
export type OverlayEffect = 'transparent' | 'opaque' | 'none'

/**
 * Interaction mode for overlay elements.
 * - `'capturing'`: Captures clicks and prevents interaction with underlying content
 * - `'non-capturing'`: Allows click-through to underlying content
 */
export type OverlayMode = 'capturing' | 'non-capturing'

/**
 * State of a fade transition animation.
 * - `'initial'`: Before animation begins
 * - `'entering'`: Fade-in animation in progress
 * - `'entered'`: Fade-in complete, element fully visible
 * - `'exiting'`: Fade-out animation in progress
 * - `'exited'`: Fade-out complete, element hidden
 */
export type FadeTransitionState =
  | 'initial'
  | 'entering'
  | 'entered'
  | 'exiting'
  | 'exited'

/**
 * Specification for which sides of a box to apply styling (e.g., borders, padding).
 * - `'left' | 'right' | 'top' | 'bottom'`: Single side
 * - `'none'`: No sides
 * - `'all'`: All four sides
 * - Array of sides: Multiple specific sides
 */
export type Side =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'none'
  | 'all'
  | ('left' | 'right' | 'top' | 'bottom')[]

/**
 * Color options for panel components.
 * Includes background color names, theme colors, and special values like `'white'`, `'black'`, and `'transparent'`.
 */
export type PanelColor =
  | BackgroundColorName
  | ThemeColorName
  | 'white'
  | 'black'
  | 'transparent'

/**
 * Shadow intensity for panel components.
 * Ranges from `'none'` (no shadow) to `'lg'` (large shadow).
 */
export type PanelShadow = 'none' | 'sm' | 'md' | 'lg'

/**
 * Semantic type for label text styling.
 * - `'emphasis'`: High-contrast, emphasized text
 * - `'default'`: Standard text appearance
 * - `'muted'`: Low-contrast, de-emphasized text
 * - `'danger'`: Error or warning styling
 */
export type LabelType = 'emphasis' | 'default' | 'muted' | 'danger'

/**
 * CSS `justify-content` property values for flexbox layouts.
 * Controls alignment of flex items along the main axis.
 */
export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'safe flex-end'
  | 'center'
  | 'safe center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'baseline'
  | 'normal'

/**
 * CSS `justify-items` property values for grid layouts.
 * Controls alignment of grid items along the inline (row) axis.
 */
export type JustifyItems =
  | 'start'
  | 'end'
  | 'safe end'
  | 'center'
  | 'safe center'
  | 'stretch'
  | 'normal'

/**
 * CSS `justify-self` property values for individual grid/flex items.
 * Controls alignment of a single item along the inline (row) axis.
 */
export type JustifySelf =
  | 'auto'
  | 'start'
  | 'center'
  | 'safe center'
  | 'end'
  | 'safe end'
  | 'stretch'

/**
 * CSS `align-content` property values for multi-line flex containers.
 * Controls alignment of flex lines along the cross axis.
 */
export type AlignContent =
  | 'normal'
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'baseline'
  | 'stretch'

/**
 * CSS `align-items` property values for flexbox layouts.
 * Controls alignment of flex items along the cross axis.
 */
export type AlignItems =
  | 'flex-start'
  | 'flex-end'
  | 'safe flex-end'
  | 'center'
  | 'safe-center'
  | 'baseline'
  | 'last-baseline'
  | 'stretch'

/**
 * CSS `align-self` property values for individual flex/grid items.
 * Controls alignment of a single item along the cross axis.
 */
export type AlignSelf =
  | 'auto'
  | 'flex-start'
  | 'flex-end'
  | 'safe flex-end'
  | 'center'
  | 'safe center'
  | 'stretch'
  | 'baseline'
  | 'last baseline'

/**
 * Visual style variant for card components.
 * - `'default'`: Standard card appearance
 * - `'elevated'`: Card with shadow elevation
 * - `'flat'`: Minimal card with no shadow
 * - `'outlined'`: Card with border outline
 */
export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined'

/**
 * Gap spacing size for centered layouts.
 * Ranges from `'none'` (no gap) to `'xl'` (extra large gap).
 */
export type CenterGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Visual depth variant for sink/inset components.
 * - `'default'`: Standard inset depth
 * - `'deep'`: Stronger inset effect
 * - `'shallow'`: Subtle inset effect
 * - `'flat'`: Minimal or no inset effect
 */
export type SinkVariant = 'default' | 'deep' | 'shallow' | 'flat'

/**
 * User's appearance preference setting.
 * - `'light'`: Light theme
 * - `'dark'`: Dark theme
 * - `'system'`: Follow system preference
 */
export type AppearancePreference = 'light' | 'dark' | 'system'

/**
 * Resolved appearance mode (excludes system option).
 * Either `'light'` or `'dark'`.
 */
export type Appearance = 'light' | 'dark'

/**
 * Theme context value provided by the Theme provider.
 * Contains reactive signals for appearance state and a setter for user preferences.
 */
export interface ThemeValue {
  /** Function to update the user's appearance preference. */
  setAppearancePreference: (appearance: AppearancePreference) => void
  /** Signal representing the user's selected appearance preference (including 'system'). */
  appearancePreference: Signal<AppearancePreference>
  /** Signal representing the resolved appearance mode ('light' or 'dark'). */
  appearance: Signal<AppearanceType>
}
