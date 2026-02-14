import { attr, html, TNode, Value } from '@tempots/dom'
import { ControlSize } from '../../theme'

/**
 * Configuration options for {@link InputAdornment}.
 */
export type InputAdornmentOptions = {
  /**
   * The size of the adornment, controlling padding and font size.
   * @default 'md'
   */
  size?: Value<ControlSize>
  /**
   * When true, applies a subtle background fill and stretches to full height.
   * @default false
   */
  filled?: Value<boolean>
}

/**
 * Renders a styled adornment for use in the `before` or `after` slots of {@link InputContainer}.
 *
 * Provides consistent padding, dimmed text color, and an optional background fill.
 * Useful for prefixes (e.g., "$", "https://"), suffixes (e.g., "kg", ".com"),
 * or any small decorative text around an input.
 *
 * @param options - Adornment configuration
 * @param children - Content to display inside the adornment
 * @returns A span element with adornment styling
 *
 * @example
 * ```ts
 * InputContainer({
 *   input: html.input(attr.type('text')),
 *   before: InputAdornment({ filled: true }, '$'),
 *   after: InputAdornment({}, '.00'),
 * })
 * ```
 */
export function InputAdornment(
  options: InputAdornmentOptions,
  ...children: TNode[]
) {
  const { size = 'md', filled = false } = options
  return html.span(
    attr.class('bc-input-adornment'),
    attr.class(Value.map(size, (s): string => `bc-input-adornment--size-${s}`)),
    attr.class(
      Value.map(filled, (f): string => (f ? 'bc-input-adornment--filled' : ''))
    ),
    ...children
  )
}
