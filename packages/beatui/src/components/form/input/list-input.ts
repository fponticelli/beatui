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

export type ListInputPayload<T> = {
  list: ArrayController<T[]>
  item: Controller<T>
  position: ElementPosition
  remove: () => void
  move: (direction: MoveDirection) => void
  canMove: (direction: MovableDirection) => Signal<boolean>
  cannotMove: (direction: MovableDirection) => Signal<boolean>
}

export type MoveDirection = 'up' | 'down' | 'first' | 'last'
export type MovableDirection = 'up' | 'down'

export function ListInput<T>(
  controller: ArrayController<T[]>,
  element: (payload: ListInputPayload<T>) => TNode,
  separator?: (pos: ElementPosition) => TNode
) {
  const length = controller.length.map(v => v)
  return Fragment(
    OnDispose(() => length.dispose()),
    Repeat(
      length,
      position => {
        const item = controller.item(position.index)
        const disposables = [] as (() => void)[]
        return Fragment(
          OnDispose(() => {
            item.dispose()
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
  )
}
