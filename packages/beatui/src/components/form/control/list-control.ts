import {
  TNode,
  ElementPosition,
  attr,
  When,
  Use,
  Value,
  computedOf,
  Merge,
  Fragment,
} from '@tempots/dom'
import { ArrayController } from '../controller/controller'
import {
  ListInput,
  ListInputPayload,
  MoveDirection,
  MovableDirection,
} from '../input/list-input'
import { Button } from '../../button'
import { Icon } from '../../data'
import { Group } from '../../layout/group'
import { BeatUII18n } from '../../../beatui-i18n'
import { InputWrapper, InputWrapperOptions } from '../input'
import { ListItemControls, ListControlsLayout } from './list-item-controls'

/**
 * Payload provided to each list item element renderer, re-exported from {@link ListInputPayload}.
 *
 * @typeParam T - The type of each item in the list
 */
export type ListControllerPayload<T> = ListInputPayload<T>
export type { MoveDirection, MovableDirection }

/**
 * Base configuration options for {@link BaseListControl} (without InputWrapper).
 *
 * @typeParam T - The type of each item in the list
 */
export type BaseListControlOptions<T> = {
  /** The array controller managing the list state */
  controller: ArrayController<T[]>
  /** Render function for each list item, receiving the item's payload */
  element: (payload: ListInputPayload<T>) => TNode
  /** Optional separator rendered between list items */
  separator?: (pos: ElementPosition) => TNode
  /**
   * Whether to show move up/down buttons for reordering items.
   * @default true
   */
  showMove?: Value<boolean>
  /**
   * Whether to show the remove button for each item.
   * @default true
   */
  showRemove?: Value<boolean>
  /**
   * Whether to show the "Add" button below the list.
   * @default true
   */
  showAdd?: Value<boolean>
  /** When true, disables the remove button instead of hiding it */
  removeDisabled?: Value<boolean>
  /** When true, disables the add button (if visible) */
  addDisabled?: Value<boolean>
  /** Factory function that creates a new default item when the "Add" button is clicked */
  createItem?: () => T
  /** Custom label for the "Add" button. Defaults to the i18n `addLabel` message. */
  addLabel?: TNode
  /**
   * Layout mode for the item controls.
   * @default 'aside'
   */
  controlsLayout?: Value<ListControlsLayout>
}

/**
 * Configuration options for {@link ListControl}, combining InputWrapper options with list control options.
 *
 * Inherits all properties from {@link InputWrapperOptions} (except `content`, which is generated)
 * and {@link BaseListControlOptions}.
 *
 * @typeParam T - The type of each item in the list
 */
export type ListControlOptions<T> = Merge<
  Omit<InputWrapperOptions, 'content'>,
  BaseListControlOptions<T>
>

/**
 * Renders a list of items with move, remove, and add controls -- without an InputWrapper.
 *
 * Each item is rendered using the `element` callback and can optionally include
 * move up/down buttons, a remove button, and an "Add" button at the bottom.
 * The controls layout can be positioned `'aside'` (to the right) or `'below'` each item.
 *
 * @typeParam T - The type of each item in the list
 *
 * @param options - Configuration options for the list control
 *
 * @returns A renderable TNode representing the list with controls
 *
 * @example
 * ```typescript
 * import { BaseListControl } from '@tempots/beatui'
 *
 * BaseListControl({
 *   controller: myArrayController,
 *   element: ({ controller, index }) => TextInput({
 *     value: controller.signal,
 *     onChange: controller.change,
 *   }),
 *   createItem: () => '',
 *   showMove: true,
 *   showRemove: true,
 *   showAdd: true,
 * })
 * ```
 */
export const BaseListControl = <T>(options: BaseListControlOptions<T>) => {
  const {
    controller,
    element,
    separator,
    showMove = true,
    showRemove = true,
    showAdd = true,
    createItem,
    addLabel,
    controlsLayout = 'aside',
    removeDisabled,
    addDisabled,
  } = options

  const AddToolbar = When(
    computedOf(showAdd, createItem)((show, create) => show && create != null),
    () =>
      Group(
        attr.class(
          'bc-group--gap-2 bc-group--align-center bc-group--justify-center'
        ),
        Button(
          {
            size: 'sm',
            variant: 'filled',
            onClick: () => controller.push(createItem!()),
            disabled: computedOf(
              controller.disabled,
              addDisabled ?? false
            )(
              (ctrlDisabled, addDisabledValue) =>
                ctrlDisabled || addDisabledValue
            ),
          },
          Use(BeatUII18n, t =>
            Group(
              attr.class('bc-group--gap-2'),
              Icon({ icon: 'line-md:plus' }),
              addLabel ?? t.$.addLabel
            )
          )
        )
      )
  )

  return Fragment(
    ListInput(
      controller,
      payload =>
        ListItemControls(
          {
            onMove: payload.move,
            cannotMoveUp: payload.cannotMove('up'),
            cannotMoveDown: payload.cannotMove('down'),
            onRemove: payload.remove,
            showMove,
            showRemove,
            removeDisabled,
            showMoveButtons: controller.signal.map(v => v.length > 1),
            layout: controlsLayout,
          },
          element(payload)
        ),
      separator
    ),
    AddToolbar
  )
}

/**
 * Renders a list of items with move, remove, and add controls inside an InputWrapper.
 *
 * Combines {@link BaseListControl} with {@link InputWrapper} to provide a complete
 * form field for managing a list of values, including label, description, and error display.
 *
 * @typeParam T - The type of each item in the list
 *
 * @param options - Configuration options combining InputWrapper and list control settings
 * @param children - Additional child nodes to render inside the InputWrapper
 *
 * @returns A renderable TNode representing the wrapped list control
 *
 * @example
 * ```typescript
 * import { ListControl } from '@tempots/beatui'
 *
 * ListControl({
 *   controller: tagsController,
 *   label: 'Tags',
 *   description: 'Add tags to categorize this item',
 *   element: ({ controller }) => TextInput({
 *     value: controller.signal,
 *     onChange: controller.change,
 *   }),
 *   createItem: () => '',
 *   showAdd: true,
 * })
 * ```
 */
export const ListControl = <T>(
  options: ListControlOptions<T>,
  ...children: TNode[]
) => {
  const {
    controller,
    element,
    separator,
    showMove,
    showRemove,
    showAdd,
    createItem,
    addLabel,
    controlsLayout,
    removeDisabled,
    addDisabled,
    ...inputWrapperOptions
  } = options

  return InputWrapper(
    {
      ...inputWrapperOptions,
      content: BaseListControl({
        controller,
        element,
        separator,
        showMove,
        showRemove,
        showAdd,
        createItem,
        addLabel,
        controlsLayout,
        removeDisabled,
        addDisabled,
      }),
    },
    ...children
  )
}
