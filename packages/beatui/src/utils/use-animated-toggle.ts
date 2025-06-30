import { attr, computedOf, prop, Value, type Signal } from '@tempots/dom'
import { delayed, delayedAnimationFrame } from '@tempots/std'

export type ToggleStatus =
  | 'closed'
  | 'start-opening'
  | 'opening'
  | 'opened'
  | 'closing'
  | 'start-closing'

export type AnimatedToggleOptions = {
  initialStatus?: Exclude<ToggleStatus, 'start-opening'>
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
  const onClosed = (fn: () => void) => {
    return status.on(value => {
      if (value === 'closed') {
        fn()
      }
    })
  }
  let clean = () => {}
  status.on(value => {
    clean()
    console.log(status.value, Date.now())
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
    }
  })
  status.onDispose(() => clean())

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
    onClosed,
  }
}

export type TimedToggleOptions = {
  initialStatus?: Exclude<ToggleStatus, 'start-opening'>
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
  function run() {
    console.log('run', element.getAnimations())
    if (element.getAnimations().length === 0) {
      cb()
      return
    }
    element.addEventListener('transitionend', run, { once: true })
    element.addEventListener('animationend', run, { once: true })
  }

  let listenerAdded = false
  const checkAnimations = () => {
    console.log('checkAnimations', element.getAnimations())
    if (element.getAnimations().length === 0) {
      cb()
    } else {
      element.addEventListener('transitionend', run, { once: true })
      element.addEventListener('animationend', run, { once: true })
      listenerAdded = true
    }
  }

  const clean = delayedAnimationFrame(checkAnimations)
  return () => {
    clean()
    if (listenerAdded) {
      element.removeEventListener('transitionend', run)
      element.removeEventListener('animationend', run)
    }
  }
}

export type AnimatedElementToggleOptions = {
  initialStatus?: Exclude<ToggleStatus, 'start-opening'>
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

export type Animation =
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

export function AnimatedToggleClass(
  animation: Value<Animation>,
  status: Signal<ToggleStatus>
) {
  return attr.class(
    computedOf(
      animation,
      status
    )((a, s) => `bu-toggle--animated bu-toggle--${a} bu-toggle--${s}`)
  )
}
