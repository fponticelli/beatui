import { TNode } from '@tempots/dom'
import { createControl } from '../form/control/control-factory'
import type { MonacoEditorInputOptions } from './monaco-editor-input'
import { MonacoEditorInput } from './monaco-editor-input'
import type { ControlOptions } from '../form/control/control-options'

export type MonacoEditorControlOptions = ControlOptions<string> &
  Omit<MonacoEditorInputOptions, 'value' | 'onChange' | 'onBlur'>

export const MonacoEditorControl = (
  options: MonacoEditorControlOptions,
  ...children: TNode[]
) => {
  const Control = createControl<string>(MonacoEditorInput)
  return Control(options, ...children)
}
