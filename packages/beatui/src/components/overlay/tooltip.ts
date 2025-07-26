import {
  attr,
  TNode,
  Value,
  Fragment,
  style,
  svg,
  svgAttr,
  Signal,
  WithElement,
} from '@tempots/dom'
import { Placement } from '@tempots/ui'
import { Flyout, FlyoutTrigger } from '../navigation/flyout'

export type TooltipTrigger = FlyoutTrigger

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
  /** Offset in pixels from the main axis (vertical for top/bottom, horizontal for left/right) */
  mainAxisOffset?: Value<number>
  /** Offset in pixels from the cross axis (horizontal for top/bottom, vertical for left/right) */
  crossAxisOffset?: Value<number>
  /** How to show the tooltip */
  showOn?: Value<TooltipTrigger>
}

/**
 * Tooltip component that provides contextual information when hovering or focusing on elements.
 * Unlike other tooltip libraries, this component is designed to be a child of the element
 * it provides a tooltip for, rather than wrapping it.
 *
 * Built on top of the Flyout component for positioning and interaction logic.
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
    mainAxisOffset = 8,
    crossAxisOffset = 0,
    showOn = 'hover-focus',
  } = options

  // Generate unique ID for the tooltip
  const tooltipId = `tooltip-${Math.random().toString(36).substring(2, 11)}`

  return WithElement(triggerElement => {
    // Set aria-describedby on the trigger element to associate it with the tooltip
    triggerElement.setAttribute('aria-describedby', tooltipId)

    return Flyout({
      content: () =>
        Fragment(
          attr.class('bc-tooltip'),
          attr.role('tooltip'),
          attr.id(tooltipId),
          content
        ),
      placement,
      showDelay,
      hideDelay,
      mainAxisOffset,
      crossAxisOffset,
      showOn,
      closable: true,
      role: 'tooltip', // Override the default dialog role for tooltips
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      arrow: (signal: any) => {
        const direction = signal.map(
          ({
            placement,
          }: {
            placement: string
          }): 'up' | 'down' | 'left' | 'right' => {
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
          attr.class(direction.map((d: string) => `bc-tooltip__arrow-${d}`)),
          style.transform(
            signal.map(({ x, y }: { x?: number; y?: number }) => {
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
    })
  })
}
