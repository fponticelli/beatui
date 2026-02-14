import { TNode, When, html, attr, Use, Value, Signal } from '@tempots/dom'
import { Button, CloseButton } from '../../button'
import { Icon } from '../../data'
import { BeatUII18n } from '../../../beatui-i18n'

/**
 * Layout mode for list item controls (move/remove buttons).
 *
 * - `'aside'` - Controls are rendered in a column to the right of each item
 * - `'below'` - Controls are rendered in a row below each item
 */
export type ListControlsLayout = 'below' | 'aside'

/**
 * Configuration options for {@link ListItemControls}.
 */
export type ListItemControlsOptions = {
  /** Callback to move the item up or down */
  onMove: (direction: 'up' | 'down') => void
  /** Signal indicating the item cannot be moved up */
  cannotMoveUp: Signal<boolean>
  /** Signal indicating the item cannot be moved down */
  cannotMoveDown: Signal<boolean>
  /** Callback to remove the item */
  onRemove: () => void
  /**
   * Whether to show the move buttons.
   * @default true
   */
  showMove?: Value<boolean>
  /**
   * Whether to show the remove button.
   * @default true
   */
  showRemove?: Value<boolean>
  /** When true, disables the remove button instead of hiding it */
  removeDisabled?: Value<boolean>
  /**
   * Whether to show move buttons (e.g., when list has more than 1 item).
   * @default true
   */
  showMoveButtons?: Value<boolean>
  /**
   * Layout mode for the controls.
   * @default 'aside'
   */
  layout?: Value<ListControlsLayout>
}

/**
 * Renders reusable move/remove controls for a list item.
 *
 * Wraps content with move up/down and remove buttons, positioned either
 * beside (`'aside'`) or below the content depending on the layout mode.
 *
 * @param options - Configuration options for the controls
 * @param content - The list item content to wrap
 * @returns A TNode with the content and its controls
 *
 * @example
 * ```ts
 * ListItemControls({
 *   onMove: dir => payload.move(dir),
 *   cannotMoveUp: payload.cannotMove('up'),
 *   cannotMoveDown: payload.cannotMove('down'),
 *   onRemove: payload.remove,
 *   layout: 'aside',
 * }, myItemContent)
 * ```
 */
export function ListItemControls(
  options: ListItemControlsOptions,
  content: TNode
): TNode {
  const {
    onMove,
    cannotMoveUp,
    cannotMoveDown,
    onRemove,
    showMove = true,
    showRemove = true,
    removeDisabled,
    showMoveButtons = true,
    layout = 'aside',
  } = options

  const isAside = Value.toSignal(layout).map(l => l === 'aside')

  const moveButtons = When(showMove, () =>
    html.div(
      attr.class('bc-list-item-controls__move'),
      Button(
        {
          size: 'xs',
          roundedness: 'full',
          variant: 'text',
          onClick: () => onMove('up'),
          disabled: cannotMoveUp,
        },
        Use(BeatUII18n, t =>
          Icon({
            size: 'xs',
            icon: 'line-md:arrow-up',
            title: t.$.incrementValue as Value<string | undefined>,
          })
        )
      ),
      Button(
        {
          size: 'xs',
          roundedness: 'full',
          variant: 'text',
          onClick: () => onMove('down'),
          disabled: cannotMoveDown,
        },
        Use(BeatUII18n, t =>
          Icon({
            size: 'xs',
            icon: 'line-md:arrow-down',
            title: t.$.decrementValue as Value<string | undefined>,
          })
        )
      )
    )
  )

  const removeButton = When(showRemove, () =>
    Use(BeatUII18n, t =>
      CloseButton({
        size: 'xs',
        label: Value.map(t.$.removeItem, s => s.toLowerCase()),
        color: 'danger',
        disabled: removeDisabled,
        onClick: onRemove,
      })
    )
  )

  return When(
    isAside,
    () =>
      html.div(
        attr.class('bc-list-item-controls bc-list-item-controls--aside'),
        html.div(attr.class('bc-list-item-controls__content'), content),
        html.div(
          attr.class('bc-list-item-controls__actions'),
          When(showMoveButtons, () => moveButtons),
          removeButton
        )
      ),
    () =>
      html.div(
        attr.class('bc-list-item-controls bc-list-item-controls--below'),
        html.div(attr.class('bc-list-item-controls__content'), content),
        html.div(
          attr.class('bc-list-item-controls__actions'),
          When(
            showMoveButtons,
            () => moveButtons,
            () => html.div()
          ),
          removeButton
        )
      )
  )
}
