import {
  TNode,
  Value,
  OnDispose,
  Fragment,
  on,
  attr,
  OneOfValue,
  WithElement,
  dataAttr,
} from '@tempots/dom'
import { PopOver, Placement } from '@tempots/ui'
import { delayed } from '@tempots/std'
import { useAnimatedElementToggle } from '@/utils/use-animated-toggle'

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

    let handleKeyDown: ((event: KeyboardEvent) => void) | null = null
    let onClosedCleanup: (() => void) | null = null
    let delayedOpenCleanup: (() => void) | null = null
    let isPopOverOpen = false // Track if PopOver is currently open

    function cleanup() {
      // Clear any pending timeouts
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
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
      // Prevent multiple opens - check if PopOver is already open or if we're already opening
      if (
        animatedToggle.isOpened.value ||
        animatedToggle.isOpening.value ||
        animatedToggle.isStartOpening.value
      ) {
        return
      }

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

          // Start opening animation after element is in DOM
          delayedOpenCleanup = delayed(() => {
            animatedToggle.open()
            delayedOpenCleanup = null // Clear the cleanup function after execution
          }, 10)

          return Fragment(
            OnDispose(() => {
              cleanup()
              // Don't dispose animatedToggle here - it should live for the entire Flyout lifetime
            }),
            dataAttr.status(animatedToggle.status.map(String)),
            dataAttr.placement(Value.map(placement ?? 'top', String)),
            role ? attr.role(role) : null,
            content()
          )
        }),
      })
    }

    let timeout: ReturnType<typeof setTimeout> | null = null
    function show() {
      // Clear any existing timeout
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
      }

      // Only skip if already opened or in the process of opening (but not closing)
      if (
        animatedToggle.isOpened.value ||
        animatedToggle.isOpening.value ||
        animatedToggle.isStartOpening.value
      ) {
        return
      }

      // If flyout is closing, cancel the closing process and reopen properly
      if (
        animatedToggle.isClosing.value ||
        animatedToggle.isStartClosing.value
      ) {
        // Clear any existing onClosed callback to cancel closing
        if (onClosedCleanup) {
          onClosedCleanup()
          onClosedCleanup = null
        }
        // Reset the animation state to allow proper reopening
        animatedToggle.open()
        return
      }

      // Clear any existing onClosed callback that might interfere
      if (onClosedCleanup) {
        onClosedCleanup()
        onClosedCleanup = null
      }

      timeout = setTimeout(openFlyout, Value.get(showDelay))
    }

    function hide() {
      // Clear any existing timeout
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
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

      // If already closed or closing, don't do anything
      if (
        animatedToggle.isClosed.value ||
        animatedToggle.isClosing.value ||
        animatedToggle.isStartClosing.value
      ) {
        return
      }

      timeout = setTimeout(() => {
        // Check again in case state changed during delay
        if (
          animatedToggle.isClosed.value ||
          animatedToggle.isClosing.value ||
          animatedToggle.isStartClosing.value
        ) {
          return
        }

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
      }, Value.get(hideDelay))
    }

    // Handle custom trigger config
    if (typeof showOn === 'function') {
      return (showOn as FlyoutTriggerFunction)(show, hide)
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
            on.mouseenter(() => show()),
            on.mouseleave(() => hide()),
            on.focus(() => show()),
            on.blur(() => hide())
          ),
        hover: () =>
          Fragment(
            on.mouseenter(() => show()),
            on.mouseleave(() => hide())
          ),
        focus: () =>
          Fragment(
            on.focus(() => show()),
            on.blur(() => hide())
          ),
        click: () => {
          function clear() {
            document.removeEventListener('click', documentClick)
          }
          function documentClick() {
            clear()
            hide()
          }
          return Fragment(
            OnDispose(clear),
            on.click(() => {
              show()
              delayed(() => {
                document.addEventListener('click', documentClick, {
                  once: true,
                })
              }, 0)
            })
          )
        },
        never: () => null,
      })
    )
  })
}
