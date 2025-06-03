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
  WithElement,
} from '@tempots/dom'
import { OverlayEffect } from '../theme/types'
import { Theme } from '../theme'
import { useAnimatedElementToggle } from '@/utils/use-animated-toggle'
import { delayed } from '@tempots/std'

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
    const status = useAnimatedElementToggle()
    status.onClosed(close)
    const makeContainer = () => {
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
            status.close()
          }
        }
        document.addEventListener('keydown', handleEscape)
        disposables.push(() =>
          document.removeEventListener('keydown', handleEscape)
        )
        const handler = () => {
          rest.onClickOutside?.()
          status.close()
        }
        ctx.element.addEventListener('mousedown', handler)
        disposables.push(() =>
          ctx.element.removeEventListener('mousedown', handler)
        )
      }
      return html.div(
        WithElement(el => status.setElement(el)),
        dataAttr.status(status.status.map(String)),
        // style.backgroundColor(
        //   status.displayOpen.map((v): string => (v ? '' : 'rgba(0, 0, 0, 0)'))
        // ),
        dataAttr.overlay('true'),
        Use(Theme, ({ theme }) =>
          attr.class(
            theme.overlay({
              effect: effect ?? 'visible',
              mode: rest.mode ?? 'capturing',
            })
          )
        ),
        fnNode(status.close)
      )
    }

    const clear = render(makeContainer(), ctx.element, {
      disposeWithParent: true,
      clear: false,
      providers: ctx.providers,
    })
    disposables.push(clear)
    delayed(() => status.open(), 0)
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
