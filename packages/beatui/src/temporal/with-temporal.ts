import { Renderable, Task, TNode } from '@tempots/dom'
import { BeatUITemporal } from './types'
import { ensureTemporal } from './runtime'

export type WithTemporalOptions = {
  pending?: () => TNode
  error?: (error: unknown) => TNode
}

export const WithTemporal = (
  render: (temporal: BeatUITemporal) => TNode,
  options?: WithTemporalOptions
): Renderable =>
  options
    ? Task(ensureTemporal, {
        then: render,
        pending: options.pending,
        error: options.error,
      })
    : Task(ensureTemporal, render)
