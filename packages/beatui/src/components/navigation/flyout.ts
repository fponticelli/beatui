import { TNode, Value } from '@tempots/dom'
import { Placement, PopOver } from '@tempots/ui'

export type FlyoutOptions = {
  closable: Value<boolean>
  placement: Value<Placement>
  offset: Value<Placement>
}

export function Flyout(
  fn: (open: (options: FlyoutOptions) => void, close: () => void) => TNode
): TNode {
  const disposables: (() => void)[] = []
  const close = () => {
    disposables.forEach(dispose => dispose())
  }
  const open = ({ closable, placement, offset }: FlyoutOptions) => {}
  return PopOver((openPopover, closePopover) => fn(open, close))
}
