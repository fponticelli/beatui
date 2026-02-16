import {
  ElementPosition,
  Fragment,
  OnDispose,
  Repeat,
  signal,
  Signal,
  TNode,
} from '@tempots/dom'
import { ArrayController, Controller } from '../controller/controller'

/**
 * Payload passed to the element render function of a {@link ListInput}.
 * Provides the controller, item data, position information, and
 * actions for removing and reordering items.
 *
 * @typeParam T - The type of individual list items.
 */
export type ListInputPayload<T> = {
  /** The array controller managing the entire list. */
  list: ArrayController<T[]>
  /** The controller for this specific item. */
  item: Controller<T>
  /** The element's position information (index, isFirst, isLast, etc.). */
  position: ElementPosition
  /** Removes this item from the list. */
  remove: () => void
  /** Moves this item in the specified direction. */
  move: (direction: MoveDirection) => void
  /** Returns a reactive signal indicating whether the item can be moved in the given direction. */
  canMove: (direction: MovableDirection) => Signal<boolean>
  /** Returns a reactive signal indicating whether the item cannot be moved in the given direction. */
  cannotMove: (direction: MovableDirection) => Signal<boolean>
}

/**
 * Direction in which a list item can be moved.
 */
export type MoveDirection = 'up' | 'down' | 'first' | 'last'

/**
 * Directions that can be checked for movability (only up and down, since
 * first/last are always possible when movement in that direction is possible).
 */
export type MovableDirection = 'up' | 'down'

/**
 * A dynamic list input component that renders a repeating set of items from an
 * array controller. Each item receives a payload with actions for removal and
 * reordering (move up, down, first, last).
 *
 * @typeParam T - The type of individual list items.
 * @param controller - The array controller managing the list state.
 * @param element - Render function called for each list item. Receives a
 *   {@link ListInputPayload} with the item controller and action callbacks.
 * @param separator - Optional render function for separators between items.
 * @returns A renderable list of items with management actions.
 *
 * @example
 * ```ts
 * ListInput(
 *   myArrayController,
 *   ({ item, remove, move, canMove }) =>
 *     html.div(
 *       TextInput({ value: item.signal, onChange: item.set }),
 *       html.button(on.click(remove), 'Remove'),
 *       html.button(
 *         attr.disabled(canMove('up').map(v => !v)),
 *         on.click(() => move('up')),
 *         'Move Up'
 *       ),
 *     )
 * )
 * ```
 */
export function ListInput<T>(
  controller: ArrayController<T[]>,
  element: (payload: ListInputPayload<T>) => TNode,
  separator?: (pos: ElementPosition) => TNode
) {
  const length = controller.length.map(v => v)
  return Repeat(
    length,
    position => {
      const item = controller.item(position.index)
      const disposables = [] as (() => void)[]
      return Fragment(
        OnDispose(() => {
          disposables.forEach(dispose => dispose())
        }),
        element({
          list: controller,
          item,
          position,
          remove: () => controller.removeAt(position.index),
          move: (direction: MoveDirection) => {
            switch (direction) {
              case 'up':
                if (position.index === 0) return
                controller.move(position.index, position.index - 1)
                break
              case 'down':
                if (position.index === controller.length.value - 1) return
                controller.move(position.index, position.index + 1)
                break
              case 'first':
                controller.move(position.index, 0)
                break
              case 'last':
                controller.move(position.index, controller.length.value - 1)
            }
          },
          canMove: (direction: MovableDirection): Signal<boolean> => {
            const result = (() => {
              switch (direction) {
                case 'up': {
                  return signal(position.index > 0)
                }
                case 'down': {
                  return controller.length.map(v => position.index < v - 1)
                }
              }
            })()
            disposables.push(() => result.dispose())
            return result
          },
          cannotMove: (direction: MovableDirection): Signal<boolean> => {
            const result = (() => {
              switch (direction) {
                case 'up': {
                  return signal(position.index === 0)
                }
                case 'down': {
                  return controller.length.map(v => position.index === v - 1)
                }
              }
            })()
            disposables.push(() => result.dispose())
            return result
          },
        })
      )
    },
    separator
  )
}
