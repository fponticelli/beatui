import {
  ElementPosition,
  Fragment,
  OnDispose,
  Repeat,
  signal,
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
  move: (direction: MoveDirection) => void
  canMove: (direction: MoveDirection) => Signal<boolean>
  cannotMove: (direction: MoveDirection) => Signal<boolean>
}

export type MoveDirection = 'up' | 'down' | 'first' | 'last'

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
      const disposables = [] as (() => void)[]
      const signalCache = new Map<string, Signal<boolean>>()
      return Fragment(
        OnDispose(() => {
          item.dispose()
          disposables.forEach(dispose => dispose())
          // Clean up signal cache
          signalCache.forEach(signal => signal.dispose())
          signalCache.clear()
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
          canMove: (direction: MoveDirection): Signal<boolean> => {
            // Cache the signals to prevent recreation on each call
            const cacheKey = `canMove_${direction}`
            if (signalCache.has(cacheKey)) {
              return signalCache.get(cacheKey)!
            }

            const result = (() => {
              switch (direction) {
                case 'up': {
                  return signal(position.index > 0)
                }
                case 'down': {
                  return controller.length.map(v => position.index < v - 1)
                }
                case 'first': {
                  return signal(position.index !== 0)
                }
                case 'last': {
                  return controller.length.map(v => position.index !== v - 1)
                }
              }
            })()

            signalCache.set(cacheKey, result)
            disposables.push(() => result.dispose())
            return result
          },
          cannotMove: (direction: MoveDirection): Signal<boolean> => {
            // Cache the signals to prevent recreation on each call
            const cacheKey = `cannotMove_${direction}`
            if (signalCache.has(cacheKey)) {
              return signalCache.get(cacheKey)!
            }

            const result = (() => {
              switch (direction) {
                case 'up': {
                  return signal(position.index === 0)
                }
                case 'down': {
                  return controller.length.map(v => position.index === v - 1)
                }
                case 'first': {
                  return signal(position.index === 0)
                }
                case 'last': {
                  return controller.length.map(v => position.index === v - 1)
                }
              }
            })()

            signalCache.set(cacheKey, result)
            disposables.push(() => result.dispose())
            return result
          },
        })
      )
    },
    separator
  )
}
