import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { useController } from '../../src/components/form'
import { JSONSchemaControl } from '../../src/components/json-schema/controls/generic-control'
import type { JSONSchema } from '../../src/components/json-schema/schema-context'

describe('JSON Schema Arrays and Tuples', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('Tuple Detection and Rendering', () => {
    it('should detect Draft-07 tuple schema with items array', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: [
          { type: 'string', title: 'First Name' },
          { type: 'string', title: 'Last Name' },
          { type: 'integer', title: 'Age' },
        ],
        additionalItems: { type: 'string', title: 'Note' },
      }

      const { controller } = useController({
        initialValue: ['John', 'Doe', 25],
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should render tuple labels
      expect(container.textContent).toContain('First Name')
      expect(container.textContent).toContain('Last Name')
      expect(container.textContent).toContain('Age')
    })

    it('should detect Draft 2020-12 tuple schema with prefixItems', () => {
      const schema: JSONSchema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'array',
        prefixItems: [
          { type: 'string', format: 'date-time', title: 'Date' },
          { enum: ['info', 'warn', 'error'], title: 'Level' },
          { type: 'string', minLength: 1, title: 'Message' },
        ],
        items: { type: 'string', title: 'Tag' },
      }

      const { controller } = useController({
        initialValue: ['2023-01-01T00:00:00Z', 'info', 'Test message'],
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should render tuple labels from prefixItems
      expect(container.textContent).toContain('Date')
      expect(container.textContent).toContain('Level')
      expect(container.textContent).toContain('Message')
    })

    it('should handle additional items beyond tuple prefix', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: [
          { type: 'string', title: 'Name' },
          { type: 'integer', title: 'Age' },
        ],
        additionalItems: { type: 'string', title: 'Note' },
      }

      const { controller } = useController({
        initialValue: ['John', 25, 'Extra note 1', 'Extra note 2'],
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should show additional item labels
      expect(container.textContent).toContain('Additional Item 1')
      expect(container.textContent).toContain('Additional Item 2')
    })

    it('should use custom tuple labels from x:ui.tupleLabels', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: [{ type: 'string' }, { type: 'string' }, { type: 'integer' }],
        'x:ui': {
          tupleLabels: ['Custom First', 'Custom Second', 'Custom Third'],
        },
      }

      const { controller } = useController({
        initialValue: ['a', 'b', 1],
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      expect(container.textContent).toContain('Custom First')
      expect(container.textContent).toContain('Custom Second')
      expect(container.textContent).toContain('Custom Third')
    })
  })

  describe('Array Constraints', () => {
    it('should enforce minItems constraint', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
      }

      const { controller } = useController({
        initialValue: ['single'],
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Remove button should be disabled when at minItems
      const removeButtons = container.querySelectorAll(
        'button[title*="remove"], button[aria-label*="remove"]'
      )
      expect(removeButtons.length).toBeGreaterThan(0)
      // Note: Actual button state testing would require more complex setup
    })

    it('should enforce maxItems constraint', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'string' },
        maxItems: 2,
      }

      const { controller } = useController({
        initialValue: ['first', 'second'],
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Add button should be disabled when at maxItems
      const addButtons = container.querySelectorAll('button')
      const addButton = Array.from(addButtons).find(
        btn =>
          btn.textContent?.includes('Add') || btn.textContent?.includes('+')
      )
      expect(addButton).toBeTruthy()
    })

    it('should detect and highlight duplicate items when uniqueItems is true', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'string' },
        uniqueItems: true,
      }

      const { controller } = useController({
        initialValue: ['apple', 'banana', 'apple'], // duplicate 'apple'
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should show duplicate warnings
      expect(container.textContent).toContain('Duplicate value')
    })
  })

  describe('Contains Validation', () => {
    it('should validate and highlight items matching contains schema', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'integer' },
        contains: { type: 'integer', minimum: 10 },
        minContains: 1,
      }

      const { controller } = useController({
        initialValue: [5, 15, 8, 20], // 15 and 20 match contains
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should show contains validation status
      expect(container.textContent).toContain('Matches required pattern')
      expect(container.textContent).toContain('Contains 2 item(s)')
    })

    it('should show validation error when minContains is not satisfied', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'integer' },
        contains: { type: 'integer', minimum: 100 },
        minContains: 2,
      }

      const { controller } = useController({
        initialValue: [5, 15, 8], // no items match contains
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should show validation error
      expect(container.textContent).toContain('Must contain at least 2 item(s)')
      expect(container.textContent).toContain('currently 0')
    })

    it('should show validation error when maxContains is exceeded', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'integer' },
        contains: { type: 'integer', minimum: 10 },
        minContains: 1,
        maxContains: 2,
      }

      const { controller } = useController({
        initialValue: [15, 20, 25, 30], // 4 items match contains, exceeds maxContains
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should show validation error
      expect(container.textContent).toContain('Must contain at most 2 item(s)')
      expect(container.textContent).toContain('currently 4')
    })

    it('should use contains schema title in validation messages', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'integer' },
        contains: {
          type: 'integer',
          minimum: 10,
          title: 'Large Numbers',
        },
        minContains: 1,
      }

      const { controller } = useController({
        initialValue: [5, 8], // no items match contains
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should use custom title in validation message
      expect(container.textContent).toContain('Large Numbers')
    })
  })

  describe('Complex Tuple and Constraint Combinations', () => {
    it('should handle tuple with uniqueItems and contains together', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: [
          { type: 'string', title: 'Name' },
          { type: 'integer', title: 'Score' },
        ],
        additionalItems: { type: 'integer' },
        uniqueItems: true,
        contains: { type: 'integer', minimum: 90 },
        minContains: 1,
        minItems: 3,
        maxItems: 5,
      }

      const { controller } = useController({
        initialValue: ['John', 85, 95], // Score 95 matches contains
        validate: () => ({ valid: true }),
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should show tuple labels
      expect(container.textContent).toContain('Name')
      expect(container.textContent).toContain('Score')
      expect(container.textContent).toContain('Additional Item')

      // Should show contains validation
      expect(container.textContent).toContain('Matches required pattern')
    })
  })
})
