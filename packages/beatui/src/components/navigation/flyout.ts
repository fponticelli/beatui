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

export interface FlyoutTriggerConfig {
  /** Custom trigger implementation */
  render: (show: () => void, hide: () => void) => TNode
}

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
  content: TNode
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
  showOn?: Value<FlyoutTrigger> | FlyoutTriggerConfig
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
    // Create a fresh animated toggle for each PopOver instance
    let animatedToggle = useAnimatedElementToggle({
      initialStatus: 'closed',
    })

    // Track state to prevent race conditions
    let isOpen = false
    let isOpening = false
    let isClosing = false
    let handleKeyDown: ((event: KeyboardEvent) => void) | null = null
    let onClosedCleanup: (() => void) | null = null
    let openDelayedCleanup: (() => void) | null = null

    function cleanup() {
      // Clear any pending timeouts
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
      }

      // Clear delayed opening animation
      if (openDelayedCleanup) {
        openDelayedCleanup()
        openDelayedCleanup = null
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

      // Reset state flags
      isOpen = false
      isOpening = false
      isClosing = false
    }

    // Keep track of the current element
    let currentElement: HTMLElement | null = null

    function setupAnimatedToggle() {
      // Create a fresh animatedToggle
      animatedToggle = useAnimatedElementToggle({
        initialStatus: 'closed',
      })

      // If we have a current element, set it for the new toggle
      if (currentElement) {
        animatedToggle.setElement(currentElement)
      }
    }

    function openFlyout() {
      // Prevent multiple opens
      if (isOpen || isOpening) {
        return
      }

      // Create a fresh animatedToggle for each open operation
      animatedToggle.dispose()
      setupAnimatedToggle()

      isOpening = true
      isClosing = false

      // Set up the delayed callback to complete the opening process
      if (openDelayedCleanup) {
        openDelayedCleanup()
        openDelayedCleanup = null
      }

      openDelayedCleanup = delayed(() => {
        if (isOpening) {
          // Only open if we're still in opening state
          animatedToggle.open()
          isOpen = true
          isOpening = false
        }
        openDelayedCleanup = null
      }, 10)

      if (Value.get(closable)) {
        handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            hide()
          }
        }
        document.addEventListener('keydown', handleKeyDown, { once: true })
      }

      open({
        placement: placement ?? 'top',
        mainAxisOffset,
        crossAxisOffset,
        arrow,
        content: WithElement(element => {
          // Store the current element and set it for the animation toggle
          currentElement = element
          animatedToggle.setElement(element)

          // Start opening animation after element is in DOM
          openDelayedCleanup = delayed(() => {
            if (isOpening) {
              // Only open if we're still in opening state
              animatedToggle.open()
              isOpen = true
              isOpening = false
            }
            openDelayedCleanup = null
          }, 10)

          return Fragment(
            OnDispose(() => {
              cleanup()
              // Only dispose the animation toggle when the component is destroyed
              animatedToggle.dispose()
            }),
            dataAttr.status(animatedToggle.status.map(String)),
            dataAttr.placement(Value.map(placement ?? 'top', String)),
            role ? attr.role(role) : null,
            content
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

      // If we're in any state other than ready to open, clean up and reset
      if (isClosing || isOpening || isOpen) {
        cleanup()
      }

      timeout = setTimeout(openFlyout, Value.get(showDelay))
    }

    function hide() {
      // Clear any existing timeout
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
      }

      // If we're currently opening, we need to wait for it to complete then close
      // Don't return early - let the hide process continue

      // If already closing, don't do anything
      if (isClosing) {
        return
      }
      timeout = setTimeout(() => {
        // If already closing, don't do anything
        if (isClosing) {
          return
        }

        // If we're still opening, wait for it to complete
        if (isOpening) {
          // Wait for opening to complete, then close
          const waitForOpen = () => {
            if (isOpening) {
              setTimeout(waitForOpen, 10)
            } else if (isOpen) {
              isClosing = true
              isOpen = false
              animatedToggle.close()

              // Clear any existing onClosed callback
              if (onClosedCleanup) {
                onClosedCleanup()
                onClosedCleanup = null
              }

              onClosedCleanup = animatedToggle.onClosed(() => {
                if (isClosing) {
                  close()
                  cleanup()
                }
              })
            }
          }
          waitForOpen()
          return
        }

        // If not open, nothing to close
        if (!isOpen) {
          return
        }

        isClosing = true
        isOpen = false

        // Start closing animation
        animatedToggle.close()

        // Clear any existing onClosed callback
        if (onClosedCleanup) {
          onClosedCleanup()
          onClosedCleanup = null
        }

        // Wait for animation to complete before closing PopOver
        onClosedCleanup = animatedToggle.onClosed(() => {
          if (isClosing) {
            // Only close if we're still in closing state
            close()
            cleanup()
          }
        })
      }, Value.get(hideDelay))
    }

    // Handle custom trigger config
    if (typeof showOn === 'object' && showOn && 'render' in showOn) {
      return Fragment((showOn as FlyoutTriggerConfig).render(show, hide))
    }

    // Handle built-in trigger types
    const triggerValue = showOn as Value<FlyoutTrigger>
    return Fragment(
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
