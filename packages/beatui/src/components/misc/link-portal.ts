import { Portal, Renderable, Value, attr, html } from '@tempots/dom'

/**
 * Configuration options for the {@link LinkPortal} component.
 */
export type LinkPortalOptions = {
  /**
   * Optional `id` attribute for the injected `<link>` element, useful for
   * deduplication or later removal.
   */
  id?: Value<string>
  /**
   * The URL of the linked resource (e.g., a stylesheet URL).
   */
  href: Value<string>
  /**
   * The relationship type of the linked resource.
   * @default 'stylesheet'
   */
  rel?: Value<string>
}

/**
 * Injects a `<link>` tag into `<head>` via a Portal. By default, the `rel`
 * attribute is set to `"stylesheet"`, making this ideal for dynamically loading
 * CSS files. The portal approach keeps styling SSR/SSG-friendly while
 * leveraging browser caching of CSS assets.
 *
 * @param options - Configuration for the link element.
 * @returns A renderable that portals a `<link>` element into `<head>`.
 *
 * @example
 * ```typescript
 * // Load an external stylesheet
 * LinkPortal({ href: 'https://cdn.example.com/styles.css' })
 *
 * // Load a font with a custom id for deduplication
 * LinkPortal({
 *   id: 'google-fonts',
 *   href: 'https://fonts.googleapis.com/css2?family=Inter',
 *   rel: 'stylesheet',
 * })
 *
 * // Preconnect to a CDN
 * LinkPortal({
 *   href: 'https://cdn.example.com',
 *   rel: 'preconnect',
 * })
 * ```
 */
export const LinkPortal = ({
  id,
  href,
  rel = 'stylesheet',
}: LinkPortalOptions): Renderable =>
  Portal('head', html.link(attr.id(id), attr.rel(rel), attr.href(href)))
