import { attr, html, TNode, Value } from '@tempots/dom'

/**
 * Size variants for the keyboard key component.
 *
 * - `'xs'` - Extra small (12px)
 * - `'sm'` - Small (14px, default)
 * - `'md'` - Medium (16px)
 */
export type KbdSize = 'xs' | 'sm' | 'md'

/**
 * Configuration options for the {@link Kbd} component.
 */
export interface KbdOptions {
  /** Size of the keyboard key element. @default 'sm' */
  size?: Value<KbdSize>
}

/**
 * Generates CSS class names for the keyboard key based on size.
 *
 * @param size - The size variant
 * @returns Space-separated CSS class string
 */
function generateKbdClasses(size: KbdSize): string {
  return `bc-kbd bc-kbd--size-${size}`
}

/**
 * A styled keyboard key indicator component for displaying keyboard shortcuts.
 * Renders keys with a 3D pressed appearance using monospace font.
 *
 * @param options - Configuration for size
 * @param children - Key text content (e.g., "Ctrl", "⌘", "K")
 * @returns A styled `<kbd>` element
 *
 * @example
 * ```typescript
 * // Single key
 * Kbd({ size: 'sm' }, 'K')
 * ```
 *
 * @example
 * ```typescript
 * // Keyboard shortcut combination
 * html.span(
 *   Kbd({}, '⌘'),
 *   ' + ',
 *   Kbd({}, 'K')
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Different sizes
 * Kbd({ size: 'xs' }, 'Esc')
 * Kbd({ size: 'md' }, 'Enter')
 * ```
 */
export function Kbd({ size = 'sm' }: KbdOptions = {}, ...children: TNode[]) {
  return html.kbd(
    attr.class(Value.map(size, s => generateKbdClasses(s ?? 'sm'))),
    ...children
  )
}
