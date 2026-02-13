import { Portal, Renderable, Value, attr, html } from '@tempots/dom'

/**
 * Configuration options for the {@link StylePortal} component.
 */
export type StylePortalOptions = {
  /**
   * Optional `id` attribute for the injected `<style>` element, useful for
   * deduplication or later removal.
   */
  id?: Value<string>
  /**
   * The CSS content to inject. Supports reactive values so styles update
   * dynamically when the value changes.
   */
  css: Value<string>
}

/**
 * Injects a `<style>` tag with the provided CSS into `<head>` via a Portal.
 * Ensures declarative, SSR/SSG-friendly styling without imperative DOM APIs.
 * When the `css` value is reactive, the style content updates automatically.
 *
 * @param options - Configuration for the style element.
 * @returns A renderable that portals a `<style>` element into `<head>`.
 *
 * @example
 * ```typescript
 * // Inject static CSS
 * StylePortal({
 *   id: 'custom-theme',
 *   css: ':root { --accent: #3b82f6; }',
 * })
 *
 * // Inject reactive CSS that updates with a signal
 * const accentColor = prop('#3b82f6')
 * StylePortal({
 *   css: accentColor.map(color => `:root { --accent: ${color}; }`),
 * })
 * ```
 */
export const StylePortal = ({ id, css }: StylePortalOptions): Renderable =>
  Portal('head', html.style(attr.id(id), attr.innerHTML(css)))
