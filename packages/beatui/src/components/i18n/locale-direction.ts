import { attr, Portal, Use } from '@tempots/dom'
import { Locale } from './locale'

/**
 * Component that applies the current text direction class to the document body.
 *
 * Reads the `direction` signal from the `Locale` provider and applies a CSS class
 * of the form `b-ltr` or `b-rtl` to the `<body>` element via a Portal. This enables
 * CSS rules to respond to text direction changes throughout the application.
 *
 * Must be used within a `Provide(Locale, ...)` context.
 *
 * @returns A renderable TNode that manages the body direction class
 *
 * @example
 * ```typescript
 * import { Provide } from '@tempots/dom'
 * import { Locale, LocaleDirection } from '@tempots/beatui'
 *
 * // Include in your app root to enable automatic direction management
 * Provide(Locale, {}, () => Fragment(
 *   LocaleDirection(),
 *   // ... rest of app
 * ))
 * ```
 */
export const LocaleDirection = () =>
  Use(Locale, ({ direction }) =>
    Portal('body', attr.class(direction.map(dir => `b-${dir}`)))
  )
