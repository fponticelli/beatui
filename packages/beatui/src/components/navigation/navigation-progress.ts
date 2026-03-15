import {
  aria,
  attr,
  Fragment,
  html,
  OnDispose,
  Portal,
  prop,
  style,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'

/**
 * Position of the navigation progress bar within the viewport.
 */
export type NavigationProgressPosition = 'top' | 'bottom'

/**
 * Configuration options for the {@link NavigationProgress} component.
 */
export interface NavigationProgressOptions {
  /** Theme color for the progress bar fill. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Height of the progress bar in pixels. @default 3 @min 1 @max 10 @step 1 */
  height?: Value<number>
  /** Position of the bar in the viewport. @default 'top' */
  position?: Value<NavigationProgressPosition>
  /** Whether to show a spinner indicator alongside the bar. @default false */
  showSpinner?: Value<boolean>
  /** Trickle speed in milliseconds (interval for auto-increment). @default 200 @min 50 @max 1000 @step 50 */
  trickleSpeed?: Value<number>
  /** Minimum display duration in milliseconds to prevent flash. @default 300 @min 0 @max 2000 @step 100 */
  minimumDuration?: Value<number>
  /** Animation speed for CSS transitions in milliseconds. @default 200 @min 50 @max 1000 @step 50 */
  animationSpeed?: Value<number>
}

/**
 * Controller returned by {@link NavigationProgress} for programmatic control.
 */
export interface NavigationProgressController {
  /** Start the progress bar (resets to initial value and begins trickling). */
  start: () => void
  /** Set progress to a specific value (0–100). */
  set: (value: number) => void
  /** Complete the progress bar (animates to 100% then hides). */
  done: () => void
  /** Reset the progress bar to hidden state without animation. */
  reset: () => void
  /** Whether the progress bar is currently active. */
  isActive: Value<boolean>
}

/**
 * Generates a random increment amount that slows as progress approaches 100%.
 * Modeled after NProgress behavior.
 */
function getIncrement(current: number): number {
  if (current < 20) return 10
  if (current < 50) return 3
  if (current < 80) return 2
  if (current < 99) return 0.5
  return 0
}

/**
 * Generates inline CSS custom properties for navigation progress theming.
 */
function generateNavProgressStyles(color: ExtendedColor): string {
  const fillLight = backgroundValue(color, 'solid', 'light')
  const fillDark = backgroundValue(color, 'solid', 'dark')
  return `--nav-progress-fill: ${fillLight.backgroundColor}; --nav-progress-fill-dark: ${fillDark.backgroundColor}`
}

/**
 * A thin progress bar fixed to the top or bottom of the viewport,
 * indicating navigation or loading progress. Inspired by NProgress.
 *
 * Returns a tuple of `[TNode, NavigationProgressController]` so the
 * caller can programmatically control the bar.
 *
 * @param options - Configuration for color, height, position, and behavior
 * @returns A tuple of the progress bar element and its controller
 *
 * @example
 * ```typescript
 * const [bar, progress] = NavigationProgress({ color: 'primary' })
 * // Mount the bar
 * html.div(bar)
 * // Start loading
 * progress.start()
 * // Complete when done
 * progress.done()
 * ```
 *
 * @example
 * ```typescript
 * // With spinner and bottom position
 * const [bar, ctrl] = NavigationProgress({
 *   position: 'bottom',
 *   showSpinner: true,
 *   color: 'info',
 * })
 * ```
 */
export function NavigationProgress(
  options: NavigationProgressOptions = {}
): [TNode, NavigationProgressController] {
  const {
    color = 'primary',
    height = 3,
    position = 'top',
    showSpinner = false,
    trickleSpeed = 200,
    minimumDuration = 300,
    animationSpeed = 200,
  } = options

  const progress = prop(0)
  const isActive = prop(false)
  const isVisible = prop(false)

  let trickleTimer: ReturnType<typeof setInterval> | null = null
  let doneTimeout: ReturnType<typeof setTimeout> | null = null
  let startTime = 0

  function clearTrickle() {
    if (trickleTimer != null) {
      clearInterval(trickleTimer)
      trickleTimer = null
    }
  }

  function clearDoneTimeout() {
    if (doneTimeout != null) {
      clearTimeout(doneTimeout)
      doneTimeout = null
    }
  }

  function startTrickle() {
    clearTrickle()
    trickleTimer = setInterval(() => {
      const current = progress.value
      const inc = getIncrement(current)
      if (inc > 0) {
        progress.set(Math.min(current + Math.random() * inc, 99.5))
      }
    }, Value.get(trickleSpeed))
  }

  function start() {
    clearDoneTimeout()
    progress.set(0)
    isActive.set(true)
    isVisible.set(true)
    startTime = Date.now()
    // Kick to initial value
    requestAnimationFrame(() => {
      progress.set(Math.random() * 5 + 2)
      startTrickle()
    })
  }

  function set(value: number) {
    const clamped = Math.max(0, Math.min(100, value))
    progress.set(clamped)
    if (!isActive.value && clamped < 100) {
      isActive.set(true)
      isVisible.set(true)
    }
  }

  function finishProgress() {
    clearTrickle()
    progress.set(100)
    const speed = Value.get(animationSpeed)
    doneTimeout = setTimeout(() => {
      isActive.set(false)
      // Let fade-out animation complete before hiding
      doneTimeout = setTimeout(() => {
        isVisible.set(false)
        progress.set(0)
      }, speed)
    }, speed)
  }

  function done() {
    clearDoneTimeout()
    const elapsed = Date.now() - startTime
    const minDur = Value.get(minimumDuration)
    const remaining = minDur - elapsed
    if (remaining > 0) {
      doneTimeout = setTimeout(finishProgress, remaining)
    } else {
      finishProgress()
    }
  }

  function reset() {
    clearTrickle()
    clearDoneTimeout()
    isActive.set(false)
    isVisible.set(false)
    progress.set(0)
  }

  const controller: NavigationProgressController = {
    start,
    set,
    done,
    reset,
    isActive,
  }

  const posClass = Value.map(
    position,
    p => `bc-navigation-progress bc-navigation-progress--${p ?? 'top'}`
  )

  const barStyle = Value.map(color, c =>
    generateNavProgressStyles((c ?? 'primary') as ExtendedColor)
  )

  const heightPx = Value.map(height, h => `${h ?? 3}px`)

  const translateX = Value.map(progress, p => `translateX(${-100 + p}%)`)

  const transitionDur = Value.map(
    animationSpeed,
    s =>
      `transform ${s ?? 200}ms var(--motion-easing-standard, cubic-bezier(0.2, 0, 0, 1))`
  )

  const node: TNode = When(isVisible, () =>
    Portal(
      'body',
      Fragment(
        // Progress bar
        html.div(
          attr.class(posClass),
          attr.style(barStyle),
          style.height(heightPx),
          attr.role('progressbar'),
          aria.valuemin(0),
          aria.valuemax(100),
          aria.valuenow(progress),

          // Progress bar fill
          html.div(
            attr.class(
              Value.map(
                isActive,
                a =>
                  `bc-navigation-progress__bar${a ? '' : ' bc-navigation-progress__bar--done'}`
              )
            ),
            style.transform(translateX),
            style.transition(transitionDur),

            // Peg (the glow at the leading edge)
            html.div(attr.class('bc-navigation-progress__peg'))
          )
        ),

        // Optional spinner (outside the overflow:hidden bar container)
        When(
          showSpinner,
          () =>
            html.div(
              attr.class(
                Value.map(
                  posClass,
                  c =>
                    `bc-navigation-progress__spinner${c.includes('--bottom') ? ' bc-navigation-progress__spinner--bottom' : ''}`
                )
              ),
              attr.style(barStyle),
              html.div(attr.class('bc-navigation-progress__spinner-icon'))
            ),
          () => undefined
        ),

        // Cleanup timers on dispose
        OnDispose(() => {
          clearTrickle()
          clearDoneTimeout()
        })
      )
    )
  )

  return [node, controller]
}
