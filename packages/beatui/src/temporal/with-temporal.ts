import { Task, TNode } from '@tempots/dom'
import { BeatUITemporal } from './types'
import { ensureTemporal } from './runtime'

export const WithTemporal = (
  render: (temporal: BeatUITemporal) => TNode
): TNode => Task(ensureTemporal, render)
