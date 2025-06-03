import { attr, html, TNode, Use } from '@tempots/dom'
import { Theme } from '../theme'

export const EmphasisLabel = (...children: TNode[]) =>
  Use(Theme, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'emphasis' })), ...children)
  )

export const Label = (...children: TNode[]) =>
  Use(Theme, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'default' })), ...children)
  )

export const MutedLabel = (...children: TNode[]) =>
  Use(Theme, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'muted' })), ...children)
  )

export const ErrorLabel = (...children: TNode[]) =>
  Use(Theme, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'error' })), ...children)
  )
