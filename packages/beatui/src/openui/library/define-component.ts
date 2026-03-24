import type { z } from 'zod'
import type { TNode } from '@tempots/dom'
import type { DefinedComponent } from './types.js'

export interface DefineComponentConfig<T extends z.ZodObject<any>> {
  name: string
  props: T
  description: string
  renderer: (props: z.infer<T>, children: TNode[]) => TNode
}

/**
 * Define a component for use in OpenUI Lang.
 *
 * Zod schema key order = positional arg order (this is an explicit contract).
 */
export function defineComponent<T extends z.ZodObject<any>>(
  config: DefineComponentConfig<T>
): DefinedComponent<T> {
  return Object.freeze({
    name: config.name,
    props: config.props,
    description: config.description,
    renderer: config.renderer,
  })
}
