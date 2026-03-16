import {
  attr,
  computedOf,
  html,
  OnDispose,
  prop,
  TNode,
  Value,
  When,
  WithElement,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { RadiusName } from '../../tokens/radius'

/**
 * HSL range constraint for a single component (hue, saturation, or lightness).
 */
export interface HSLRange {
  /** Minimum value (inclusive). */
  min: number
  /** Maximum value (inclusive). */
  max: number
}

/** Configuration options for the {@link AutoColorBadge} component. */
export interface AutoColorBadgeOptions {
  /** Size of the badge affecting padding and font. @default 'md' */
  size?: Value<ControlSize>
  /** Border radius of the badge. @default 'full' */
  roundedness?: Value<RadiusName>
  /**
   * Explicit text to use for color derivation instead of the DOM text content.
   * When provided, the MutationObserver is skipped and color is derived from
   * this value reactively. Useful when the displayed content differs from the
   * desired color key (e.g. icons, abbreviations, translated labels).
   */
  text?: Value<string>
  /** Hue range (0–360). @default { min: 0, max: 360 } */
  hue?: Value<HSLRange>
  /** Saturation range (0–100). @default { min: 50, max: 80 } */
  saturation?: Value<HSLRange>
  /** Lightness range (0–100). @default { min: 40, max: 65 } */
  lightness?: Value<HSLRange>
}

const DEFAULT_HUE: HSLRange = { min: 0, max: 360 }
const DEFAULT_SATURATION: HSLRange = { min: 50, max: 80 }
const DEFAULT_LIGHTNESS: HSLRange = { min: 40, max: 65 }

/**
 * Generates a stable 32-bit hash from a string using the djb2 algorithm.
 */
function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return hash >>> 0
}

/**
 * Maps a hash value to a number within [min, max] using a specific seed offset
 * to ensure independence between H, S, and L components.
 */
function hashToRange(
  hash: number,
  seed: number,
  min: number,
  max: number
): number {
  const mixed = ((hash * 2654435761 + seed * 2246822519) >>> 0) % 10000
  return min + (mixed / 10000) * (max - min)
}

/**
 * Returns `'#000'` or `'#fff'` depending on which provides better contrast
 * against the given HSL lightness value.
 */
function contrastTextColor(lightness: number): string {
  return lightness > 56 ? '#000' : '#fff'
}

/**
 * Computes the inline color style from text content and HSL ranges.
 */
function computeColorStyle(
  text: string,
  hue: HSLRange,
  saturation: HSLRange,
  lightness: HSLRange
): string {
  const trimmed = text.trim()
  if (trimmed === '') return ''
  const hash = hashString(trimmed)
  const h = hashToRange(hash, 1, hue.min, hue.max)
  const s = hashToRange(hash, 2, saturation.min, saturation.max)
  const l = hashToRange(hash, 3, lightness.min, lightness.max)
  const textColor = contrastTextColor(l)
  return `background-color: hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%); color: ${textColor}`
}

/**
 * Generates CSS class names for the auto-color badge.
 */
function generateAutoColorBadgeClasses(
  size: ControlSize,
  roundedness: RadiusName
): string {
  return [
    'bc-auto-color-badge',
    `bc-badge--size-${size}`,
    `bc-control--rounded-${roundedness}`,
  ].join(' ')
}

/**
 * A badge that automatically derives a stable background color from its text content.
 *
 * The text content is hashed to produce deterministic HSL values within configurable
 * ranges. The text color is automatically set to black or white for maximum contrast.
 *
 * By default, a `MutationObserver` watches the DOM for content changes. When the
 * `text` option is provided, the observer is skipped and the color is derived
 * directly from the signal — useful when the displayed content differs from the
 * desired color key.
 *
 * @param options - Configuration for size, roundedness, text override, and HSL ranges
 * @param children - Content to display (text content is used for color derivation unless `text` is set)
 * @returns A styled span element with auto-generated background color
 *
 * @example
 * ```typescript
 * // Color derived from DOM text content
 * AutoColorBadge({}, 'TypeScript')
 * ```
 *
 * @example
 * ```typescript
 * // Explicit text override — color from "admin" regardless of displayed content
 * AutoColorBadge({ text: 'admin' }, Icon({ icon: 'lucide:shield' }), 'Admin')
 * ```
 */
export function AutoColorBadge(
  options: AutoColorBadgeOptions = {},
  ...children: TNode[]
): TNode {
  const {
    size = 'md',
    roundedness = 'full',
    text,
    hue = DEFAULT_HUE,
    saturation = DEFAULT_SATURATION,
    lightness = DEFAULT_LIGHTNESS,
  } = options

  // When `text` is provided, use it directly as the color source.
  // Otherwise, create a prop that the MutationObserver will feed.
  const textSource = text != null ? text : prop('')

  const colorStyle = computedOf(
    textSource,
    hue,
    saturation,
    lightness
  )((t, h, s, l) =>
    computeColorStyle(
      t ?? '',
      h ?? DEFAULT_HUE,
      s ?? DEFAULT_SATURATION,
      l ?? DEFAULT_LIGHTNESS
    )
  )

  return html.span(
    attr.class(
      computedOf(
        size,
        roundedness
      )((s, r) => generateAutoColorBadgeClasses(s ?? 'md', r ?? 'full'))
    ),
    attr.style(colorStyle),
    html.span(attr.class('bc-badge__content'), ...children),
    // Only observe DOM mutations when no explicit text is provided
    When(
      Value.map(text as Value<string | undefined>, t => t == null),
      () =>
        WithElement(el => {
          const textProp = textSource as ReturnType<typeof prop<string>>
          textProp.set(el.textContent ?? '')

          const observer = new MutationObserver(() => {
            textProp.set(el.textContent ?? '')
          })
          observer.observe(el, {
            childList: true,
            subtree: true,
            characterData: true,
          })

          return OnDispose(() => observer.disconnect())
        })
    )
  )
}
