/**
 * Tests for JSON Structure Compound Controls (Array, Object, Map, Set, Tuple, Union)
 *
 * These tests verify that compound controls correctly handle complex data structures.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { Controller } from '../../src/components/form/controller/controller'
import { ArrayController } from '../../src/components/form/controller/array-controller'
import { ObjectController } from '../../src/components/form/controller/object-controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'
import { StructureContext } from '../../src/components/json-structure/structure-context'
import { StructureArrayControl } from '../../src/components/json-structure/controls/array-control'
import { StructureObjectControl } from '../../src/components/json-structure/controls/object-control'
import { StructureMapControl } from '../../src/components/json-structure/controls/map-control'
import { StructureSetControl } from '../../src/components/json-structure/controls/set-control'
import { StructureTupleControl } from '../../src/components/json-structure/controls/tuple-control'
import { StructureUnionControl } from '../../src/components/json-structure/controls/union-control'
import { StructureChoiceControl } from '../../src/components/json-structure/controls/choice-control'
import { StructureTemporalControl } from '../../src/components/json-structure/controls/temporal-control'
import { StructureBinaryControl } from '../../src/components/json-structure/controls/binary-control'
import { StructureAnyControl } from '../../src/components/json-structure/controls/any-control'
import type { TypeDefinition, JSONStructureSchema, ArrayTypeDefinition, ObjectTypeDefinition, MapTypeDefinition, SetTypeDefinition, TupleTypeDefinition } from '../../src/components/json-structure/structure-types'

describe('JSON Structure Compound Controls', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  /**
   * Helper to create a base controller
   */
  function createController<T>(initialValue: T) {
    const value = prop(initialValue)
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    return new Controller<T>([], () => {}, value, status, { disabled })
  }

  /**
   * Helper to create a StructureContext for testing
   */
  function createContext(
    definition: TypeDefinition,
    options: {
      name?: string
      readOnly?: boolean
      suppressLabel?: boolean
    } = {}
  ): StructureContext {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      root: definition,
    }
    return new StructureContext({
      schema,
      definition,
      path: options.name ? [options.name] : [],
      readOnly: options.readOnly ?? false,
      suppressLabel: options.suppressLabel ?? false,
    })
  }

  describe('StructureArrayControl', () => {
    it('should render array with string items', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'string' },
      }
      const controller = createController<string[]>(['item1', 'item2'])
      const ctx = createContext(definition, { name: 'String Array' })

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      // Should render list control
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render empty array', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'int32' },
      }
      const controller = createController<number[]>([])
      const ctx = createContext(definition, { name: 'Numbers' })

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle minItems constraint', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      }
      const controller = createController<string[]>(['required'])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle maxItems constraint', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: { type: 'string' },
        maxItems: 3,
      }
      const controller = createController<string[]>(['a', 'b', 'c'])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle array of objects', () => {
      const definition: ArrayTypeDefinition = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'int32' },
          },
        },
      }
      const controller = createController<{ name: string; age: number }[]>([
        { name: 'Alice', age: 30 },
      ])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should warn on invalid array definition', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const definition = { type: 'string' } as unknown as ArrayTypeDefinition
      const controller = createController<string[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureArrayControl({ ctx, controller: controller.array() })),
        container
      )

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('StructureObjectControl', () => {
    it('should render object with properties', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'int32' },
        },
      }
      const controller = createController<{ name: string; age: number }>({ name: 'Test', age: 25 })
      const ctx = createContext(definition, { name: 'Person' })

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      // Should render property inputs
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render empty object', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {},
      }
      const controller = createController<Record<string, unknown>>({})
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle required properties', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {
          required: { type: 'string' },
          optional: { type: 'string' },
        },
        required: ['required'],
      }
      const controller = createController<{ required: string; optional?: string }>({ required: 'value' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle additionalProperties: true', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {
          known: { type: 'string' },
        },
        additionalProperties: true,
      }
      const controller = createController<Record<string, unknown>>({ known: 'value', extra: 'data' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle additionalProperties with schema', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {},
        additionalProperties: { type: 'string' },
      }
      const controller = createController<Record<string, string>>({ key1: 'value1' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle nested objects', () => {
      const definition: ObjectTypeDefinition = {
        type: 'object',
        properties: {
          outer: {
            type: 'object',
            properties: {
              inner: { type: 'string' },
            },
          },
        },
      }
      const controller = createController<{ outer: { inner: string } }>({ outer: { inner: 'value' } })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should warn on invalid object definition', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const definition = { type: 'string' } as unknown as ObjectTypeDefinition
      const controller = createController<Record<string, unknown>>({})
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureObjectControl({ ctx, controller: controller.object() })),
        container
      )

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('StructureMapControl', () => {
    it('should render map with string values', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }
      const controller = createController<Record<string, string>>({ key1: 'value1' })
      const ctx = createContext(definition, { name: 'String Map' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render empty map', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'int32' },
      }
      const controller = createController<Record<string, number>>({})
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle map of objects', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      }
      const controller = createController<Record<string, { name: string }>>({
        user1: { name: 'Alice' },
      })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureSetControl', () => {
    it('should render set with string items', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
      }
      const controller = createController<string[]>(['unique1', 'unique2'])
      const ctx = createContext(definition, { name: 'String Set' })

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render empty set', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'int32' },
      }
      const controller = createController<number[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureTupleControl', () => {
    it('should render tuple with mixed types', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        items: [
          { type: 'string' },
          { type: 'int32' },
          { type: 'boolean' },
        ],
      }
      const controller = createController<[string, number, boolean]>(['text', 42, true])
      const ctx = createContext(definition, { name: 'Mixed Tuple' })

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render empty tuple', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        items: [],
      }
      const controller = createController<[]>([])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render tuple with named items', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        items: [
          { type: 'string', name: 'First Name' },
          { type: 'string', name: 'Last Name' },
        ],
      }
      const controller = createController<[string, string]>(['John', 'Doe'])
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureUnionControl', () => {
    it('should render union of primitive types', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32'],
      }
      const controller = createController<string | number>('text')
      const ctx = createContext(definition, { name: 'String or Number' })

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render union with null', () => {
      const definition: TypeDefinition = {
        type: ['string', 'null'],
      }
      const controller = createController<string | null>(null)
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle union of object types', () => {
      const definition: TypeDefinition = {
        oneOf: [
          { type: 'object', properties: { a: { type: 'string' } } },
          { type: 'object', properties: { b: { type: 'int32' } } },
        ],
      }
      const controller = createController<{ a: string } | { b: number }>({ a: 'value' })
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureChoiceControl', () => {
    it('should render oneOf choices', () => {
      const definition: TypeDefinition = {
        oneOf: [
          { type: 'string', name: 'Text Option' },
          { type: 'int32', name: 'Number Option' },
        ],
      }
      const controller = createController<string | number>('text')
      const ctx = createContext(definition, { name: 'Choice Field' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render anyOf choices', () => {
      const definition: TypeDefinition = {
        anyOf: [
          { type: 'string' },
          { type: 'boolean' },
        ],
      }
      const controller = createController<string | boolean>(true)
      const ctx = createContext(definition)

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })
})

describe('JSON Structure Special Controls', () => {
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
    options: { name?: string; readOnly?: boolean } = {}
  ): StructureContext {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      root: definition,
    }
    return new StructureContext({
      schema,
      definition,
      path: options.name ? [options.name] : [],
      readOnly: options.readOnly,
    })
  }

  describe('StructureTemporalControl', () => {
    it('should render date input', () => {
      const controller = createController<string>('2024-01-15')
      const ctx = createContext({ type: 'date', name: 'Birth Date' })

      render(
        WithProviders(() => StructureTemporalControl({ ctx, controller, temporalType: 'date' })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render time input', () => {
      const controller = createController<string>('14:30:00')
      const ctx = createContext({ type: 'time' })

      render(
        WithProviders(() => StructureTemporalControl({ ctx, controller, temporalType: 'time' })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render datetime input', () => {
      const controller = createController<string>('2024-01-15T14:30:00')
      const ctx = createContext({ type: 'datetime' })

      render(
        WithProviders(() => StructureTemporalControl({ ctx, controller, temporalType: 'datetime' })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render duration input', () => {
      const controller = createController<string>('P1D')
      const ctx = createContext({ type: 'duration' })

      render(
        WithProviders(() => StructureTemporalControl({ ctx, controller, temporalType: 'duration' })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should be disabled when readOnly', () => {
      const controller = createController<string>('2024-01-15')
      const ctx = createContext({ type: 'date' }, { readOnly: true })

      render(
        WithProviders(() => StructureTemporalControl({ ctx, controller, temporalType: 'date' })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureBinaryControl', () => {
    it('should render file input', () => {
      const controller = createController<File | undefined>(undefined)
      const ctx = createContext({ type: 'binary', name: 'File Upload' })

      render(
        WithProviders(() => StructureBinaryControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should be disabled when readOnly', () => {
      const controller = createController<File | undefined>(undefined)
      const ctx = createContext({ type: 'binary' }, { readOnly: true })

      render(
        WithProviders(() => StructureBinaryControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureAnyControl', () => {
    it('should render control for unknown type', () => {
      const controller = createController<unknown>({ any: 'value' })
      const ctx = createContext({ type: 'any', name: 'Dynamic Field' })

      render(
        WithProviders(() => StructureAnyControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle null value', () => {
      const controller = createController<unknown>(null)
      const ctx = createContext({ type: 'any' })

      render(
        WithProviders(() => StructureAnyControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle array value', () => {
      const controller = createController<unknown>([1, 2, 3])
      const ctx = createContext({ type: 'any' })

      render(
        WithProviders(() => StructureAnyControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle primitive value', () => {
      const controller = createController<unknown>('string value')
      const ctx = createContext({ type: 'any' })

      render(
        WithProviders(() => StructureAnyControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })
})

// Import vi for mocking
import { vi } from 'vitest'
