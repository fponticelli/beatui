import {
  TNode,
  Value,
  OnDispose,
  Fragment,
  on,
  attr,
  OneOfValue,
  WithElement,
} from '@tempots/dom'
import { PopOver, Placement } from '@tempots/ui'
import { delayedAnimationFrame } from '@tempots/std'
import {
  useAnimatedElementToggle,
  AnimatedToggleClass,
  Animation,
} from '@/utils/use-animated-toggle'
import { sessionId } from '../../utils/session-id'

export type FlyoutTrigger =
  | 'hover'
  | 'focus'
  | 'hover-focus'
  | 'click'
  | 'never'

export type FlyoutTriggerFunction = (
  show: () => void,
  hide: () => void
) => TNode

export interface PopOverArrowOptions {
  placement: string
  x?: number
  y?: number
  centerOffset: number
  containerWidth: number
  containerHeight: number
}

export interface FlyoutOptions {
  /** The flyout content to display */
  content: () => TNode
  /** Placement of the flyout relative to the trigger element */
  placement?: Value<Placement>
  /** Delay in milliseconds before showing the flyout on hover */
  showDelay?: Value<number>
  /** Delay in milliseconds before hiding the flyout after mouse leave */
  hideDelay?: Value<number>
  /** Offset in pixels from the main axis (vertical for top/bottom, horizontal for left/right) */
  mainAxisOffset?: Value<number>
  /** Offset in pixels from the cross axis (horizontal for top/bottom, vertical for left/right) */
  crossAxisOffset?: Value<number>
  /** How to show the flyout */
  showOn?: Value<FlyoutTrigger> | FlyoutTriggerFunction
  /** Whether the flyout can be closed with Escape key */
  closable?: Value<boolean>
  /** Optional arrow configuration - receives a signal with PopOver positioning data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arrow?: (signal: any) => TNode
  /** Additional role attribute for accessibility */
  role?: Value<string>
}

function placementToAnimation(placement: Placement): Animation {
  if (placement.startsWith('top')) return 'flyout-top'
  if (placement.startsWith('bottom')) return 'flyout-bottom'
  if (placement.startsWith('left')) return 'flyout-left'
  if (placement.startsWith('right')) return 'flyout-right'
  return 'scale-fade' // fallback
}

/**
 * Flyout component that provides a flexible popover with various trigger options.
 * This is the base component that powers Tooltip and other overlay components.
 *
 * Unlike other flyout libraries, this component is designed to be a child of the element
 * it provides a flyout for, rather than wrapping it.
 *
 * Uses @tempo-ts/ui PopOver for positioning.
 */
export function Flyout(options: FlyoutOptions): TNode {
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
  } = options

  return PopOver((open, close) => {
    // Create animated toggle for this PopOver instance
    const animatedToggle = useAnimatedElementToggle({
      initialStatus: 'closed',
    })

    // Generate unique IDs for accessibility
    const flyoutId = sessionId('flyout')

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

      open({
        placement: placement ?? 'top',
        mainAxisOffset,
        crossAxisOffset,
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
              // Update ARIA attributes on trigger element
              const triggerElement = document.querySelector(
                `[aria-controls="${flyoutId}"]`
              )
              if (triggerElement) {
                triggerElement.setAttribute('aria-expanded', 'false')
              }
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
            attr.class('bc-flyout'),
            attr.id(flyoutId),
            attr.tabindex(-1), // Make focusable for screen readers
            AnimatedToggleClass(
              Value.map(placement, placementToAnimation),
              animatedToggle.status
            ),
            role ? attr.role(role) : attr.role('dialog'), // Default to dialog role
            content()
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
        onClosedCleanup = animatedToggle.onClosed(() => {
          close()
          cleanup()
        })
      }, delay)
    }

    // Add ARIA attributes to trigger element
    return WithElement(triggerElement => {
      // Set ARIA attributes on the trigger element
      const updateTriggerAria = (isOpen: boolean) => {
        triggerElement.setAttribute('aria-expanded', isOpen.toString())
        triggerElement.setAttribute('aria-controls', flyoutId)
        if (!triggerElement.hasAttribute('aria-haspopup')) {
          triggerElement.setAttribute('aria-haspopup', 'dialog')
        }
      }

      // Initialize ARIA attributes
      updateTriggerAria(false)

      // Enhanced show function with ARIA updates
      const enhancedShow = () => {
        show()
        updateTriggerAria(true)
      }

      // Enhanced hide function with ARIA updates
      const enhancedHide = () => {
        hide()
        updateTriggerAria(false)
      }

      // Handle custom trigger config
      if (typeof showOn === 'function') {
        return (showOn as FlyoutTriggerFunction)(enhancedShow, enhancedHide)
      }

      // Handle built-in trigger types
      const triggerValue = showOn as Value<FlyoutTrigger>
      return Fragment(
        OnDispose(() => {
          // Dispose the animatedToggle when the entire Flyout is disposed
          animatedToggle.dispose()
        }),
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
