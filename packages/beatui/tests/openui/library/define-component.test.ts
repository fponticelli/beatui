/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { defineComponent } from '../../../src/openui/library/define-component'

describe('defineComponent', () => {
  it('creates a DefinedComponent with correct fields', () => {
    const props = z.object({
      label: z.string(),
      count: z.number(),
    })

    const renderer = (_props: z.infer<typeof props>, _children: any[]) => null

    const comp = defineComponent({
      name: 'MyComponent',
      props,
      description: 'A test component',
      renderer,
    })

    expect(comp.name).toBe('MyComponent')
    expect(comp.description).toBe('A test component')
    expect(comp.props).toBe(props)
    expect(comp.renderer).toBe(renderer)
  })

  it('returns a frozen object', () => {
    const props = z.object({ x: z.string() })
    const comp = defineComponent({
      name: 'Frozen',
      props,
      description: 'frozen test',
      renderer: () => null,
    })

    expect(Object.isFrozen(comp)).toBe(true)
  })

  it('preserves Zod schema key order', () => {
    const props = z.object({
      first: z.string(),
      second: z.number(),
      third: z.boolean(),
    })

    const comp = defineComponent({
      name: 'OrderTest',
      props,
      description: 'key order test',
      renderer: () => null,
    })

    const keys = Object.keys(comp.props.shape)
    expect(keys).toEqual(['first', 'second', 'third'])
  })

  it('handles optional props in schema', () => {
    const props = z.object({
      required: z.string(),
      optional: z.optional(z.number()),
    })

    const comp = defineComponent({
      name: 'OptionalTest',
      props,
      description: 'optional props test',
      renderer: () => null,
    })

    expect(comp.props.shape.required).toBeDefined()
    expect(comp.props.shape.optional).toBeDefined()
  })

  it('handles enum props in schema', () => {
    const props = z.object({
      variant: z.enum(['primary', 'secondary', 'danger']),
    })

    const comp = defineComponent({
      name: 'EnumTest',
      props,
      description: 'enum props test',
      renderer: () => null,
    })

    const variantDef = (comp.props.shape.variant as any)._def
    expect(variantDef.type).toBe('enum')
  })
})
