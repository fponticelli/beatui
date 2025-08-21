import { TNode } from '@tempots/dom'
import type { ControlOptions } from '../form/control/control-options'
import { createControl } from '../form/control/control-factory'
import type { MilkdownInputOptions } from './milkdown-input'
import { MilkdownInput } from './milkdown-input'

export type MilkdownControlOptions = ControlOptions<string> &
  Omit<MilkdownInputOptions, 'value' | 'onChange' | 'onBlur'>

export const MilkdownControl = (
  options: MilkdownControlOptions,
  ...children: TNode[]
) => {
  const Control = createControl<string>(MilkdownInput)
  return Control(options, ...children)
}
