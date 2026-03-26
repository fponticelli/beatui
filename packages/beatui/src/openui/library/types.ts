import type { z } from 'zod'
import type { TNode } from '@tempots/dom'

export interface ComponentNameChecker {
  has(name: string): boolean
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Zod uses `any` in ZodObject type param */
export interface DefinedComponent<
  T extends z.ZodObject<any> = z.ZodObject<any>,
> {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  name: string
  props: T
  description: string
  renderer: (props: z.infer<T>, children: TNode[]) => TNode
}

export interface PromptOptions {
  examples?: boolean
  additionalRules?: string[]
  groups?: ComponentGroup[]
}

export interface ComponentGroup {
  name: string
  description: string
  components: string[]
}

export interface Library extends ComponentNameChecker {
  readonly components: ReadonlyMap<string, DefinedComponent>
  readonly root: string | undefined
  get(name: string): DefinedComponent | undefined
  has(name: string): boolean
  prompt(options?: PromptOptions): string
  toJSONSchema(): Record<string, unknown>
  extend(config: { components?: DefinedComponent[]; root?: string }): Library
}
