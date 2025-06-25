import {
  attr,
  TNode,
  Value,
  prop,
  OnDispose,
  Fragment,
  on,
  OneOfValue,
  style,
  svg,
  svgAttr,
  Signal,
} from '@tempots/dom'
import { PopOver, Placement } from '@tempots/ui'
import { delayed } from '@tempots/std'

export type TooltipTrigger =
  | 'hover'
  | 'focus'
  | 'hover-focus'
  | 'click'
  | 'never'

/**
 * Creates an SVG arrow element for the tooltip
 */
function SVGArrow(direction: Signal<'up' | 'down' | 'left' | 'right'>): TNode {
  const paths = {
    up: 'M0 16 L8 10 L16 16 Z',
    down: 'M0 0 L8 6 L16 0 Z',
    left: 'M16 0 L10 8 L16 16 Z',
    right: 'M0 0 L6 8 L0 16 Z',
  }

  return svg.svg(
    svgAttr.viewBox('0 0 16 16'),
    svg.path(svgAttr.d(direction.map(d => paths[d])))
  )
}

export interface TooltipOptions {
  /** The tooltip content to display */
  content: TNode
  /** Placement of the tooltip relative to the trigger element */
  placement?: Value<Placement>
  /** Delay in milliseconds before showing the tooltip on hover */
  showDelay?: Value<number>
  /** Delay in milliseconds before hiding the tooltip after mouse leave */
  hideDelay?: Value<number>
  /** Offset configuration for fine-tuning tooltip position */
  offset?: Value<{
    mainAxis?: number
    crossAxis?: number
  }>
  /** How to show the tooltip */
  showOn?: Value<TooltipTrigger>
}

/**
 * Tooltip component that provides contextual information when hovering or focusing on elements.
 * Unlike other tooltip libraries, this component is designed to be a child of the element
 * it provides a tooltip for, rather than wrapping it.
 *
 * Uses @tempo-ts/ui PopOver for positioning.
 *
 * @example
 * ```typescript
 * Button(
 *   { onClick: () => console.log('clicked') },
 *   'Click me',
 *   Tooltip({ content: 'This button does something important' })
 * )
 * ```
 */
export function Tooltip(options: TooltipOptions): TNode {
  const {
    content,
    placement = 'top',
    showDelay = 250,
    hideDelay = 500,
    offset = { mainAxis: 8, crossAxis: 0 },
    showOn = 'hover-focus',
  } = options

  const isOpen = prop(false)
  let showTimeout: (() => void) | null = null
  let hideTimeout: (() => void) | null = null

  const clearTimeouts = () => {
    if (showTimeout !== null) {
      showTimeout()
      showTimeout = null
    }
    if (hideTimeout !== null) {
      hideTimeout()
      hideTimeout = null
    }
  }

  const show = () => {
    clearTimeouts()
    showTimeout = delayed(() => {
      isOpen.set(true)
      showTimeout = null
    }, Value.get(showDelay))
  }

  const hide = () => {
    clearTimeouts()
    hideTimeout = delayed(() => {
      isOpen.set(false)
      hideTimeout = null
    }, Value.get(hideDelay))
  }

  return Fragment(
    OneOfValue(showOn, {
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
              document.addEventListener('click', documentClick, { once: true })
            }, 0)
          })
        )
      },
      never: () => Fragment(),
    }),
    PopOver({
      open: isOpen,
      placement: placement ?? 'top',
      offset,
      arrow: {
        content: signal => {
          const direction = signal.map(
            ({ placement }): 'up' | 'down' | 'left' | 'right' => {
              if (placement.includes('top')) {
                return 'down'
              } else if (placement.includes('bottom')) {
                return 'up'
              } else if (placement.includes('left')) {
                return 'right'
              } else if (placement.includes('right')) {
                return 'left'
              }
              return 'up'
            }
          )
          return Fragment(
            attr.class('bc-tooltip__arrow'),
            attr.class(direction.map(d => `bc-tooltip__arrow-${d}`)),
            style.transform(
              signal.map(({ x, y }) => {
                if (x == null && y == null) {
                  return ''
                }
                if (x != null) {
                  return `translate(${x}px, 0)`
                } else {
                  return `translate(0, ${y}px)`
                }
              })
            ),
            SVGArrow(direction)
          )
        },
      },
      content: () => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            clearTimeouts()
            document.removeEventListener('keydown', handleKeyDown)
          }
        }
        document.addEventListener('keydown', handleKeyDown, { once: true })
        return Fragment(
          OnDispose(() => {
            document.removeEventListener('keydown', handleKeyDown)
          }),
          attr.class('bc-tooltip'),
          attr.role('tooltip'),
          content
        )
      },
    })
  )
}
