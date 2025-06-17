import {
  ElementPosition,
  Fragment,
  OnDispose,
  Repeat,
  Signal,
  TNode,
} from '@tempots/dom'
import { ListController, ValueController } from './value-controller'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListControllerPayload<T extends any[]> = {
  list: ListController<T>
  item: ValueController<T[number]>
  position: ElementPosition
  remove: () => void
  moveUp: () => void
  moveDown: () => void
  moveTo: (index: number) => void
  moveFirst: () => void
  moveLast: () => void
  canMoveUp: boolean
  canMoveDown: Signal<boolean>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ListControl<T extends any[]>(
  controller: ListController<T>,
  element: (payload: ListControllerPayload<T>) => TNode,
  separator?: (pos: ElementPosition) => TNode
) {
  return Repeat(
    controller.length,
    position => {
      const item = controller.item(position.index)
      let _canMoveDown: Signal<boolean> | undefined
      let _canMoveLast: Signal<boolean> | undefined
      return Fragment(
        OnDispose(() => {
          _canMoveDown?.dispose()
          _canMoveLast?.dispose()
        }),
        element({
          list: controller,
          item,
          position,
          remove: () => controller.removeAt(position.index),
          moveUp: () => {
            if (position.index === 0) return
            controller.move(position.index, position.index - 1)
          },
          moveDown: () => {
            if (position.index === controller.length.value - 1) return
            controller.move(position.index, position.index + 1)
          },
          moveTo: (index: number) => {
            if (index < 0 || index >= controller.length.value) return
            controller.move(position.index, index)
          },
          moveFirst: () => {
            controller.move(position.index, 0)
          },
          moveLast: () => {
            controller.move(position.index, controller.length.value - 1)
          },
          get canMoveUp() {
            return position.index > 0
          },
          get canMoveDown() {
            if (_canMoveDown) return _canMoveDown
            return (_canMoveDown = controller.length.map(
              v => position.index < v - 1
            ))
          },
        })
      )
    },
    separator
  )
}
