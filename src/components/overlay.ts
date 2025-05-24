import {
  attr,
  BrowserContext,
  Fragment,
  html,
  on,
  OnDispose,
  render,
  TNode,
  WithBrowserCtx,
} from '@tempots/dom'

export type OverlayMode = 'capturing' | 'non-capturing'
export type OverlayEffect = 'transparent' | 'visible'

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
    const container = html.div(
      attr.class(
        'absolute inset-0 flex items-center justify-center z-50 w-full h-full top-0 left-0 bottom-0 right-0'
      ),
      attr.class(
        effect === 'transparent'
          ? 'bg-gray-400/10'
          : 'backdrop-blur-xs bg-black/30'
      ),
      ...(rest.mode === 'capturing'
        ? [
            on.click(() => {
              rest.onClickOutside?.()
              close()
            }),
          ]
        : [attr.class('pointer-events-none *:pointer-events-auto')]),
      fnNode(close)
    )
    const clear = render(container, ctx.element, {
      disposeWithParent: true,
      clear: false,
      providers: ctx.providers,
    })
    disposables.push(clear)
    if (rest.mode === 'capturing') {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          rest.onEscape?.()
          close()
        }
      }
      document.addEventListener('keydown', handleEscape)
      disposables.push(() =>
        document.removeEventListener('keydown', handleEscape)
      )
    }
    return close
  }
}

function BaseOverlay(
  getContext: (ctx: BrowserContext) => BrowserContext,
  options: OverlayOptions,
  fn: (open: (renderFn: (close: () => void) => TNode) => void) => TNode
): TNode {
  return WithBrowserCtx(ctx => {
    const openOverlay = makeOverlay(getContext(ctx))
    let currentClose = () => {}

    const open = (renderFn: (close: () => void) => TNode) => {
      currentClose()
      currentClose = openOverlay(options, renderFn)
    }

    return Fragment(
      OnDispose(() => currentClose()),
      fn(open)
    )
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
