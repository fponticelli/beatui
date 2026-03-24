import type { z } from 'zod'
import type { Renderable } from '@tempots/dom'

export interface ComponentNameChecker {
  has(name: string): boolean
}

export interface DefinedComponent<T extends z.ZodObject<any> = z.ZodObject<any>> {
  name: string
  props: T
  description: string
  renderer: (props: z.infer<T>, children: Renderable[]) => Renderable
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
  toJSONSchema(): object
  extend(config: { components?: DefinedComponent[]; root?: string }): Library
}
