// Auth Divider Component
// Simple divider component for separating social login from email/password forms

import { attr, html, TNode, Value } from '@tempots/dom'
import { defaultAuthLabels } from './index'

export interface AuthDividerOptions {
  text?: Value<string>
  className?: Value<string>
}

export function AuthDivider({
  text,
  className,
}: AuthDividerOptions = {}): TNode {
  const labels = defaultAuthLabels
  const dividerText = text || labels.orDivider

  return html.div(
    attr.class('bc-auth-divider'),
    attr.class(className),

    html.div(attr.class('bc-auth-divider__line')),

    html.span(attr.class('bc-auth-divider__text'), dividerText),

    html.div(attr.class('bc-auth-divider__line'))
  )
}
