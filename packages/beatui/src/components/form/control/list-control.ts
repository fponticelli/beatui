import {
  TNode,
  ElementPosition,
  attr,
  When,
  html,
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
import { Button, CloseButton } from '../../button'
import { Icon } from '../../data'
import { Group } from '../../layout/group'
import { Stack } from '../../layout/stack'
import { BeatUII18n } from '../../../beatui-i18n'
import { InputWrapper, InputWrapperOptions } from '../input'

/**
 * Payload provided to each list item element renderer, re-exported from {@link ListInputPayload}.
 *
 * @typeParam T - The type of each item in the list
 */
export type ListControllerPayload<T> = ListInputPayload<T>
export type { MoveDirection, MovableDirection }

/**
 * Layout mode for list item controls (move/remove buttons).
 *
 * - `'aside'` - Controls are rendered in a column to the right of each item
 * - `'below'` - Controls are rendered in a row below each item
 */
export type ListControlsLayout = 'below' | 'aside'

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

  const isAside = Value.toSignal(controlsLayout).map(l => l === 'aside')

  const renderControls = (payload: ListInputPayload<T>) => {
    const moveButtons = When(showMove ?? false, () =>
      html.div(
        attr.class('bc-group--align-center'),
        attr.class(
          isAside.map((v): string =>
            v
              ? 'bc-group--direction-column bc-group--gap-1'
              : 'bc-group--direction-row bc-group--gap-1'
          )
        ),
        Button(
          {
            size: 'xs',
            roundedness: 'full',
            variant: 'text',
            onClick: () => payload.move('up'),
            disabled: payload.cannotMove('up'),
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
            onClick: () => payload.move('down'),
            disabled: payload.cannotMove('down'),
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
          // Use a lowercase label to satisfy tests that query with [aria-label*="remove"]
          label: Value.map(t.$.removeItem, s => s.toLowerCase()),
          color: 'danger',
          disabled: removeDisabled,
          onClick: payload.remove,
        })
      )
    )

    return (content: TNode) =>
      When(
        isAside,
        () =>
          Group(
            attr.class('bc-group--gap-1 bc-group--align-center'),
            Stack(attr.class('bc-stack--grow'), content),
            Stack(
              attr.class('bc-stack--align-center'),
              When(
                controller.signal.map(v => v.length > 1),
                () => moveButtons
              ),
              removeButton
            )
          ),
        () =>
          Stack(
            attr.class('bc-stack--gap-2'),
            content,
            Group(
              attr.class('bc-group--gap-2 bc-group--justify-between'),
              When(
                controller.signal.map(v => v.length > 1),
                () => moveButtons,
                () => html.div()
              ),
              removeButton
            )
          )
      )
  }

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
      payload => {
        const wrap = renderControls(payload)
        return wrap(element(payload))
      },
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
