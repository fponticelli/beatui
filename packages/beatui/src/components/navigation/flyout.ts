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

    function cleanup() {
      // Clear any pending timeouts
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
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
    }

    function openFlyout() {
      // Prevent multiple opens - use animated toggle status
      if (animatedToggle.isOpen.value) {
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

      open({
        placement: placement ?? 'top',
        mainAxisOffset,
        crossAxisOffset,
        arrow,
        content: WithElement(element => {
          // Set element for the animation toggle
          animatedToggle.setElement(element)

          // Start opening animation after element is in DOM
          delayed(() => {
            animatedToggle.open()
          }, 10)

          return Fragment(
            OnDispose(() => {
              cleanup()
              animatedToggle.dispose()
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

      // If already open or opening, don't do anything
      if (animatedToggle.isOpen.value) {
        return
      }

      timeout = setTimeout(openFlyout, Value.get(showDelay))
    }

    function hide() {
      // Clear any existing timeout
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
      }

      // If already closed or closing, don't do anything
      if (animatedToggle.isClosed.value || animatedToggle.isClosing.value) {
        return
      }

      timeout = setTimeout(() => {
        // Check again in case state changed during delay
        if (animatedToggle.isClosed.value || animatedToggle.isClosing.value) {
          return
        }

        // Start closing animation
        animatedToggle.close()

        // Clear any existing onClosed callback
        if (onClosedCleanup) {
          onClosedCleanup()
          onClosedCleanup = null
        }

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
