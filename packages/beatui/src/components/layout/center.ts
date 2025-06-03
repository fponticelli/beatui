import { attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { CenterGap, Theme } from '../theme'

export interface CenterOptions {
  gap?: Value<CenterGap>
}

export function CenterH(...children: TNode[]) {
  return html.div(
    attr.class('bc-center-h'),
    html.div(attr.class('bc-center__content'), ...children)
  )
}

export function Center(
  { gap = 'lg' }: CenterOptions = {},
  ...children: TNode[]
) {
  return Use(Theme, theme => {
    return html.div(
      attr.class(
        computedOf(
          theme,
          gap
        )(({ theme }, gap) =>
          theme.center({
            gap,
          })
        )
      ),
      ...children
    )
  })
}
