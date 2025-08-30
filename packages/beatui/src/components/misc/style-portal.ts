import { Portal, TNode, Value, attr, html } from '@tempots/dom'

export type StylePortalOptions = {
  id?: Value<string>
  css: Value<string>
}

/**
 * Injects a <style> tag with the provided CSS into <head> via Portal.
 * Ensures declarative, SSR/SSG-friendly styling without imperative DOM APIs.
 */
export const StylePortal = ({ id, css }: StylePortalOptions): TNode =>
  Portal('head', html.style(attr.id(id), attr.innerHTML(css)))
