import {
  attr,
  html,
  TNode,
  Value,
  OnDispose,
  WithElement,
  prop,
  on,
  computedOf,
} from '@tempots/dom'
import { delayedAnimationFrame } from '@tempots/std'

export type ScrollablePanelOptions = {
  header?: TNode
  footer?: TNode
  body: TNode
  shadowOnScroll?: Value<boolean>
}

export function ScrollablePanel({
  header,
  footer,
  body,
  shadowOnScroll = true,
}: ScrollablePanelOptions) {
  const scrollShadow = prop<'both' | 'top' | 'bottom' | 'none'>('none')

  function updateShadow(target: HTMLElement) {
    const isAtTop = target.scrollTop === 0
    const isAtBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 1
    if (isAtTop && isAtBottom) {
      scrollShadow.set('none')
    } else if (isAtTop) {
      scrollShadow.set('bottom')
    } else if (isAtBottom) {
      scrollShadow.set('top')
    } else {
      scrollShadow.set('both')
    }
  }

  const panelElement = html.div(
    attr.class('bc-scrollable-panel'),
    attr.class(
      computedOf(
        scrollShadow,
        shadowOnScroll
      )((scrollShadow, shadowOnScroll): string => {
        if (!shadowOnScroll) return ''
        switch (scrollShadow) {
          case 'both':
            return 'bc-scrollable-panel--scrolled-up bc-scrollable-panel--scrolled-down'
          case 'bottom':
            return 'bc-scrollable-panel--scrolled-up'
          case 'top':
            return 'bc-scrollable-panel--scrolled-down'
          default:
            return ''
        }
      })
    ),
    header && html.div(attr.class('bc-scrollable-panel__header'), header),
    html.div(attr.class('bc-scrollable-panel--header-shadow'), html.div()),
    html.div(
      attr.class('bc-scrollable-panel__body'),
      WithElement(el =>
        OnDispose(delayedAnimationFrame(() => updateShadow(el)))
      ),
      on.scroll(event => {
        const target = event.target as HTMLElement
        updateShadow(target)
      }),
      body
    ),
    html.div(attr.class('bc-scrollable-panel--footer-shadow'), html.div()),
    footer && html.div(attr.class('bc-scrollable-panel__footer'), footer)
  )

  return panelElement
}
