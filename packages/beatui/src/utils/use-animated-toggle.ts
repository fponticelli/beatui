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

export type SlideDirection = 'up' | 'down' | 'left' | 'right'

export type TransformOrigin =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export type ComposableAnimation = {
  // Visual effects
  fade?: boolean
  slide?: SlideDirection
  scale?: boolean | number // true = 0.95, number = custom scale factor

  // Transform settings
  transformOrigin?: TransformOrigin

  // Timing
  duration?: number // milliseconds
  easing?: string // CSS easing function
}

export type AnimationConfig =
  | {
      enter?: ComposableAnimation
      exit?: ComposableAnimation
    }
  | ComposableAnimation // Same for both enter/exit

// Helper to generate CSS classes from composable animation
function animationToClasses(anim: ComposableAnimation | undefined): string[] {
  if (anim == null) return []

  const classes: string[] = []

  if (anim.fade) classes.push('fade')
  if (anim.slide) classes.push(`slide-${anim.slide}`)
  if (anim.scale != null) classes.push('scale')

  return classes.length > 0 ? classes : ['none']
}

// Helper to generate inline style properties from composable animation
// Returns key-value pairs to be set individually via element.style.setProperty()
function animationToStyleProperties(
  anim: ComposableAnimation | undefined
): Array<[string, string]> {
  if (anim == null) return []

  const props: Array<[string, string]> = []

  if (anim.scale != null && typeof anim.scale === 'number') {
    props.push(['--scale-factor', String(anim.scale)])
  }

  if (anim.transformOrigin != null) {
    props.push(['--transform-origin', anim.transformOrigin])
  }

  if (anim.duration != null) {
    props.push(['--animation-duration', `${anim.duration}ms`])
  }

  if (anim.easing != null) {
    props.push(['--animation-easing', anim.easing])
  }

  return props
}

/** @internal Resolves the current animation from config based on toggle status. */
function resolveCurrentAnimation(
  animConfig: AnimationConfig | undefined,
  status: ToggleStatus
): ComposableAnimation | undefined {
  if (animConfig == null) return undefined

  const isEntering =
    status === 'start-opening' || status === 'opening' || status === 'opened'

  if ('enter' in animConfig || 'exit' in animConfig) {
    return isEntering ? animConfig.enter : animConfig.exit
  }

  return animConfig as ComposableAnimation
}

export function AnimatedToggleClass({
  animation,
  status,
}: {
  animation?: Value<AnimationConfig>
  status: Signal<ToggleStatus>
}) {
  const classes = computedOf(
    animation,
    status
  )((animConfig, s) => {
    const currentAnim = resolveCurrentAnimation(animConfig, s)
    const animClasses = animationToClasses(currentAnim)
    const prefixed = animClasses
      .map(c => `bc-animated-toggle--${c}`)
      .join(' ')

    return prefixed
      ? `bc-animated-toggle ${prefixed} bc-animated-toggle--${s}`
      : `bc-animated-toggle bc-animated-toggle--${s}`
  })

  // Use WithElement + setProperty() to set CSS custom properties individually,
  // avoiding attr.style() which overwrites the entire inline style attribute
  // and destroys PopOver's position:absolute positioning.
  return Fragment(
    attr.class(classes),
    WithElement(el => {
      let prevKeys: string[] = []

      function applyStyleProperties(
        props: Array<[string, string]>
      ) {
        for (const key of prevKeys) {
          el.style.removeProperty(key)
        }
        prevKeys = props.map(([k]) => k)
        for (const [key, value] of props) {
          el.style.setProperty(key, value)
        }
      }

      const styleSignal = computedOf(
        animation,
        status
      )((animConfig, s) => {
        const currentAnim = resolveCurrentAnimation(animConfig, s)
        return animationToStyleProperties(currentAnim)
      })

      // Apply initial value
      applyStyleProperties(Value.get(styleSignal))

      // React to changes
      const dispose = Value.on(styleSignal, applyStyleProperties)

      return OnDispose(() => {
        dispose()
        for (const key of prevKeys) {
          el.style.removeProperty(key)
        }
      })
    })
  )
}

export function AnimatedToggle(
  {
    initialStatus = 'closed',
    animation,
  }: {
    initialStatus?: ToggleStatus
    animation?: Value<AnimationConfig>
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
