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
  /** Additional CSS class for the flyout content */
  className?: Value<string>
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
    className,
    role,
  } = options

  return PopOver((open, close) => {
    // Create the animated toggle outside of the element callback
    const animatedToggle = useAnimatedElementToggle({
      initialStatus: 'closed',
    })
    let handleKeyDown: ((event: KeyboardEvent) => void) | null = null

    function openFlyout() {
      if (Value.get(closable)) {
        handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            hide()
            if (handleKeyDown) {
              document.removeEventListener('keydown', handleKeyDown)
            }
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
          // Set the element for the animation toggle
          animatedToggle.setElement(element)

          // Start opening animation after element is in DOM
          delayed(() => {
            animatedToggle.open()
          }, 10)

          return Fragment(
            OnDispose(() => {
              if (handleKeyDown) {
                document.removeEventListener('keydown', handleKeyDown)
              }
              animatedToggle.dispose()
            }),
            dataAttr.status(animatedToggle.status.map(String)),
            dataAttr.placement(Value.map(placement ?? 'top', String)),
            className ? attr.class(className) : null,
            role ? attr.role(role) : null,
            content
          )
        }),
      })
    }

    let timeout: ReturnType<typeof setTimeout> | null = null
    function show() {
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
      }
      timeout = setTimeout(openFlyout, Value.get(showDelay))
    }
    function hide() {
      if (timeout != null) {
        clearTimeout(timeout)
        timeout = null
      }
      timeout = setTimeout(() => {
        // Start closing animation
        animatedToggle.close()
        // Wait for animation to complete before closing PopOver
        animatedToggle.onClosed(() => {
          close()
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
