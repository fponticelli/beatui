import { aria, attr, TNode, Value, Fragment, Renderable } from '@tempots/dom'
import { Placement } from '@tempots/ui'
import { Flyout, FlyoutTrigger } from '../navigation/flyout'
import { sessionId } from '../../utils/session-id'

export type PopoverTrigger = FlyoutTrigger

/**
 * Configuration options for the {@link Popover} component.
 */
export interface PopoverOptions {
  /**
   * The content to display inside the popover.
   * Can be a static TNode or a factory function that returns TNode.
   */
  content: TNode | (() => TNode)
  /**
   * Placement of the popover relative to the trigger element.
   * Uses the Floating UI placement model (e.g., `'top'`, `'bottom-start'`, `'right-end'`).
   * @default 'bottom'
   */
  placement?: Value<Placement>
  /**
   * Delay in milliseconds before showing the popover after trigger activation.
   * @default 0
   */
  showDelay?: Value<number>
  /**
   * Delay in milliseconds before hiding the popover after trigger deactivation.
   * @default 0
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
   * How the popover is triggered to show and hide.
   * @default 'click'
   */
  showOn?: Value<PopoverTrigger>
  /**
   * Whether the popover can be closed with the Escape key or by clicking outside.
   * @default true
   */
  closable?: Value<boolean>
  /**
   * ARIA role attribute applied to the popover container.
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

/**
 * Popover component that displays arbitrary content in a positioned overlay panel
 * triggered by clicking (or other interactions with) a trigger element.
 *
 * Unlike wrapper-based popover libraries, this component is designed to be a child
 * of the trigger element, rather than wrapping it.
 *
 * Built on top of the Flyout component for positioning and interaction logic.
 *
 * @example
 * ```typescript
 * html.button(
 *   'Click me',
 *   Popover({
 *     content: html.div(
 *       html.p('Popover content'),
 *       html.button('Action')
 *     ),
 *     placement: 'bottom-start'
 *   })
 * )
 * ```
 *
 * @example
 * ```typescript
 * // With lazy content loading
 * html.button(
 *   'Settings',
 *   Popover({
 *     content: () => SettingsPanel(),
 *     placement: 'bottom-end',
 *     showOn: 'click'
 *   })
 * )
 * ```
 */
export function Popover(options: PopoverOptions): Renderable {
  const {
    content,
    placement = 'bottom',
    showDelay = 0,
    hideDelay = 0,
    mainAxisOffset = 8,
    crossAxisOffset = 0,
    showOn = 'click',
    closable = true,
    role = 'dialog',
    hasPopup = 'dialog',
  } = options

  // Generate unique ID for the popover
  const popoverId = sessionId('popover')

  // Normalize content to factory function
  const contentFactory = typeof content === 'function' ? content : () => content

  return Fragment(
    aria.describedby(popoverId),
    Flyout({
      content: () =>
        Fragment(
          attr.class('bc-popover'),
          attr.role(role),
          attr.id(popoverId),
          contentFactory()
        ),
      placement,
      showDelay,
      hideDelay,
      mainAxisOffset,
      crossAxisOffset,
      showOn,
      closable,
      role,
      hasPopup,
    })
  )
}
