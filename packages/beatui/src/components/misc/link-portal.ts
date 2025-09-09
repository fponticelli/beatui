import { Portal, Renderable, Value, attr, html } from '@tempots/dom'

export type LinkPortalOptions = {
  id?: Value<string>
  href: Value<string>
  rel?: Value<string>
}

/**
 * Injects a <link rel="stylesheet"> tag with the provided href into <head> via Portal.
 * Keeps styling SSR/SSG-friendly while leveraging browser caching of CSS assets.
 */
export const LinkPortal = ({
  id,
  href,
  rel = 'stylesheet',
}: LinkPortalOptions): Renderable =>
  Portal('head', html.link(attr.id(id), attr.rel(rel), attr.href(href)))
