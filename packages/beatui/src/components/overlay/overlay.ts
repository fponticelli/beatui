import {
  attr,
  BrowserContext,
  computedOf,
  dataAttr,
  Fragment,
  html,
  OnDispose,
  render,
  TNode,
  Value,
  WithBrowserCtx,
  WithElement,
} from '@tempots/dom'
import { OverlayEffect } from '../theme/types'
import { useAnimatedElementToggle } from '@/utils/use-animated-toggle'
import { delayed } from '@tempots/std'

export type OverlayOptions = {
  effect?: Value<OverlayEffect>
  mode: Value<'capturing' | 'non-capturing'>
  onClickOutside?: () => void
  onEscape?: () => void
}

export function makeOverlay(ctx: BrowserContext) {
  return (
    { effect, mode, onClickOutside, onEscape }: OverlayOptions,
    fnNode: (close: () => void) => TNode
  ) => {
    const disposables: (() => void)[] = []
    const close = () => disposables.forEach(dispose => dispose())
    const status = useAnimatedElementToggle()
    status.onClosed(close)

    // Event listener cleanup functions
    let escapeCleanup: () => void = () => {}
    let clickOutsideCleanup: () => void = () => {}

    // Setup escape key listener
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.()
        status.close()
      }
    }

    // Setup click outside listener
    const handleClickOutside = () => {
      onClickOutside?.()
      status.close()
    }

    const setupEventListeners = (
      currentMode: 'capturing' | 'non-capturing'
    ) => {
      // Clean up existing listeners
      escapeCleanup()
      clickOutsideCleanup()

      if (currentMode === 'capturing') {
        document.addEventListener('keydown', handleEscape)
        escapeCleanup = () =>
          document.removeEventListener('keydown', handleEscape)
        ctx.element.addEventListener('mousedown', handleClickOutside)
        clickOutsideCleanup = () =>
          ctx.element.removeEventListener('mousedown', handleClickOutside)
      } else {
        escapeCleanup = () => {}
        clickOutsideCleanup = () => {}
      }
    }

    // Listen for mode changes and update event listeners
    const modeCleanup = Value.on(mode, setupEventListeners)
    disposables.push(modeCleanup)

    // Cleanup event listeners when overlay is disposed
    disposables.push(() => {
      escapeCleanup()
      clickOutsideCleanup()
    })

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

      return html.div(
        WithElement(el => status.setElement(el)),
        dataAttr.status(status.status.map(String)),
        dataAttr.overlay('true'),
        attr.class(
          computedOf(
            effect ?? 'opaque',
            mode
          )(
            (effect, mode) =>
              `bc-overlay bc-overlay--effect-${effect} bc-overlay--mode-${mode}`
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
