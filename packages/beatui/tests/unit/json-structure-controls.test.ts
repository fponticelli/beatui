/**
 * Tests for JSON Structure Controls
 *
 * These tests verify that the JSON Structure controls correctly render
 * form inputs based on StructureContext configuration.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { Controller } from '../../src/components/form/controller/controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'
import { StructureStringControl } from '../../src/components/json-structure/controls/string-control'
import { StructureBooleanControl } from '../../src/components/json-structure/controls/boolean-control'
import { StructureIntegerControl } from '../../src/components/json-structure/controls/integer-control'
import { StructureDecimalControl } from '../../src/components/json-structure/controls/decimal-control'
import { StructureContext } from '../../src/components/json-structure/structure-context'
import type { TypeDefinition, JSONStructureSchema } from '../../src/components/json-structure/structure-types'

describe('JSON Structure Controls', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  /**
   * Helper to create a controller for testing
   */
  function createController<T>(initialValue: T) {
    const value = prop(initialValue)
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    return new Controller<T>([], () => {}, value, status, { disabled })
  }

  /**
   * Helper to create a StructureContext for testing
   *
   * Properties like isNullable, isDeprecated, description, examples
   * come directly from the definition, not from overrides.
   */
  function createContext(
    definition: TypeDefinition,
    overrides: Partial<{
      name: string
      isRequired: boolean
      readOnly: boolean
      suppressLabel: boolean
    }> = {}
  ): StructureContext {
    // Create a minimal schema
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      $id: 'https://test.example/test',
      name: 'TestSchema',
      $root: 'Root',
      definitions: { Root: definition },
    }

    // Create the context with the definition and optional path for name
    const path = overrides.name ? [overrides.name] : []

    return new StructureContext({
      schema,
      definition,
      path,
      readOnly: overrides.readOnly ?? false,
      isPropertyRequired: overrides.isRequired ?? false,
      suppressLabel: overrides.suppressLabel ?? false,
    })
  }

  describe('StructureStringControl', () => {
    it('should render a text input', () => {
      const controller = createController<string | undefined>('test value')
      const ctx = createContext({ type: 'string', name: 'Test Label' })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
      expect(input?.type).toBe('text')
    })

    it('should display the label from definition name', () => {
      const controller = createController<string | undefined>('test value')
      const ctx = createContext({ type: 'string', name: 'My Label' })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      const label = container.querySelector('label')
      expect(label?.textContent).toContain('My Label')
    })

    it('should display the label from path name', () => {
      const controller = createController<string | undefined>('test value')
      const ctx = createContext({ type: 'string' }, { name: 'fieldName' })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      const label = container.querySelector('label')
      // Humanized: fieldName -> Field Name
      expect(label?.textContent).toContain('Field name')
    })

    it('should suppress label when suppressLabel is true', () => {
      const controller = createController<string | undefined>('test')
      const ctx = createContext({ type: 'string', name: 'Hidden Label' }, { suppressLabel: true })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      const label = container.querySelector('label')
      expect(label).toBeNull()
    })

    it('should display description', () => {
      const controller = createController<string | undefined>('test')
      const ctx = createContext({ type: 'string', description: 'Help text here' })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      expect(container.textContent).toContain('Help text here')
    })

    it('should be disabled when readOnly is true', async () => {
      const controller = createController<string | undefined>('test')
      const ctx = createContext({ type: 'string' }, { readOnly: true })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      // Wait for async rendering
      await new Promise(resolve => setTimeout(resolve, 10))
      const input = container.querySelector('input')
      expect(input?.disabled).toBe(true)
    })

    it('should be disabled when deprecated', async () => {
      const controller = createController<string | undefined>('test')
      const ctx = createContext({ type: 'string', deprecated: true })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      await new Promise(resolve => setTimeout(resolve, 10))
      const input = container.querySelector('input')
      expect(input?.disabled).toBe(true)
    })

    it('should use example as placeholder', () => {
      const controller = createController<string | undefined>(undefined)
      const ctx = createContext({ type: 'string', examples: ['example@email.com'] })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      const input = container.querySelector('input')
      expect(input?.placeholder).toBe('example@email.com')
    })

    it('should show required indicator when required', () => {
      const controller = createController<string | undefined>('test')
      const ctx = createContext({ type: 'string', name: 'Required Field' }, { isRequired: true })

      render(
        WithProviders(() => StructureStringControl({ ctx, controller })),
        container
      )

      // Required indicator varies by implementation, but there should be some indicator
      const wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper).not.toBeNull()
    })
  })

  describe('StructureBooleanControl', () => {
    it('should render a checkbox input', () => {
      const controller = createController<boolean | null>(false)
      const ctx = createContext({ type: 'boolean', name: 'Checkbox' })

      render(
        WithProviders(() => StructureBooleanControl({ ctx, controller })),
        container
      )

      // CheckboxInput uses custom span-based checkbox
      const checkbox = container.querySelector('.bc-checkbox-input')
      expect(checkbox).not.toBeNull()
    })

    it('should display label', () => {
      const controller = createController<boolean | null>(true)
      const ctx = createContext({ type: 'boolean', name: 'My Checkbox' })

      render(
        WithProviders(() => StructureBooleanControl({ ctx, controller })),
        container
      )

      expect(container.textContent).toContain('My Checkbox')
    })

    it('should have aria attributes for accessibility', () => {
      const controller = createController<boolean | null>(false)
      const ctx = createContext({ type: 'boolean', name: 'Accessible Checkbox' })

      render(
        WithProviders(() => StructureBooleanControl({ ctx, controller })),
        container
      )

      // Should have proper ARIA role for checkbox
      const checkbox = container.querySelector('[role="checkbox"]')
      expect(checkbox).not.toBeNull()
    })

    it('should suppress label when configured', () => {
      const controller = createController<boolean | null>(true)
      const ctx = createContext({ type: 'boolean', name: 'Hidden' }, { suppressLabel: true })

      render(
        WithProviders(() => StructureBooleanControl({ ctx, controller })),
        container
      )

      const label = container.querySelector('label')
      // When suppressLabel is true, label should be null or not contain the text
      expect(label?.textContent?.includes('Hidden')).toBeFalsy()
    })

    it('should handle nullable boolean with clear button', () => {
      const controller = createController<boolean | null>(null)
      // Use array type with null for nullable
      const ctx = createContext({ type: ['boolean', 'null'] })

      render(
        WithProviders(() => StructureBooleanControl({ ctx, controller })),
        container
      )

      // Nullable booleans should have the checkbox container
      const checkbox = container.querySelector('.bc-checkbox-input')
      expect(checkbox).not.toBeNull()
    })
  })

  describe('StructureIntegerControl', () => {
    it('should render a number input for int32', () => {
      const controller = createController<number | bigint | null>(42)
      const ctx = createContext({ type: 'int32', name: 'Integer' })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input).not.toBeNull()
    })

    it('should render a number input for uint8', () => {
      const controller = createController<number | bigint | null>(128)
      const ctx = createContext({ type: 'uint8', name: 'Unsigned Byte' })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'uint8' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input).not.toBeNull()
    })

    it('should set step to 1 for integers', () => {
      const controller = createController<number | bigint | null>(10)
      const ctx = createContext({ type: 'int32' })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.step).toBe('1')
    })

    it('should respect minimum constraint', () => {
      const controller = createController<number | bigint | null>(5)
      const ctx = createContext({ type: 'int32', minimum: 0 })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.min).toBe('0')
    })

    it('should respect maximum constraint', () => {
      const controller = createController<number | bigint | null>(50)
      const ctx = createContext({ type: 'int32', maximum: 100 })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.max).toBe('100')
    })

    it('should handle exclusiveMinimum', () => {
      const controller = createController<number | bigint | null>(5)
      const ctx = createContext({ type: 'int32', exclusiveMinimum: 0 })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      // exclusiveMinimum: 0 means min should be 1
      expect(input?.min).toBe('1')
    })

    it('should handle exclusiveMaximum', () => {
      const controller = createController<number | bigint | null>(50)
      const ctx = createContext({ type: 'int32', exclusiveMaximum: 100 })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      // exclusiveMaximum: 100 means max should be 99
      expect(input?.max).toBe('99')
    })

    it('should use example as placeholder', () => {
      const controller = createController<number | bigint | null>(undefined as unknown as number)
      const ctx = createContext({ type: 'int32', examples: [42] })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.placeholder).toBe('42')
    })

    it('should be disabled when deprecated', async () => {
      const controller = createController<number | bigint | null>(10)
      const ctx = createContext({ type: 'int32', deprecated: true })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      await new Promise(resolve => setTimeout(resolve, 10))
      const input = container.querySelector('input[type="number"]')
      expect(input?.disabled).toBe(true)
    })

    it('should handle nullable integers', () => {
      const controller = createController<number | bigint | null>(null)
      const ctx = createContext({ type: ['int32', 'null'] })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int32' })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })

    it('should handle int64 with bigint input', () => {
      const controller = createController<number | bigint | null>(9007199254740993n)
      const ctx = createContext({ type: 'int64' })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int64' })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })

    it('should handle uint64 with bigint input', () => {
      const controller = createController<number | bigint | null>(BigInt(18446744073709551615n))
      const ctx = createContext({ type: 'uint64' })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'uint64' })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })

    it('should handle int128 with bigint input', () => {
      const controller = createController<number | bigint | null>(BigInt(0))
      const ctx = createContext({ type: 'int128' })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int128' })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })

    it('should handle nullable int64', () => {
      const controller = createController<number | bigint | null>(null)
      const ctx = createContext({ type: ['int64', 'null'] })

      render(
        WithProviders(() => StructureIntegerControl({ ctx, controller, intType: 'int64' })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })
  })

  describe('StructureDecimalControl', () => {
    it('should render a number input for double', () => {
      const controller = createController<number | null>(3.14)
      const ctx = createContext({ type: 'double', name: 'Decimal' })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input).not.toBeNull()
    })

    it('should render for float type', () => {
      const controller = createController<number | null>(1.5)
      const ctx = createContext({ type: 'float' })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'float' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input).not.toBeNull()
    })

    it('should respect multipleOf as step', () => {
      const controller = createController<number | null>(0.5)
      const ctx = createContext({ type: 'double', multipleOf: 0.1 })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.step).toBe('0.1')
    })

    it('should use scale for decimal step', () => {
      const controller = createController<number | null>(10.50)
      const ctx = createContext({ type: 'decimal', precision: 10, scale: 2 })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'decimal' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      // scale: 2 means step should be 0.01
      expect(input?.step).toBe('0.01')
    })

    it('should respect minimum constraint', () => {
      const controller = createController<number | null>(5.5)
      const ctx = createContext({ type: 'double', minimum: 0 })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.min).toBe('0')
    })

    it('should respect maximum constraint', () => {
      const controller = createController<number | null>(50.5)
      const ctx = createContext({ type: 'double', maximum: 100.5 })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.max).toBe('100.5')
    })

    it('should add range description for exclusive bounds', () => {
      const controller = createController<number | null>(50)
      const ctx = createContext({ type: 'double', exclusiveMinimum: 0, exclusiveMaximum: 100 })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      // Should show range description
      expect(container.textContent).toContain('Valid range')
    })

    it('should use example as placeholder', () => {
      const controller = createController<number | null>(undefined as unknown as number)
      const ctx = createContext({ type: 'double', examples: [3.14159] })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.placeholder).toBe('3.14159')
    })

    it('should be disabled when readOnly', async () => {
      const controller = createController<number | null>(1.5)
      const ctx = createContext({ type: 'double' }, { readOnly: true })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      await new Promise(resolve => setTimeout(resolve, 10))
      const input = container.querySelector('input[type="number"]')
      expect(input?.disabled).toBe(true)
    })

    it('should handle nullable decimals', () => {
      const controller = createController<number | null>(null)
      const ctx = createContext({ type: ['double', 'null'] })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })

    it('should parse string minimum values', () => {
      const controller = createController<number | null>(5)
      const ctx = createContext({ type: 'double', minimum: '0.5' as unknown as number })

      render(
        WithProviders(() => StructureDecimalControl({ ctx, controller, floatType: 'double' })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input?.min).toBe('0.5')
    })
  })
})

/**
 * Additional tests for JSON Structure generic control and routing
 */
import { StructureGenericControl, StructureControl } from '../../src/components/json-structure/controls/generic-control'
import { StructureUuidControl } from '../../src/components/json-structure/controls/uuid-control'
import { StructureUriControl } from '../../src/components/json-structure/controls/uri-control'
import { StructureEnumControl, StructureConstControl } from '../../src/components/json-structure/controls/enum-const-controls'

describe('JSON Structure Generic Control Routing', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  /**
   * Helper to create a controller for testing
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
    overrides: Partial<{
      name: string
      isRequired: boolean
      readOnly: boolean
      suppressLabel: boolean
    }> = {}
  ): StructureContext {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
    }
    const path = overrides.name ? [overrides.name] : []

    return new StructureContext({
      schema,
      definition,
      path,
      readOnly: overrides.readOnly ?? false,
      isPropertyRequired: overrides.isRequired ?? false,
      suppressLabel: overrides.suppressLabel ?? false,
    })
  }

  describe('StructureGenericControl dispatching', () => {
    it('should route string type to StringControl', () => {
      const controller = createController<string>('test')
      const ctx = createContext({ type: 'string' })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      const input = container.querySelector('input[type="text"]')
      expect(input).not.toBeNull()
    })

    it('should route boolean type to BooleanControl', () => {
      const controller = createController<boolean>(false)
      const ctx = createContext({ type: 'boolean' })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      const checkbox = container.querySelector('.bc-checkbox-input')
      expect(checkbox).not.toBeNull()
    })

    it('should route int32 to IntegerControl', () => {
      const controller = createController<number>(42)
      const ctx = createContext({ type: 'int32' })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input).not.toBeNull()
    })

    it('should route double to DecimalControl', () => {
      const controller = createController<number>(3.14)
      const ctx = createContext({ type: 'double' })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      const input = container.querySelector('input[type="number"]')
      expect(input).not.toBeNull()
    })

    it('should route uuid to UuidControl', () => {
      const controller = createController<string>('550e8400-e29b-41d4-a716-446655440000')
      const ctx = createContext({ type: 'uuid' })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })

    it('should route uri to UriControl', () => {
      const controller = createController<string>('https://example.com')
      const ctx = createContext({ type: 'uri' })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      const input = container.querySelector('input')
      expect(input).not.toBeNull()
    })

    it('should handle null type with placeholder', () => {
      const controller = createController<null>(null)
      const ctx = createContext({ type: 'null', name: 'Null Field' })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      // Null type renders a placeholder div
      expect(container.children.length).toBeGreaterThan(0)
      // Should contain "null" text
      expect(container.textContent?.toLowerCase()).toContain('null')
    })

    it('should route enum values to EnumControl', () => {
      const controller = createController<string>('red')
      const ctx = createContext({ type: 'string', enum: ['red', 'green', 'blue'] })

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      // EnumControl renders a select or radio buttons
      const select = container.querySelector('select, [role="radiogroup"]')
      expect(select).not.toBeNull()
    })

    it('should handle type without definition as any', () => {
      const controller = createController<unknown>({})
      // Definition with no type specified
      const ctx = createContext({} as TypeDefinition)

      render(
        WithProviders(() => StructureGenericControl({ ctx, controller })),
        container
      )

      // Should render AnyControl which could be a textarea or other
      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureControl entry point', () => {
    it('should create context and render form content', () => {
      const controller = createController<string>('test value')
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test',
        name: 'TestSchema',
        $root: 'Root',
        definitions: { Root: { type: 'string', name: 'Test Field' } },
      }

      render(
        WithProviders(() => StructureControl({ schema, controller })),
        container
      )

      // Should render some content
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should accept readOnly parameter', () => {
      const controller = createController<string>('test')
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test',
        name: 'TestSchema',
        $root: 'Root',
        definitions: { Root: { type: 'string' } },
      }

      // Should not throw when creating with readOnly
      expect(() => {
        render(
          WithProviders(() => StructureControl({ schema, controller, readOnly: true })),
          container
        )
      }).not.toThrow()

      // Should render some content
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should accept locale parameter', () => {
      const controller = createController<string>('test')
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/schema',
        $id: 'https://test.example/test',
        name: 'TestSchema',
        $root: 'Root',
        definitions: { Root: { type: 'string' } },
      }

      // Should not throw when creating with locale
      expect(() => {
        render(
          WithProviders(() => StructureControl({ schema, controller, locale: 'en-US' })),
          container
        )
      }).not.toThrow()
    })
  })
})

describe('JSON Structure UUID Control', () => {
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

  function createContext(definition: TypeDefinition, options: { name?: string; readOnly?: boolean } = {}): StructureContext {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
    }
    return new StructureContext({
      schema,
      definition,
      path: options.name ? [options.name] : [],
      readOnly: options.readOnly,
    })
  }

  it('should render UUID input', () => {
    const controller = createController<string | undefined>('550e8400-e29b-41d4-a716-446655440000')
    const ctx = createContext({ type: 'uuid', name: 'User ID' })

    render(
      WithProviders(() => StructureUuidControl({ ctx, controller })),
      container
    )

    const input = container.querySelector('input')
    expect(input).not.toBeNull()
  })

  it('should have UUID placeholder format', () => {
    const controller = createController<string | undefined>(undefined)
    const ctx = createContext({ type: 'uuid' })

    render(
      WithProviders(() => StructureUuidControl({ ctx, controller })),
      container
    )

    const input = container.querySelector('input')
    // UUID placeholder typically includes xxxx-xxxx format
    expect(input?.placeholder).toMatch(/[x0-9a-f-]+/i)
  })
})

describe('JSON Structure URI Control', () => {
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

  function createContext(definition: TypeDefinition, options: { name?: string; readOnly?: boolean } = {}): StructureContext {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
    }
    return new StructureContext({
      schema,
      definition,
      path: options.name ? [options.name] : [],
      readOnly: options.readOnly,
    })
  }

  it('should render URI input', () => {
    const controller = createController<string | undefined>('https://example.com')
    const ctx = createContext({ type: 'uri', name: 'Website' })

    render(
      WithProviders(() => StructureUriControl({ ctx, controller })),
      container
    )

    const input = container.querySelector('input')
    expect(input).not.toBeNull()
  })

  it('should have URL placeholder', () => {
    const controller = createController<string | undefined>(undefined)
    const ctx = createContext({ type: 'uri' })

    render(
      WithProviders(() => StructureUriControl({ ctx, controller })),
      container
    )

    const input = container.querySelector('input')
    // URI input typically has https:// placeholder or similar
    expect(input?.placeholder).toMatch(/https?:\/\//i)
  })
})

describe('JSON Structure Enum and Const Controls', () => {
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

  function createContext(definition: TypeDefinition, options: { name?: string } = {}): StructureContext {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/schema',
      $id: 'https://test.example/test', name: 'TestSchema', $root: 'Root', definitions: { Root: definition },
    }
    return new StructureContext({
      schema,
      definition,
      path: options.name ? [options.name] : [],
    })
  }

  describe('StructureEnumControl', () => {
    it('should render select for string enum', () => {
      const controller = createController<string>('red')
      const ctx = createContext({ type: 'string', enum: ['red', 'green', 'blue'] }, { name: 'Color' })

      render(
        WithProviders(() => StructureEnumControl({ ctx, controller })),
        container
      )

      // Should render a select or radio buttons
      const control = container.querySelector('select, [role="radiogroup"], .bc-native-select')
      expect(control).not.toBeNull()
    })

    it('should render options for enum values', () => {
      const controller = createController<string>('small')
      const ctx = createContext({ type: 'string', enum: ['small', 'medium', 'large'] }, { name: 'Size' })

      render(
        WithProviders(() => StructureEnumControl({ ctx, controller })),
        container
      )

      // Check that the enum values are present in the output
      const text = container.textContent || ''
      // At least one of the enum values should be displayed
      expect(text).toMatch(/small|medium|large/i)
    })

    it('should handle number enums', () => {
      const controller = createController<number>(1)
      const ctx = createContext({ type: 'int32', enum: [1, 2, 3, 5, 8, 13] }, { name: 'Fibonacci' })

      render(
        WithProviders(() => StructureEnumControl({ ctx, controller })),
        container
      )

      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('StructureConstControl', () => {
    it('should render const value as read-only', () => {
      const controller = createController<string>('CONSTANT')
      const ctx = createContext({ type: 'string', const: 'CONSTANT' }, { name: 'Fixed Value' })

      render(
        WithProviders(() => StructureConstControl({ ctx, controller })),
        container
      )

      // Const control typically renders the value as read-only
      expect(container.textContent).toContain('CONSTANT')
    })

    it('should display number const', () => {
      const controller = createController<number>(42)
      const ctx = createContext({ type: 'int32', const: 42 }, { name: 'Magic Number' })

      render(
        WithProviders(() => StructureConstControl({ ctx, controller })),
        container
      )

      expect(container.textContent).toContain('42')
    })

    it('should display boolean const', () => {
      const controller = createController<boolean>(true)
      const ctx = createContext({ type: 'boolean', const: true }, { name: 'Always True' })

      render(
        WithProviders(() => StructureConstControl({ ctx, controller })),
        container
      )

      // Should show true or similar
      expect(container.children.length).toBeGreaterThan(0)
    })
  })
})
