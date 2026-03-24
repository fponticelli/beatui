import { z } from 'zod'
import { TNode } from '@tempots/dom'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyZodObject = z.ZodObject<any>

/**
 * A registered component definition for use with OpenUI Lang.
 */
export interface ComponentDefinition<TSchema extends AnyZodObject> {
  /** The display name of the component */
  name: string
  /** Zod schema describing the component's props */
  props: TSchema
  /** Human-readable description of what the component does */
  description: string
  /** Function that renders the component given resolved props */
  renderer: (props: z.infer<TSchema>) => TNode
}

/**
 * Opaque component definition type for storing in mixed-type arrays.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponentDefinition = ComponentDefinition<AnyZodObject>

/**
 * Define a component for the OpenUI library.
 *
 * @param definition - The component definition with name, schema, description, and renderer
 * @returns The component definition (pass into a registry array)
 *
 * @example
 * ```ts
 * defineComponent({
 *   name: 'Button',
 *   props: z.object({
 *     label: z.string(),
 *     variant: z.enum(['filled', 'outline']).optional(),
 *   }),
 *   description: 'An interactive button.',
 *   renderer: (props) => Button({ variant: props.variant }, props.label),
 * })
 * ```
 */
export function defineComponent<TSchema extends AnyZodObject>(
  definition: ComponentDefinition<TSchema>
): AnyComponentDefinition {
  return definition as AnyComponentDefinition
}
