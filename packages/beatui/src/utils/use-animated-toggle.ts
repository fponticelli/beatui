import { prop, type Signal } from '@tempots/dom'
import { delayed } from '@tempots/std'

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
  const toggle = () => {
    if (status.value === 'opened' || status.value === 'opening') {
      close()
    } else {
      open()
    }
  }
  const setOpen = (v: boolean) => {
    if (v) {
      open()
    } else {
      close()
    }
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
    if (value === 'start-opening') {
      clean = delayed(() => status.set('opening'), 0)
    }
    if (value === 'opening') {
      clean = openedAfter(() => status.set('opened'))
    }
    if (value === 'start-closing') {
      clean = delayed(() => status.set('closing'), 0)
    }
    if (value === 'closing') {
      clean = closedAfter(() => status.set('closed'))
    }
  })
  status.onDispose(() => clean())
  const isOpen = status.map(v => v !== 'closed')
  const displayOpen = status.map(v => v === 'opened' || v === 'opening')
  return {
    status: status as Signal<ToggleStatus>,
    open,
    close,
    toggle,
    setOpen,
    isOpen,
    displayOpen,
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
    if (element.getAnimations().length === 0) {
      cb()
      return
    }
    element.addEventListener('transitionend', run, { once: true })
    element.addEventListener('animationend', run, { once: true })
  }
  const clean = delayed(run, 10)
  return () => {
    clean()
    element.removeEventListener('transitionend', run)
    element.removeEventListener('animationend', run)
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
        return onAnimationEnd(el, cb)
      },
      closedAfter: cb => {
        if (el == null) {
          cb()
          return () => {}
        }
        return onAnimationEnd(el, cb)
      },
    }),
  }
}
