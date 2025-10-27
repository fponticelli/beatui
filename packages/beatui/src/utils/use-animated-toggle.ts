import {
  attr,
  computedOf,
  Fragment,
  OnDispose,
  prop,
  TNode,
  Value,
  WithElement,
  type Signal,
} from '@tempots/dom'
import { delayed, delayedAnimationFrame } from '@tempots/std'

export type ToggleStatus =
  | 'closed'
  | 'start-opening'
  | 'opening'
  | 'opened'
  | 'closing'
  | 'start-closing'

export type AnimatedToggleOptions = {
  initialStatus?: ToggleStatus
  openedAfter: (cb: () => void) => () => void
  closedAfter: (cb: () => void) => () => void
}

export function useAnimatedToggle({
  initialStatus = 'closed',
  openedAfter,
  closedAfter,
}: AnimatedToggleOptions) {
  const status = prop<ToggleStatus>(initialStatus)
  const open = () => {
    status.set('start-opening')
  }
  const close = () => {
    status.set('start-closing')
  }
  const display = status.map(
    v => v !== 'closed' && v !== 'start-closing' && v !== 'closing'
  )
  const setOpen = (v: boolean) => {
    if (v) {
      open()
    } else {
      close()
    }
  }
  const toggle = () => {
    setOpen(!display.value)
  }
  const disposeOnClosedListeners: Array<() => void> = []
  const listenOnClosed = (fn: () => void) => {
    disposeOnClosedListeners.push(
      status.on(value => {
        if (value === 'closed') {
          fn()
        }
      })
    )
  }
  let clean = () => {}
  status.on(value => {
    clean()
    switch (value) {
      case 'start-opening':
        // One frame for browser to apply initial styles
        clean = delayedAnimationFrame(() => status.set('opening'))
        break
      case 'opening':
        clean = openedAfter(() => status.set('opened'))
        break
      case 'start-closing':
        // One frame for browser to apply initial styles
        clean = delayedAnimationFrame(() => status.set('closing'))
        break
      case 'closing':
        clean = closedAfter(() => status.set('closed'))
        break
      case 'closed':
        clean = () => {}
        break
    }
  })
  status.onDispose(() => {
    disposeOnClosedListeners.forEach(dispose => dispose())
    clean()
  })

  const isClosed = status.map(v => v === 'closed')
  const isStartOpening = status.map(v => v === 'start-opening')
  const isOpening = status.map(v => v === 'opening')
  const isOpened = status.map(v => v === 'opened')
  const isClosing = status.map(v => v === 'closing')
  const isStartClosing = status.map(v => v === 'start-closing')

  return {
    status: status as Signal<ToggleStatus>,
    open,
    close,
    toggle,
    setOpen,
    display,
    isClosed,
    isStartOpening,
    isOpening,
    isOpened,
    isClosing,
    isStartClosing,
    dispose: () => status.dispose(),
    listenOnClosed,
  }
}

export type TimedToggleOptions = {
  initialStatus?: ToggleStatus
  openDuration?: number
  closeDuration?: number
  duration?: number
}

export function useTimedToggle({
  initialStatus = 'closed',
  duration,
  openDuration = duration ?? 500,
  closeDuration = duration ?? 500,
}: TimedToggleOptions = {}) {
  return useAnimatedToggle({
    initialStatus,
    openedAfter: cb => delayed(cb, openDuration),
    closedAfter: cb => delayed(cb, closeDuration),
  })
}

function onAnimationEnd(element: HTMLElement, cb: () => void) {
  let completed = false
  let timeout: ReturnType<typeof setTimeout> | null = null

  function complete() {
    if (completed) return
    completed = true
    element.removeEventListener('transitionend', onTransitionEnd)
    element.removeEventListener('animationend', onAnimationEnd)
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    cb()
  }

  function onTransitionEnd(event: TransitionEvent) {
    // Only complete if the transition is on this element (not a child)
    if (event.target === element) {
      complete()
    }
  }

  function onAnimationEnd(event: AnimationEvent) {
    // Only complete if the animation is on this element (not a child)
    if (event.target === element) {
      complete()
    }
  }

  const checkAnimations = () => {
    // In test environments, CSS transitions don't fire events, so complete immediately
    const isNotBrowser = typeof element.getAnimations === 'undefined'

    if (isNotBrowser) {
      timeout = setTimeout(complete, 16) // Single frame delay for consistency
      return
    }

    // No Web Animations running, use transition events + timeout
    element.addEventListener('transitionend', onTransitionEnd)
    element.addEventListener('animationend', onAnimationEnd)

    // For CSS transitions, we rely on transitionend events + timeout fallback
    // For CSS animations, we check getAnimations() + animationend events
    if (element.getAnimations().length === 0) {
      // Fallback timeout for CSS transitions (longer than typical transition duration)
      timeout = setTimeout(complete, 1000)
    }
  }

  const clean = delayedAnimationFrame(checkAnimations)
  return () => {
    completed = true
    clean()
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    element.removeEventListener('transitionend', onTransitionEnd)
    element.removeEventListener('animationend', onAnimationEnd)
  }
}

export type AnimatedElementToggleOptions = {
  initialStatus?: ToggleStatus
  element?: HTMLElement
}

export function useAnimatedElementToggle({
  initialStatus = 'closed',
  element,
}: AnimatedElementToggleOptions = {}) {
  let el = element
  return {
    setElement: (value: HTMLElement) => {
      el = value
    },
    ...useAnimatedToggle({
      initialStatus,
      openedAfter: cb => {
        if (el == null) {
          cb()
          return () => {}
        }
        // return delayed(cb, 500)
        return onAnimationEnd(el, cb)
      },
      closedAfter: cb => {
        if (el == null) {
          cb()
          return () => {}
        }
        // return delayed(cb, 500)
        return onAnimationEnd(el, cb)
      },
    }),
  }
}

export type ToggleAnimation =
  | 'none'
  | 'slide-right'
  | 'slide-left'
  | 'slide-up'
  | 'slide-down'
  | 'fade'
  | 'fade-slide-right'
  | 'fade-slide-left'
  | 'fade-slide-up'
  | 'fade-slide-down'
  | 'scale'
  | 'scale-fade'
  | 'flyout-top'
  | 'flyout-bottom'
  | 'flyout-left'
  | 'flyout-right'

export function AnimatedToggleClass({
  animation = 'fade',
  status,
}: {
  animation?: Value<ToggleAnimation>
  status: Signal<ToggleStatus>
}) {
  return attr.class(
    computedOf(
      animation,
      status
    )(
      (a, s) =>
        `bc-animated-toggle bc-animated-toggle--${a} bc-animated-toggle--${s}`
    )
  )
}

export function AnimatedToggle(
  {
    initialStatus = 'closed',
    animation = 'fade',
  }: {
    initialStatus?: ToggleStatus
    animation?: Value<ToggleAnimation>
  },
  render: (options: {
    status: Signal<ToggleStatus>
    open: () => void
    close: () => void
    toggle: () => void
    setOpen: (v: boolean) => void
    display: Signal<boolean>
    isClosed: Signal<boolean>
    isStartOpening: Signal<boolean>
    isOpening: Signal<boolean>
    isOpened: Signal<boolean>
    isClosing: Signal<boolean>
    isStartClosing: Signal<boolean>
    listenOnClosed: (fn: () => void) => void
  }) => TNode
) {
  return WithElement(element => {
    const { setElement, dispose, ...rest } = useAnimatedElementToggle({
      initialStatus,
      element,
    })
    setElement(element)
    return Fragment(
      AnimatedToggleClass({ status: rest.status, animation }),
      OnDispose(dispose),
      render(rest)
    )
  })
}
