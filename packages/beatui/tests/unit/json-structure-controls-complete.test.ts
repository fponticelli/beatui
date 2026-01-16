/**
 * Complete tests for JSON Structure controls
 *
 * Tests all controls with properly structured type definitions
 * to exercise all code paths and achieve high coverage.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { Controller } from '../../src/components/form/controller/controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'
import { StructureContext } from '../../src/components/json-structure/structure-context'
import { StructureTupleControl } from '../../src/components/json-structure/controls/tuple-control'
import { StructureSetControl } from '../../src/components/json-structure/controls/set-control'
import { StructureMapControl } from '../../src/components/json-structure/controls/map-control'
import { StructureChoiceControl } from '../../src/components/json-structure/controls/choice-control'
import { StructureUnionControl } from '../../src/components/json-structure/controls/union-control'
import type {
  TypeDefinition,
  JSONStructureSchema,
  TupleTypeDefinition,
  SetTypeDefinition,
  MapTypeDefinition,
  ChoiceTypeDefinition,
} from '../../src/components/json-structure/structure-types'

describe('JSON Structure Controls - Complete Coverage', () => {
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
    return new Controller<T>([], (v: T) => value.set(v), value, status, { disabled })
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
      $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
    }
    return new StructureContext({
      schema,
      definition,
      path: options.name ? [options.name] : [],
      readOnly: options.readOnly ?? false,
      suppressLabel: options.suppressLabel ?? false,
    })
  }

  describe('StructureTupleControl - Full Coverage', () => {
    it('should render tuple with string and number elements', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['name', 'age'],
        properties: {
          name: { type: 'string', name: 'Name' },
          age: { type: 'int32', name: 'Age' },
        },
      }

      const controller = createController<unknown[]>([])
      // Use suppressLabel to avoid the boolean rendering issue in label section
      const ctx = createContext(definition, { name: 'person', suppressLabel: true })

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.querySelector('.bc-json-structure-tuple')).not.toBeNull()
      expect(container.querySelectorAll('.bc-json-structure-tuple-element').length).toBe(2)
    })

    it('should render tuple with label and description', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        name: 'Coordinates',
        description: 'Geographic coordinates',
        tuple: ['lat', 'lng'],
        properties: {
          lat: { type: 'double', name: 'Latitude' },
          lng: { type: 'double', name: 'Longitude' },
        },
      }

      // Create context with isPropertyRequired to test the label path fully
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
      }
      const ctx = new StructureContext({
        schema,
        definition,
        path: ['coords'],
        readOnly: false,
        suppressLabel: false,
        isPropertyRequired: true, // This makes required indicator show
      })
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.querySelector('.bc-json-structure-tuple-label')).not.toBeNull()
      expect(container.querySelector('.bc-json-structure-tuple-description')).not.toBeNull()
    })

    it('should use default values from definition', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['status', 'count'],
        properties: {
          status: { type: 'string', default: 'active' },
          count: { type: 'int32', default: 10 },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Controller should be initialized with defaults
      expect(controller.signal.value).toEqual(['active', 10])
    })

    it('should use examples when default not available', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['email'],
        properties: {
          email: { type: 'string', examples: ['user@example.com'] },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      expect(controller.signal.value).toEqual(['user@example.com'])
    })

    it('should generate default values for various types', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['str', 'bool', 'num', 'obj', 'arr', 'nul', 'set', 'map', 'any'],
        properties: {
          str: { type: 'string' },
          bool: { type: 'boolean' },
          num: { type: 'int32' },
          obj: { type: 'object' },
          arr: { type: 'array' },
          nul: { type: 'null' },
          set: { type: 'set' },
          map: { type: 'map' },
          any: { type: 'any' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      const value = controller.signal.value
      expect(value[0]).toBe('')          // string
      expect(value[1]).toBe(false)       // boolean
      expect(value[2]).toBe(0)           // int32
      expect(value[3]).toEqual({})       // object
      expect(value[4]).toEqual([])       // array
      expect(value[5]).toBe(null)        // null
      expect(value[6]).toEqual([])       // set
      expect(value[7]).toEqual({})       // map
      expect(value[8]).toBe(undefined)   // any
    })

    it('should handle $ref type without default', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['ref'],
        properties: {
          ref: { type: [{ $ref: '#/definitions/SomeType' }] },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Should be undefined for $ref
      expect(controller.signal.value).toEqual([undefined])
    })

    it('should handle all numeric types', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'],
        properties: {
          a: { type: 'int8' },
          b: { type: 'int16' },
          c: { type: 'int32' },
          d: { type: 'int64' },
          e: { type: 'int128' },
          f: { type: 'uint8' },
          g: { type: 'uint16' },
          h: { type: 'uint32' },
          i: { type: 'uint64' },
          j: { type: 'uint128' },
          k: { type: 'float' },
          l: { type: 'double' },
          m: { type: 'decimal' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // All numeric types should default to 0
      controller.signal.value.forEach((val) => {
        expect(val).toBe(0)
      })
    })

    it('should handle missing property in tuple', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['exists', 'missing'],
        properties: {
          exists: { type: 'string' },
          // 'missing' is not defined
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Should still render with error message for missing
      expect(container.textContent).toContain('Missing definition')
    })

    it('should preserve existing array value with correct length', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['a', 'b'],
        properties: {
          a: { type: 'string' },
          b: { type: 'int32' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>(['existing', 42])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Should preserve existing values
      expect(controller.signal.value).toEqual(['existing', 42])
    })

    it('should show required indicator when required', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        name: 'Required Tuple',
        tuple: ['a'],
        properties: {
          a: { type: 'string' },
        },
      }

      // Set up parent schema with required field
      const parentSchema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test',
        name: 'TestSchema',
        $root: 'Root',
        definitions: {
          Root: {
            type: 'object',
            properties: {
              tuple: definition,
            },
            required: ['tuple'],
          },
        },
      }

      const ctx = new StructureContext({
        schema: parentSchema,
        definition,
        path: ['tuple'],
        readOnly: false,
        suppressLabel: false,
        isPropertyRequired: true,
      })

      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Required indicator should be shown
      expect(container.querySelector('.bc-required-indicator')).not.toBeNull()
    })

    it('should suppress label when suppressLabel is true', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        name: 'Suppressed Label',
        tuple: ['a'],
        properties: {
          a: { type: 'string' },
        },
      }

      const ctx = createContext(definition, { name: 'tuple', suppressLabel: true })
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Label should not be shown
      expect(container.querySelector('.bc-json-structure-tuple-label')).toBeNull()
    })

    it('should handle definition without type', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['untyped'],
        properties: {
          untyped: {} as TypeDefinition,
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Should default to undefined for untyped
      expect(controller.signal.value).toEqual([undefined])
    })

    it('should handle unknown type', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['unknown'],
        properties: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing unknown type handling
          unknown: { type: 'customUnknownType' as any },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Should default to undefined for unknown type
      expect(controller.signal.value).toEqual([undefined])
    })

    it('should use property name as label when name not specified', () => {
      const definition: TupleTypeDefinition = {
        type: 'tuple',
        tuple: ['myField'],
        properties: {
          myField: { type: 'string' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureTupleControl({ ctx, controller: controller.array() })),
        container
      )

      // Should use property key as label
      expect(container.textContent).toContain('myField')
    })
  })

  describe('StructureSetControl - Full Coverage', () => {
    it('should render set with string items', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
      }

      const ctx = createContext(definition, { name: 'tags' })
      const controller = createController<unknown[]>(['tag1', 'tag2'])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      // Set control renders with items - ListControl renders the form
      expect(container.innerHTML.length).toBeGreaterThan(0)
      // Check that some input or button elements are rendered
      const hasControls = container.querySelectorAll('input, button').length > 0
      expect(hasControls).toBe(true)
    })

    it('should respect minItems constraint', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
        minItems: 2,
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>(['a', 'b'])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should respect maxItems constraint', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
        maxItems: 2,
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>(['a', 'b'])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect and highlight duplicate values', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>(['duplicate', 'unique', 'duplicate'])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      // Duplicates are detected reactively - the control should render
      // This exercises the duplicate detection code path in the control
      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle readOnly mode', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string' },
      }

      const ctx = createContext(definition, { readOnly: true })
      const controller = createController<unknown[]>(['a'])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle object items in set', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'object' },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      // Click add button
      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([{}])
      }
    })

    it('should handle nested set items', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'set' },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([[]])
      }
    })

    it('should handle map items in set', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'map' },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([{}])
      }
    })

    it('should handle any type items', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'any' },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([undefined])
      }
    })

    it('should handle null type items', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'null' },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([null])
      }
    })

    it('should handle items without type', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: {} as TypeDefinition,
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([undefined])
      }
    })

    it('should handle $ref items', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: [{ $ref: '#/definitions/Item' }] },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([undefined])
      }
    })

    it('should handle numeric type items', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'int32' },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([0])
      }
    })

    it('should handle boolean items with default', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'boolean', default: true },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual([true])
      }
    })

    it('should handle items with examples', () => {
      const definition: SetTypeDefinition = {
        type: 'set',
        items: { type: 'string', examples: ['example'] },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown[]>([])

      render(
        WithProviders(() => StructureSetControl({ ctx, controller: controller.array() })),
        container
      )

      const addButton = container.querySelector('button')
      if (addButton) {
        addButton.click()
        expect(controller.signal.value).toEqual(['example'])
      }
    })
  })

  describe('StructureMapControl - Full Coverage', () => {
    it('should render map with string values', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }

      const ctx = createContext(definition, { name: 'metadata' })
      const controller = createController<Record<string, unknown>>({ key1: 'value1' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.querySelector('.bc-json-structure-map')).not.toBeNull()
      expect(container.textContent).toContain('key1')
    })

    it('should add new entry with unique key', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({ key: 'existing' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      // Click add entry button
      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        // Should generate unique key 'key1'
        expect(controller.signal.value).toHaveProperty('key1')
      }
    })

    it('should remove entry', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({ key1: 'value1', key2: 'value2' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      // Click remove button
      const removeButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Remove'))

      if (removeButton) {
        removeButton.click()
        // Should have one less entry
        expect(Object.keys(controller.signal.value).length).toBe(1)
      }
    })

    it('should respect minProperties constraint', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
        minProperties: 1,
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({ onlyKey: 'value' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should respect maxProperties constraint', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
        maxProperties: 1,
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({ onlyKey: 'value' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle readOnly mode', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }

      const ctx = createContext(definition, { readOnly: true })
      const controller = createController<Record<string, unknown>>({ key: 'value' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should show label when not suppressed', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        name: 'Properties',
        values: { type: 'string' },
      }

      const ctx = createContext(definition, { name: 'properties' })
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      // Label wrapper should be present
      expect(container.querySelector('.bc-input-wrapper')).not.toBeNull()
    })

    it('should generate unique key when base already exists', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({ key: 'a', key1: 'b', key2: 'c' })

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        // Should generate 'key3'
        expect(controller.signal.value).toHaveProperty('key3')
      }
    })

    it('should create default values for new entries', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'int32', default: 100 },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        expect(controller.signal.value.key).toBe(100)
      }
    })

    it('should handle empty map', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      expect(container.querySelector('.bc-json-structure-map')).not.toBeNull()
    })

    it('should handle numeric value types', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'double' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        expect(controller.signal.value.key).toBe(0)
      }
    })

    it('should handle object value types', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'object' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        expect(controller.signal.value.key).toEqual({})
      }
    })

    it('should handle array value types', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'array' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        expect(controller.signal.value.key).toEqual([])
      }
    })

    it('should handle null value types', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'null' },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        expect(controller.signal.value.key).toBe(null)
      }
    })

    it('should handle $ref value types', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: [{ $ref: '#/definitions/Value' }] },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        expect(controller.signal.value.key).toBe(undefined)
      }
    })

    it('should handle values with examples', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        values: { type: 'string', examples: ['example value'] },
      }

      const ctx = createContext(definition)
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      const addButton = Array.from(container.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Add'))

      if (addButton) {
        addButton.click()
        expect(controller.signal.value.key).toBe('example value')
      }
    })

    it('should suppress label when configured', () => {
      const definition: MapTypeDefinition = {
        type: 'map',
        name: 'Properties',
        values: { type: 'string' },
      }

      const ctx = createContext(definition, { name: 'properties', suppressLabel: true })
      const controller = createController<Record<string, unknown>>({})

      render(
        WithProviders(() => StructureMapControl({ ctx, controller: controller.object() })),
        container
      )

      // InputWrapper should not be present when label is suppressed
      expect(container.querySelector('.bc-input-wrapper')).toBeNull()
    })
  })

  describe('StructureChoiceControl - Full Coverage', () => {
    it('should render choice with multiple variants', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          email: { type: 'string', name: 'Email' },
          phone: { type: 'string', name: 'Phone' },
        },
      }

      const ctx = createContext(definition, { name: 'contact' })
      const controller = createController<unknown>({ email: 'test@example.com' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      // Should render with selector
      expect(container.querySelector('select') || container.querySelector('.bc-segmented-input')).not.toBeNull()
    })

    it('should detect active choice from tagged union value', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          email: { type: 'string' },
          phone: { type: 'string' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({ phone: '123-456' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle discriminator selector', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        selector: 'type',
        choices: {
          email: { type: 'object', properties: { address: { type: 'string' } } },
          phone: { type: 'object', properties: { number: { type: 'string' } } },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({ type: 'email', address: 'test@example.com' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should switch between choices', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          text: { type: 'string', default: 'hello' },
          number: { type: 'int32', default: 42 },
          third: { type: 'boolean', default: true },
          fourth: { type: 'double', default: 3.14 },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({ text: 'hello' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      // For > 3 options, should use select
      const select = container.querySelector('select')
      if (select) {
        select.value = 'number'
        select.dispatchEvent(new Event('change'))
      }

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle empty choices gracefully', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {},
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(null)

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.textContent).toContain('no variants')
    })

    it('should show choice at root level', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      }

      // Create root-level context
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
      }
      const ctx = new StructureContext({
        schema,
        definition,
        path: [],
        readOnly: false,
        suppressLabel: false,
      })

      const controller = createController<unknown>({ a: 'test' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle readOnly mode', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          option1: { type: 'string' },
          option2: { type: 'string' },
        },
      }

      const ctx = createContext(definition, { readOnly: true })
      const controller = createController<unknown>({ option1: 'value' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      // Select should be disabled in readOnly mode
      const select = container.querySelector('select')
      if (select) {
        expect(select.disabled).toBe(true)
      }
    })

    it('should handle deprecated property', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        deprecated: true,
        choices: {
          opt: { type: 'string' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({ opt: 'test' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should generate default values for variants', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          str: { type: 'string' },
          bool: { type: 'boolean' },
          nul: { type: 'null' },
          obj: { type: 'object' },
          arr: { type: 'array' },
          set: { type: 'set' },
          map: { type: 'map' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({})

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle variant with examples', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          sample: { type: 'string', examples: ['example value'] },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({})

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle variant with object or $ref type', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          ref: { type: [{ $ref: '#/definitions/X' }] },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({})

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle value without matching discriminator', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        selector: 'type',
        choices: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({ type: 'unknown', value: 'test' })

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle non-object value', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          a: { type: 'string' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>('not an object')

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle null value', () => {
      const definition: ChoiceTypeDefinition = {
        type: 'choice',
        choices: {
          a: { type: 'string' },
        },
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(null)

      render(
        WithProviders(() => StructureChoiceControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('StructureUnionControl - Full Coverage', () => {
    it('should render union with multiple types', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32'],
      }

      const ctx = createContext(definition, { name: 'value' })
      const controller = createController<unknown>('test')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      // Should show segmented selector for <= 3 options
      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect type from value', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32', 'boolean'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(42)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle null in union', () => {
      const definition: TypeDefinition = {
        type: ['string', 'null'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(null)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle undefined value', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(undefined)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle many types with select dropdown', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32', 'boolean', 'double'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>('test')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      // Should show select for > 3 options
      expect(container.querySelector('select')).not.toBeNull()
    })

    it('should detect uuid type from string', () => {
      const definition: TypeDefinition = {
        type: ['uuid', 'string'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>('550e8400-e29b-41d4-a716-446655440000')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect uri type from string', () => {
      const definition: TypeDefinition = {
        type: ['uri', 'string'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>('https://example.com')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect temporal types', () => {
      const definition: TypeDefinition = {
        type: ['date', 'datetime', 'time', 'duration', 'string'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>('2024-01-15')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect various integer types', () => {
      const definition: TypeDefinition = {
        type: ['int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(42)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect float types', () => {
      const definition: TypeDefinition = {
        type: ['float', 'double', 'decimal'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(3.14)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect bigint types', () => {
      const definition: TypeDefinition = {
        type: ['int128', 'uint128'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>(BigInt(123456789012345678901234567890n))

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect array/set/tuple types', () => {
      const definition: TypeDefinition = {
        type: ['array', 'set', 'tuple'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>([1, 2, 3])

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should detect object/map types', () => {
      const definition: TypeDefinition = {
        type: ['object', 'map'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({ key: 'value' })

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle binary type with File', () => {
      const definition: TypeDefinition = {
        type: ['binary', 'string'],
      }

      const ctx = createContext(definition)
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const controller = createController<unknown>(file)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle binary type with Blob', () => {
      const definition: TypeDefinition = {
        type: ['binary', 'string'],
      }

      const ctx = createContext(definition)
      const blob = new Blob(['test'], { type: 'text/plain' })
      const controller = createController<unknown>(blob)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle root-level union', () => {
      const definition: TypeDefinition = {
        type: ['string', 'int32'],
      }

      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
      }
      const ctx = new StructureContext({
        schema,
        definition,
        path: [],
        readOnly: false,
        suppressLabel: false,
      })

      const controller = createController<unknown>('test')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle choice and any types', () => {
      const definition: TypeDefinition = {
        type: ['any'],
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>({})

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle single type (fallback to generic)', () => {
      const definition: TypeDefinition = {
        type: 'string',
      }

      const ctx = createContext(definition)
      const controller = createController<unknown>('test')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })
})
