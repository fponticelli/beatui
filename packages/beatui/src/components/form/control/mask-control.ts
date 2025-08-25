import { TNode } from '@tempots/dom'
import type { ControlOptions } from './control-options'
import { createControl } from './control-factory'
import type { MaskInputOptions } from '../input/mask-input'
import { MaskInput } from '../input/mask-input'
import type { InputOptions } from '../input/input-options'

export type MaskControlOptions = ControlOptions<string> &
  Omit<MaskInputOptions, 'value' | 'onChange' | 'onBlur'>

// Adapter to satisfy createControl's InputComponent typing (expects only InputOptions<string>)
const MaskInputAdapter = (options: InputOptions<string>) =>
  MaskInput(options as unknown as MaskInputOptions)

export const MaskControl = (
  options: MaskControlOptions,
  ...children: TNode[]
) => {
  const Control = createControl<string>(MaskInputAdapter)
  return Control(options, ...children)
}
