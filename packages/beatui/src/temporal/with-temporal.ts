import { Renderable, Task, TNode } from '@tempots/dom'
import { BeatUITemporal } from './types'
import { ensureTemporal } from './runtime'

export const WithTemporal = (
  render: (temporal: BeatUITemporal) => TNode
): Renderable => Task(ensureTemporal, render)
