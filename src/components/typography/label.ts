import { attr, html, TNode, Use } from '@tempots/dom'
import { ThemeProvider } from '../theme'

export const EmphasisLabel = (...children: TNode[]) =>
  Use(ThemeProvider, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'emphasis' })), ...children)
  )

export const Label = (...children: TNode[]) =>
  Use(ThemeProvider, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'default' })), ...children)
  )

export const MutedLabel = (...children: TNode[]) =>
  Use(ThemeProvider, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'muted' })), ...children)
  )

export const ErrorLabel = (...children: TNode[]) =>
  Use(ThemeProvider, ({ theme }) =>
    html.span(attr.class(theme.label({ type: 'error' })), ...children)
  )
