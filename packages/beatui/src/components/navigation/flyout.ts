import {
  Renderable,
  TNode,
  Value,
  OnDispose,
  Fragment,
  on,
  attr,
  aria,
  OneOfValue,
  WithElement,
  prop,
  SplitNValue,
  html,
} from '@tempots/dom'
import { PopOver, Placement } from '@tempots/ui'
import { delayedAnimationFrame } from '@tempots/std'
import {
  useAnimatedElementToggle,
  AnimatedToggleClass,
  AnimationConfig,
  ComposableAnimation,
} from '../../utils/use-animated-toggle'
import { sessionId } from '../../utils/session-id'

/**
 * Built-in trigger modes that control how the {@link Flyout} is shown.
 *
 * - `'hover'` - Shows on mouse enter, hides on mouse leave.
 * - `'focus'` - Shows on focus, hides on blur.
 * - `'hover-focus'` - Combines both hover and focus triggers.
 * - `'click'` - Shows on click, hides on clicking outside.
 * - `'never'` - Never shows automatically; must be controlled programmatically via a custom trigger function.
 */
export type FlyoutTrigger =
  | 'hover'
  | 'focus'
  | 'hover-focus'
  | 'click'
  | 'never'

/**
 * Custom trigger function for the {@link Flyout} component.
 * Receives `show` and `hide` callbacks and returns trigger content that controls
 * when the flyout appears and disappears.
 *
 * @param show - Call to show the flyout
 * @param hide - Call to hide the flyout
 * @returns A renderable node containing the trigger logic
 */
export type FlyoutTriggerFunction = (
  show: () => void,
  hide: () => void
) => TNode

/**
 * Positioning data for a popover arrow element, provided by the PopOver positioning engine.
 */
export interface PopOverArrowOptions {
  /** The computed placement of the popover (e.g., `'top'`, `'bottom-start'`). */
  placement: string
  /** Horizontal offset of the arrow in pixels relative to the popover container. */
  x?: number
  /** Vertical offset of the arrow in pixels relative to the popover container. */
  y?: number
  /** Offset from the center of the reference element, used for arrow alignment. */
  centerOffset: number
  /** Width of the popover container in pixels. */
  containerWidth: number
  /** Height of the popover container in pixels. */
  containerHeight: number
}

/**
 * Configuration options for the {@link Flyout} component.
 */
export interface FlyoutOptions {
  /**
   * Factory function that returns the flyout content to display.
   * Called lazily when the flyout opens.
   */
  content: () => TNode
  /**
   * Placement of the flyout relative to the trigger element.
   * Uses the Floating UI placement model (e.g., `'top'`, `'bottom-start'`, `'right-end'`).
   * @default 'top'
   */
  placement?: Value<Placement>
  /**
   * Delay in milliseconds before showing the flyout after trigger activation.
   * @default 250
   */
  showDelay?: Value<number>
  /**
   * Delay in milliseconds before hiding the flyout after trigger deactivation.
   * @default 500
   */
  hideDelay?: Value<number>
  /**
   * Offset in pixels from the main axis (vertical for top/bottom placements,
   * horizontal for left/right placements).
   * @default 8
   */
  mainAxisOffset?: Value<number>
  /**
   * Offset in pixels from the cross axis (horizontal for top/bottom placements,
   * vertical for left/right placements).
   * @default 0
   */
  crossAxisOffset?: Value<number>
  /**
   * How the flyout is triggered to show and hide. Accepts a built-in {@link FlyoutTrigger}
   * string or a custom {@link FlyoutTriggerFunction} for programmatic control.
   * @default 'hover-focus'
   */
  showOn?: Value<FlyoutTrigger> | FlyoutTriggerFunction
  /**
   * Whether the flyout can be closed with the Escape key or by clicking outside.
   * @default true
   */
  closable?: Value<boolean>
  /**
   * Optional arrow renderer. Receives a signal with {@link PopOverArrowOptions} positioning
   * data and returns a TNode to render as the arrow element.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arrow?: (signal: any) => TNode
  /**
   * ARIA role attribute applied to the flyout container.
   * @default 'dialog'
   */
  role?: Value<string>
  /**
   * Value for the `aria-haspopup` attribute on the trigger element.
   * Indicates the type of popup that the trigger controls.
   * @default 'dialog'
   */
  hasPopup?: Value<boolean | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid'>
}

/** @internal Maps a PopOver placement to its corresponding animation configuration (slide direction + transform origin). */
function placementToAnimation(placement: Placement): AnimationConfig {
  const anim: ComposableAnimation = { fade: true, scale: true }

  if (placement.startsWith('top')) {
    anim.slide = 'down'
    anim.transformOrigin = 'bottom'
  } else if (placement.startsWith('bottom')) {
    anim.slide = 'up'
    anim.transformOrigin = 'top'
  } else if (placement.startsWith('left')) {
    anim.slide = 'right'
    anim.transformOrigin = 'right'
  } else if (placement.startsWith('right')) {
    anim.slide = 'left'
    anim.transformOrigin = 'left'
  }

  return anim
}

/**
 * Flexible popover component with configurable trigger modes, animated transitions,
 * and accessibility support.
 *
 * Unlike wrapper-based flyout libraries, this component is designed to be rendered as a
 * **child** of the trigger element. It attaches event listeners to the parent element
 * and manages the popover lifecycle (show/hide with delays, animation, keyboard dismissal).
 *
 * This is the base component that powers {@link Tooltip}, {@link Menu}, and other
 * positioned overlay components.
 *
 * Uses `@tempots/ui` PopOver for Floating UI-based positioning.
 *
 * @param options - Configuration options controlling content, placement, triggers, delays, and accessibility
 * @returns A renderable node to be placed inside the trigger element
 *
 * @example
 * ```typescript
 * // Hover-triggered flyout
 * html.button(
 *   'Hover me',
 *   Flyout({
 *     content: () => html.div('Flyout content'),
 *     placement: 'bottom',
 *     showOn: 'hover',
 *     showDelay: 200,
 *     hideDelay: 300,
 *   })
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Click-triggered flyout with custom trigger function
 * html.button(
 *   'Click me',
 *   Flyout({
 *     content: () => html.div('Custom content'),
 *     showOn: (show, hide) => on.click(() => show()),
 *   })
 * )
 * ```
 */
export function Flyout(options: FlyoutOptions): Renderable {
  const {
    content,
    placement = 'top',
    showDelay = 250,
    hideDelay = 500,
    mainAxisOffset = 8,
    crossAxisOffset = 0,
    showOn = 'hover-focus',
    closable = true,
    arrow,
    role,
    hasPopup = 'dialog',
  } = options

  return PopOver((open, close) => {
    // Create animated toggle for this PopOver instance
    const animatedToggle = useAnimatedElementToggle({
      initialStatus: 'closed',
    })

    // Generate unique IDs for accessibility
    const flyoutId = sessionId('flyout')
    const triggerExpanded = prop<boolean | 'undefined'>(false)

    let handleKeyDown: ((event: KeyboardEvent) => void) | null = null
    let onClosedCleanup: (() => void) | null = null
    let delayedOpenCleanup: (() => void) | null = null
    let isPopOverOpen = false // Track if PopOver is currently open

    function cleanup() {
      // Clear any pending timeouts
      if (showTimeout != null) {
        clearTimeout(showTimeout)
        showTimeout = null
      }
      if (hideTimeout != null) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }

      // Clear delayed open callback
      if (delayedOpenCleanup) {
        delayedOpenCleanup()
        delayedOpenCleanup = null
      }

      // Clear onClosed listener
      if (onClosedCleanup) {
        onClosedCleanup()
        onClosedCleanup = null
      }

      // Clear keyboard handler
      if (handleKeyDown) {
        document.removeEventListener('keydown', handleKeyDown)
        handleKeyDown = null
      }

      // Reset PopOver state
      triggerExpanded.set(false)
      isPopOverOpen = false
    }

    function openFlyout() {
      if (Value.get(closable)) {
        handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            hide()
          }
        }
        document.addEventListener('keydown', handleKeyDown)
      }

      isPopOverOpen = true // Mark PopOver as open
      triggerExpanded.set(true)

      open({
        placement: placement ?? 'top',
        mainAxisOffset,
        crossAxisOffset,
        onClickOutside: () => {
          if (Value.get(closable)) {
            hide()
          }
        },
        arrow,
        content: WithElement(element => {
          // Set element for the animation toggle
          animatedToggle.setElement(element)

          // Start opening animation after ensuring initial state is rendered
          delayedOpenCleanup = delayedAnimationFrame(() => {
            animatedToggle.open()
            delayedOpenCleanup = null
          })

          // Add keyboard navigation for closable flyouts
          const handleKeyDown = (event: KeyboardEvent) => {
            if (Value.get(closable) && event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              hide()
              triggerExpanded.set(false)
            }
          }

          // Add keyboard event listener
          document.addEventListener('keydown', handleKeyDown, true)

          return Fragment(
            OnDispose(() => {
              cleanup()
              document.removeEventListener('keydown', handleKeyDown, true)
              // Don't dispose animatedToggle here - it should live for the entire Flyout lifetime
            }),
            attr.class('bc-flyout-container'),
            AnimatedToggleClass({
              animation: Value.map(placement, placementToAnimation),
              status: animatedToggle.status,
            }),
            attr.id(flyoutId),
            attr.tabindex(-1), // Make focusable for screen readers
            html.div(
              attr.class('bc-flyout'),
              role ? attr.role(role) : attr.role('dialog'), // Default to dialog role
              content()
            )
          )
        }),
      })
    }

    let showTimeout: ReturnType<typeof setTimeout> | null = null
    function show() {
      // Clear any existing show timeout
      if (showTimeout != null) {
        clearTimeout(showTimeout)
        showTimeout = null
      }

      // Clear any pending hide timeout since we're showing
      if (hideTimeout != null) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }

      // Clear any existing onClosed callback since we're not closing anymore
      if (onClosedCleanup) {
        onClosedCleanup()
        onClosedCleanup = null
      }

      // If flyout is already opened or opening, do nothing
      if (
        animatedToggle.isOpened.value ||
        animatedToggle.isOpening.value ||
        animatedToggle.isStartOpening.value
      ) {
        return
      }

      // If flyout is closing, immediately reopen it
      if (
        animatedToggle.isClosing.value ||
        animatedToggle.isStartClosing.value
      ) {
        animatedToggle.open()
        return
      }

      // Schedule the show for normal closed state
      const delay = Value.get(showDelay)
      showTimeout = setTimeout(() => {
        // Clear the timeout reference since it's now executing
        showTimeout = null
        openFlyout()
      }, delay)
    }

    let hideTimeout: ReturnType<typeof setTimeout> | null = null
    function hide() {
      // Clear any existing show timeout since we're hiding
      if (showTimeout != null) {
        clearTimeout(showTimeout)
        showTimeout = null
      }

      // Clear any existing hide timeout
      if (hideTimeout != null) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }

      triggerExpanded.set(false)

      // Clear any pending delayed open callback
      if (delayedOpenCleanup) {
        delayedOpenCleanup()
        delayedOpenCleanup = null

        // If PopOver was opened but animation was canceled, close it immediately
        if (isPopOverOpen) {
          close()
          cleanup()
          return
        }
      }

      // Schedule the hide - animatedToggle handles state transitions safely
      const delay = Value.get(hideDelay)
      hideTimeout = setTimeout(() => {
        // Clear the timeout reference since it's now executing
        hideTimeout = null

        // Clear any existing onClosed callback before setting a new one
        if (onClosedCleanup) {
          onClosedCleanup()
          onClosedCleanup = null
        }

        // Start closing animation
        animatedToggle.close()

        // Wait for animation to complete before closing PopOver
        animatedToggle.listenOnClosed(() => {
          close()
          cleanup()
        })
      }, delay)
    }

    // Add ARIA attributes to trigger element
    return WithElement(_triggerElement => {
      const enhancedShow = () => {
        show()
        triggerExpanded.set(true)
      }

      const enhancedHide = () => {
        hide()
        triggerExpanded.set(false)
      }

      const ariaAttributes = Fragment(
        aria.expanded(triggerExpanded),
        aria.controls(flyoutId),
        aria.haspopup(
          hasPopup as SplitNValue<
            | boolean
            | 'true'
            | 'false'
            | 'menu'
            | 'listbox'
            | 'tree'
            | 'grid'
            | 'dialog'
          >
        )
      )

      // Handle custom trigger config
      if (typeof showOn === 'function') {
        return Fragment(
          ariaAttributes,
          (showOn as FlyoutTriggerFunction)(enhancedShow, enhancedHide)
        )
      }

      // Handle built-in trigger types
      const triggerValue = showOn as Value<FlyoutTrigger>
      return Fragment(
        ariaAttributes,
        OneOfValue(triggerValue, {
          'hover-focus': () =>
            Fragment(
              on.mouseenter(() => enhancedShow()),
              on.mouseleave(() => enhancedHide()),
              on.focus(() => enhancedShow()),
              on.blur(() => enhancedHide())
            ),
          hover: () =>
            Fragment(
              on.mouseenter(() => enhancedShow()),
              on.mouseleave(() => enhancedHide())
            ),
          focus: () =>
            Fragment(
              on.focus(() => enhancedShow()),
              on.blur(() => enhancedHide())
            ),
          click: () => {
            function clear() {
              document.removeEventListener('click', documentClick)
            }
            function documentClick() {
              clear()
              enhancedHide()
            }
            return Fragment(
              OnDispose(clear),
              on.click(() => {
                enhancedShow()
                delayedAnimationFrame(() => {
                  document.addEventListener('click', documentClick, {
                    once: true,
                  })
                })
              })
            )
          },
          never: () => null,
        })
      )
    })
  })
}
