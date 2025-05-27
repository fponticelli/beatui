import {
  attr,
  BrowserContext,
  dataAttr,
  Fragment,
  html,
  OnDispose,
  render,
  TNode,
  Use,
  WithBrowserCtx,
} from '@tempots/dom'
import { OverlayEffect } from '../theme/types'
import { ThemeProvider } from '../theme'
import { CSSFadeTransition } from '../animation/fade-transition'

export type OverlayOptions =
  | {
      effect?: OverlayEffect
      mode: 'capturing'
      onClickOutside?: () => void
      onEscape?: () => void
    }
  | {
      effect?: OverlayEffect
      mode: 'non-capturing'
    }

export function makeOverlay(ctx: BrowserContext) {
  return (
    { effect, ...rest }: OverlayOptions,
    fnNode: (close: () => void) => TNode
  ) => {
    const disposables: (() => void)[] = []
    const close = () => disposables.forEach(dispose => dispose())
    const makeContainer = () =>
      html.div(
        dataAttr.overlay('true'),
        Use(ThemeProvider, ({ theme }) =>
          attr.class(
            theme.overlay({
              effect: effect ?? 'visible',
              mode: rest.mode ?? 'capturing',
            })
          )
        ),
        CSSFadeTransition({ onExit: close }, (_, exit) => {
          const inertChildren = new Set<Element>()
          for (const el of ctx.element.querySelectorAll(
            ':scope > :not([data-overlay])'
          )) {
            if (el.hasAttribute('inert')) {
              inertChildren.add(el)
            } else {
              el.setAttribute('inert', '')
            }
          }
          disposables.push(() => {
            for (const el of ctx.element.querySelectorAll(
              ':scope > :not([data-overlay])'
            )) {
              if (!inertChildren.has(el)) {
                el.removeAttribute('inert')
              }
            }
            inertChildren.clear()
          })
          ;(document.activeElement as HTMLElement)?.blur?.()
          if (rest.mode === 'capturing') {
            const handleEscape = (event: KeyboardEvent) => {
              if (event.key === 'Escape') {
                rest.onEscape?.()
                exit()
              }
            }
            document.addEventListener('keydown', handleEscape)
            disposables.push(() =>
              document.removeEventListener('keydown', handleEscape)
            )
            const handler = () => {
              rest.onClickOutside?.()
              exit()
            }
            ctx.element.addEventListener('mousedown', handler)
            disposables.push(() =>
              ctx.element.removeEventListener('mousedown', handler)
            )
          }
          return fnNode(exit)
        })
      )

    const clear = render(makeContainer(), ctx.element, {
      disposeWithParent: true,
      clear: false,
      providers: ctx.providers,
    })
    disposables.push(clear)
    return close
  }
}

function BaseOverlay(
  getContext: (ctx: BrowserContext) => BrowserContext,
  options: OverlayOptions,
  fn: (open: (renderFn: (close: () => void) => TNode) => void) => TNode
): TNode {
  return WithBrowserCtx(ctx => {
    const parentCtx = getContext(ctx)
    const openOverlay = makeOverlay(parentCtx)
    let currentClose = () => {}
    const open = (renderFn: (close: () => void) => TNode) => {
      currentClose()
      currentClose = openOverlay(options, renderFn)
    }

    return Fragment(OnDispose(currentClose), fn(open))
  })
}

export function OverlayElement(
  options: OverlayOptions,
  fn: (open: (renderFn: (close: () => void) => TNode) => void) => TNode
): TNode {
  return BaseOverlay(ctx => ctx, options, fn)
}

export function OverlayBody(
  options: OverlayOptions,
  fn: (open: (renderFn: (close: () => void) => TNode) => void) => TNode
): TNode {
  return BaseOverlay(
    ctx => ctx.makePortal('body') as BrowserContext,
    options,
    fn
  )
}
