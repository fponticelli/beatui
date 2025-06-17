import { ElementPosition, Repeat, TNode } from '@tempots/dom'
import { ListController, ValueController } from './value-controller'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListControllerPayload<T extends any[]> = {
  list: ListController<T>
  item: ValueController<T[number]>
  position: ElementPosition
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ListControl<T extends any[]>(
  controller: ListController<T>,
  element: (payload: ListControllerPayload<T>) => TNode,
  separator?: (pos: ElementPosition) => TNode
) {
  controller.length.on(v => console.log(v))
  return Repeat(
    controller.length,
    position => {
      const item = controller.item(position.index)
      item.value.on(v => console.log(v))
      return element({
        list: controller,
        item,
        position,
      })
    },
    separator
  )
}
