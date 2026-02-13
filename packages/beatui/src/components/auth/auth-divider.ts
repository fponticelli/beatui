/**
 * Auth Divider Component
 *
 * A horizontal divider with centered text (typically "or") used to visually
 * separate social login buttons from the email/password form.
 *
 * @module auth/auth-divider
 */

import { attr, coalesce, html, Renderable, Use, Value } from '@tempots/dom'
import { AuthI18n } from '../../auth-i18n/translations'

/**
 * Options for the {@link AuthDivider} component.
 */
export interface AuthDividerOptions {
  /** Optional label overrides. */
  labels?: {
    /** Custom text to display in the divider (e.g., `'or'`). Falls back to i18n `orDivider`. */
    text?: () => string
  }
  /** Additional CSS class names to apply to the divider container. */
  className?: Value<string>
}

/**
 * Renders a horizontal divider line with centered text.
 *
 * Typically displays "or" (localized) between social login buttons and
 * the email/password form. The text can be customized via the `labels` option
 * or overridden by the active locale's `orDivider` translation.
 *
 * @param options - Configuration options for the divider.
 * @returns A `Renderable` DOM element representing the divider.
 *
 * @example
 * ```ts
 * AuthDivider()
 * AuthDivider({ labels: { text: () => 'or continue with email' } })
 * ```
 */
export function AuthDivider({
  labels,
  className,
}: AuthDividerOptions = {}): Renderable {
  return html.div(
    attr.class('bc-auth-divider'),
    attr.class(className),

    html.div(attr.class('bc-auth-divider__line')),

    Use(AuthI18n, t =>
      html.span(
        attr.class('bc-auth-divider__text'),
        coalesce(labels?.text, t.$.orDivider)
      )
    ),

    html.div(attr.class('bc-auth-divider__line'))
  )
}
