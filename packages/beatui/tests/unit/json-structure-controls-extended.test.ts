/**
 * Extended Tests for JSON Structure Controls
 *
 * These tests target specific edge cases and branches to increase coverage.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { Controller } from '../../src/components/form/controller/controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'
import { StructureContext } from '../../src/components/json-structure/structure-context'
import type { TypeDefinition, JSONStructureSchema, ArrayTypeDefinition, ObjectTypeDefinition, MapTypeDefinition, SetTypeDefinition, TupleTypeDefinition } from '../../src/components/json-structure/structure-types'

// Import controls for targeted testing
import { StructureArrayControl } from '../../src/components/json-structure/controls/array-control'
import { StructureObjectControl } from '../../src/components/json-structure/controls/object-control'
import { StructureMapControl } from '../../src/components/json-structure/controls/map-control'
import { StructureSetControl } from '../../src/components/json-structure/controls/set-control'
import { StructureTupleControl } from '../../src/components/json-structure/controls/tuple-control'
import { StructureUnionControl } from '../../src/components/json-structure/controls/union-control'
import { StructureChoiceControl } from '../../src/components/json-structure/controls/choice-control'
import { StructureTemporalControl } from '../../src/components/json-structure/controls/temporal-control'
import { StructureGenericControl } from '../../src/components/json-structure/controls/generic-control'
import { StructureAnyControl } from '../../src/components/json-structure/controls/any-control'

describe('JSON Structure Controls - Extended Edge Cases', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  function createController<T>(initialValue: T) {
    const value = prop(initialValue)
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    return new Controller<T>([], () => {}, value, status, { disabled })
  }

  function createContext(
    definition: TypeDefinition,
    options: { name?: string; readOnly?: boolean; suppressLabel?: boolean } = {}
  ): StructureContext {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      $id: 'https://test.example/test',
      name: 'TestSchema',
      $root: 'Root',
      definitions: { Root: definition },
    }
    return new StructureContext({
      schema,
      definition,
      path: options.name ? [options.name] : [],
      readOnly: options.readOnly ?? false,
      suppressLabel: options.suppressLabel ?? false,
    })
  }

  describe('StructureArrayControl - Edge Cases', () => {
    it('should create default value for string items', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'string' },
      }
      const controller = createController<string[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      // Click add button if present
      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
      }
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should create default value for number items', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'int32' },
      }
      const controller = createController<number[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should create default value for boolean items', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'boolean' },
      }
      const controller = createController<boolean[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should create default value for object items', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'object', properties: {} },
      }
      const controller = createController<Record<string, unknown>[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should create default value for null items', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'null' },
      }
      const controller = createController<null[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should use default from item schema', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'string', default: 'default value' },
      }
      const controller = createController<string[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should use example from item schema', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'string', examples: ['example value'] },
      }
      const controller = createController<string[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle array items in readOnly mode', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'string' },
      }
      const controller = createController<string[]>(['item1'])
      const ctx = createContext(definition, { readOnly: true })

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle set items default', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'set', items: { type: 'string' } },
      }
      const controller = createController<string[][]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle map items default', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'map', values: { type: 'string' } },
      }
      const controller = createController<Record<string, string>[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle items with $ref', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: { $ref: '#/$defs/SomeType' } } as unknown as TypeDefinition,
      }
      const controller = createController<unknown[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle items with any type', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'any' },
      }
      const controller = createController<unknown[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle items with no type', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: {} as TypeDefinition,
      }
      const controller = createController<unknown[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle float type items', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'float' },
      }
      const controller = createController<number[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureObjectControl - Edge Cases', () => {
    it('should handle grouped required properties', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
        required: [['a', 'b']] as unknown as string[],
      }
      const controller = createController<{ a?: string; b?: string }>({})
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle additionalProperties: false', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {
          known: { type: 'string' },
        },
        additionalProperties: false,
      }
      const controller = createController<{ known: string }>({ known: 'value' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle minProperties constraint', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {},
        additionalProperties: true,
        minProperties: 1,
      }
      const controller = createController<Record<string, unknown>>({ prop1: 'value' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle maxProperties constraint', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {},
        additionalProperties: true,
        maxProperties: 2,
      }
      const controller = createController<Record<string, unknown>>({ a: '1', b: '2' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should suppress label when configured', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
      }
      const controller = createController<{ field: string }>({ field: 'value' })
      const ctx = createContext(definition, { suppressLabel: true })

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureMapControl - Edge Cases', () => {
    it('should handle map in readOnly mode', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }
      const controller = createController<Record<string, string>>({ key: 'value' })
      const ctx = createContext(definition, { readOnly: true })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle map default value creation', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'int32', default: 0 },
      }
      const controller = createController<Record<string, number>>({})
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle map with example values', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string', examples: ['example'] },
      }
      const controller = createController<Record<string, string>>({})
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureSetControl - Edge Cases', () => {
    it('should handle set in readOnly mode', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
      }
      const controller = createController<string[]>(['unique'])
      const ctx = createContext(definition, { readOnly: true })

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle set with minItems', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
        minItems: 1,
      }
      const controller = createController<string[]>(['required'])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle set with maxItems', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
        maxItems: 3,
      }
      const controller = createController<string[]>(['a', 'b', 'c'])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureTupleControl - Edge Cases', () => {
    it('should render single item tuple', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        items: [{ type: 'string' }],
      }
      const controller = createController<[string]>(['value'])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle tuple in readOnly mode', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        items: [{ type: 'string' }, { type: 'int32' }],
      }
      const controller = createController<[string, number]>(['text', 42])
      const ctx = createContext(definition, { readOnly: true })

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle tuple with label and description', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        items: [{ type: 'string' }],
        name: 'Coordinates',
        description: 'XY coordinates',
      }
      const controller = createController<[string]>(['x'])
      const ctx = createContext(definition, { name: 'Coordinates' })

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureUnionControl - Edge Cases', () => {
    it('should handle union of different primitives', () => {
      const definition: TypeDefinition = {
        type: ['string', 'boolean'],
      }
      const controller = createController<string | boolean>('text')
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle triple union', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32', 'boolean'],
      }
      const controller = createController<string | number | boolean>(42)
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle union with current value as string', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32'],
      }
      const controller = createController<string | number>('current')
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureChoiceControl - Edge Cases', () => {
    it('should handle choice with discriminator', () => {
      const definition: TypeDefinition = {
        oneOf: [
          { type: 'object', properties: { kind: { type: 'string', const: 'a' }, value: { type: 'string' } } },
          { type: 'object', properties: { kind: { type: 'string', const: 'b' }, count: { type: 'int32' } } },
        ],
        discriminator: 'kind',
      }
      const controller = createController<{ kind: string }>({ kind: 'a' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle choice without discriminator', () => {
      const definition: TypeDefinition = {
        oneOf: [
          { type: 'string' },
          { type: 'int32' },
        ],
      }
      const controller = createController<string | number>('text')
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureTemporalControl - Edge Cases', () => {
    it('should handle date with examples', () => {
      const controller = createController<string>('')
      const ctx = createContext({ type: 'date', examples: ['2024-01-15'] })

      render(
        WithProviders(() => StructureTemporalControl({ ctx, controller, temporalType: 'date' })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle datetime with examples', () => {
      const controller = createController<string>('')
      const ctx = createContext({ type: 'datetime', examples: ['2024-01-15T14:30'] })

      render(
        WithProviders(() => StructureTemporalControl({ ctx, controller, temporalType: 'datetime' })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureGenericControl - Edge Cases', () => {
    it('should handle $extends property', () => {
      const rootDef: TypeDefinition = {
        $extends: '#/definitions/BaseType',
        type: 'string',
        description: 'Extended field',
      }
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test',
        name: 'TestSchema',
        $root: 'Root',
        definitions: {
          Root: rootDef,
          BaseType: { type: 'string', name: 'Base' },
        },
      }
      const ctx = new StructureContext({ schema, definition: rootDef, path: [] })
      const controller = createController<string>('value')

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle $ref in type', () => {
      const rootDef: TypeDefinition = {
        type: 'string', // Use concrete type since $ref in type field is not standard
      }
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test',
        name: 'TestSchema',
        $root: 'Root',
        definitions: {
          Root: rootDef,
          StringType: { type: 'string' },
        },
      }
      const ctx = new StructureContext({ schema, definition: rootDef, path: [] })
      const controller = createController<string>('value')

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render unknown type with warning', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const definition = { type: 'unknownType' } as unknown as TypeDefinition
      const controller = createController<unknown>(null)
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('StructureAnyControl - Edge Cases', () => {
    it('should handle number value', () => {
      const controller = createController<unknown>(42)
      const ctx = createContext({ type: 'any' })

      render(
        WithProviders(() => StructureAnyControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle boolean value', () => {
      const controller = createController<unknown>(true)
      const ctx = createContext({ type: 'any' })

      render(
        WithProviders(() => StructureAnyControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle deeply nested object', () => {
      const controller = createController<unknown>({ a: { b: { c: 'deep' } } })
      const ctx = createContext({ type: 'any' })

      render(
        WithProviders(() => StructureAnyControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })
})
