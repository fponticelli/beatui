import { TNode } from '@tempots/dom'

export type MenuOptions = {
  // if undefined it will be the element that opened the menu
  anchor?: string | HTMLElement
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Menu(
  fn: (open: (options: MenuOptions) => void) => TNode,
  close: () => void
) {
  return fn(() => {})
}
