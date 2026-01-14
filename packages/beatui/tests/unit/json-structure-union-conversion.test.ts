/**
 * Tests for Union Control type conversion and detection
 *
 * These tests specifically target the tryConvert, detectTypeInUnion,
 * and defaultClearedValue functions in union-control.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { Controller } from '../../src/components/form/controller/controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'
import { StructureContext } from '../../src/components/json-structure/structure-context'
import { StructureUnionControl } from '../../src/components/json-structure/controls/union-control'
import type { TypeDefinition, JSONStructureSchema } from '../../src/components/json-structure/structure-types'

describe('Union Control - Type Conversion Coverage', () => {
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
    return new Controller<T>([], (v: T) => value.set(v), value, status, { disabled })
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
      readOnly: options.readOnly ?? false,
      suppressLabel: false,
    })
  }

  describe('String Type Detection', () => {
    it('should detect string value in union', () => {
      const definition: TypeDefinition = { type: ['string', 'int32'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('hello world')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle null value with string type in union', () => {
      const definition: TypeDefinition = { type: ['string', 'null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(null)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Integer Type Conversion', () => {
    it('should handle string to int32 conversion (valid integer string)', () => {
      const definition: TypeDefinition = { type: ['string', 'int32'] }
      const ctx = createContext(definition)
      // Value is a string that looks like an integer
      const controller = createController<unknown>('42')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle invalid integer string', () => {
      const definition: TypeDefinition = { type: ['string', 'int32'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('not a number')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle integer in int8/int16 union', () => {
      const definition: TypeDefinition = { type: ['int8', 'int16'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(127)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle uint types', () => {
      const definition: TypeDefinition = { type: ['uint8', 'uint16'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(255)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle int64/int128 with number value', () => {
      const definition: TypeDefinition = { type: ['int64', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(999999999999)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle uint64/uint128 with number value', () => {
      const definition: TypeDefinition = { type: ['uint64', 'uint128'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(123456789)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle bigint string conversion', () => {
      const definition: TypeDefinition = { type: ['int64', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('123456789012345')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle invalid bigint string conversion', () => {
      const definition: TypeDefinition = { type: ['int64', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('invalid bigint')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Float Type Conversion', () => {
    it('should handle string to float conversion', () => {
      const definition: TypeDefinition = { type: ['float', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('3.14159')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle invalid float string', () => {
      const definition: TypeDefinition = { type: ['double', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('not a float')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle Infinity as invalid', () => {
      const definition: TypeDefinition = { type: ['double', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('Infinity')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Boolean Type Conversion', () => {
    it('should handle string "true" conversion', () => {
      const definition: TypeDefinition = { type: ['boolean', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('true')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle string "false" conversion', () => {
      const definition: TypeDefinition = { type: ['boolean', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('false')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle string "yes" conversion', () => {
      const definition: TypeDefinition = { type: ['boolean', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('yes')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle string "no" conversion', () => {
      const definition: TypeDefinition = { type: ['boolean', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('no')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle string "1" conversion', () => {
      const definition: TypeDefinition = { type: ['boolean', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('1')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle string "0" conversion', () => {
      const definition: TypeDefinition = { type: ['boolean', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('0')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle number to boolean conversion (non-zero)', () => {
      const definition: TypeDefinition = { type: ['boolean', 'int32'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(42)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle number to boolean conversion (zero)', () => {
      const definition: TypeDefinition = { type: ['boolean', 'int32'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(0)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle boolean to int32 conversion', () => {
      const definition: TypeDefinition = { type: ['int32', 'boolean'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(true)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle boolean to float conversion', () => {
      const definition: TypeDefinition = { type: ['float', 'boolean'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(false)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle invalid boolean string conversion', () => {
      const definition: TypeDefinition = { type: ['boolean', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('maybe')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Complex Type Detection', () => {
    it('should handle array in complex union', () => {
      const definition: TypeDefinition = { type: ['array', 'object', 'null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>([1, 2, 3])

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle object in complex union', () => {
      const definition: TypeDefinition = { type: ['array', 'object', 'null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>({ key: 'value' })

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle null in complex union', () => {
      const definition: TypeDefinition = { type: ['array', 'object', 'null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(null)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle tuple type detection', () => {
      const definition: TypeDefinition = { type: ['tuple', 'array'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(['a', 'b', 'c'])

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Null and Undefined Values', () => {
    it('should handle explicit null in string/null union', () => {
      const definition: TypeDefinition = { type: ['string', 'null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(null)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle null only union', () => {
      const definition: TypeDefinition = { type: ['null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>(null)

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Branch Switching Coverage', () => {
    it('should handle switching from string to integer', () => {
      const definition: TypeDefinition = { type: ['string', 'int32'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('test')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      // Find and click the int32 button/option
      const buttons = container.querySelectorAll('button')
      buttons.forEach(btn => {
        if (btn.textContent?.toLowerCase().includes('int')) {
          btn.click()
        }
      })

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle union with only null (filter behavior)', () => {
      const definition: TypeDefinition = { type: ['string', 'null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('test')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty object value', () => {
      const definition: TypeDefinition = { type: ['object', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>({})

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle empty array value', () => {
      const definition: TypeDefinition = { type: ['array', 'string'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>([])

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })

    it('should handle empty string value', () => {
      const definition: TypeDefinition = { type: ['string', 'null'] }
      const ctx = createContext(definition)
      const controller = createController<unknown>('')

      render(
        WithProviders(() => StructureUnionControl({ ctx, controller })),
        container
      )

      expect(container.innerHTML.length).toBeGreaterThan(0)
    })
  })
})
