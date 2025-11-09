// Auth Divider Component
// Simple divider component for separating social login from email/password forms

import { attr, coalesce, html, Renderable, Use, Value } from '@tempots/dom'
import { AuthI18n } from '../../auth-i18n/translations'

export interface AuthDividerOptions {
  labels?: { text?: () => string }
  className?: Value<string>
}

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
