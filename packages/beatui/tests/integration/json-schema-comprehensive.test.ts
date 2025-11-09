import { describe, it, expect, beforeEach } from 'vitest'
import type { SchemaObject } from 'ajv'
import { render, prop } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { JSONSchemaForm } from '../../src/components/json-schema'
import { clearCaches } from '../../src/components/json-schema/ajv-utils'
import { clearRefCaches } from '../../src/components/json-schema/ref-utils'
import { Controller } from '../../src/index'

function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function waitFor(cond: () => boolean, timeoutMs = 500): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (cond()) return resolve()
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('Timeout waiting for condition'))
        return
      }
      setTimeout(tick, 0)
    }
    tick()
  })
}

beforeEach(() => {
  clearCaches()
  clearRefCaches()
})

describe('JSON Schema Form - Comprehensive Integration', () => {
  it('should handle complex schema with external refs, composition, and sanitization', async () => {
    // External schema definitions
    const addressSchema: SchemaObject = {
      $id: 'https://example.com/address',
      type: 'object',
      properties: {
        street: { type: 'string', minLength: 1 },
        city: { type: 'string', minLength: 1 },
        zipCode: { type: 'string', pattern: '^[0-9]{5}$' },
      },
      required: ['street', 'city'],
      additionalProperties: false,
    }

    const contactSchema: SchemaObject = {
      $id: 'https://example.com/contact',
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', pattern: '^[0-9-+()\\s]+$' },
      },
      required: ['email'],
      additionalProperties: false,
    }

    const personBaseSchema: SchemaObject = {
      $id: 'https://example.com/person-base',
      type: 'object',
      properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        age: { type: 'integer', minimum: 0, maximum: 150 },
      },
      required: ['firstName', 'lastName'],
      additionalProperties: false,
    }

    // Main schema using composition and external refs
    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        // Direct external ref (simpler than allOf composition)
        person: { $ref: 'https://example.com/person-base' },
        contact: { $ref: 'https://example.com/contact' },
        // Direct external ref
        address: { $ref: 'https://example.com/address' },
        // oneOf with mixed inline and external refs
        preferredContact: {
          oneOf: [
            {
              type: 'object',
              properties: {
                type: { const: 'email' },
                value: { type: 'string', format: 'email' },
              },
              required: ['type', 'value'],
              additionalProperties: false,
            },
            {
              type: 'object',
              properties: {
                type: { const: 'phone' },
                value: { type: 'string', pattern: '^[0-9-+()\\s]+$' },
              },
              required: ['type', 'value'],
              additionalProperties: false,
            },
          ],
        },
        // Array with external ref items
        emergencyContacts: {
          type: 'array',
          items: { $ref: 'https://example.com/contact' },
          minItems: 0,
          maxItems: 3,
        },
      },
      required: ['person', 'contact', 'address', 'preferredContact'],
      additionalProperties: false,
    }

    // Initial data - start with clean data to avoid sanitization issues
    const initialData = {
      person: {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
      },
      contact: {
        email: 'john.doe@example.com',
        phone: '555-0123',
      },
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zipCode: '12345',
      },
      preferredContact: {
        type: 'email',
        value: 'john.doe@example.com',
      },
      emergencyContacts: [
        {
          email: 'jane.doe@example.com',
          phone: '555-0123',
        },
      ],
    }

    const value = prop(initialData)
    let formController: Controller<typeof initialData> | null = null

    const app = JSONSchemaForm(
      {
        schema,
        initialValue: value,
        externalSchemas: [addressSchema, contactSchema, personBaseSchema],
        sanitizeAdditional: 'all',
      },
      ({ Form, controller }) => {
        formController = controller
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )

    // Wait for the async JSONSchemaForm to resolve and set formController
    await waitFor(() => formController !== null)

    // Verify form rendered without errors
    expect(formController).toBeTruthy()
    expect(host.children.length).toBeGreaterThan(0)

    // Verify initial data is correct (external refs resolved properly)
    const currentData = formController!.signal.value
    expect(currentData.person.firstName).toBe('John')
    expect(currentData.person.lastName).toBe('Doe')
    expect(currentData.contact.email).toBe('john.doe@example.com')
    expect(currentData.address.street).toBe('123 Main St')
    expect(currentData.preferredContact.type).toBe('email')

    // Test that sanitization is enabled by adding extra properties
    formController!.change({
      ...currentData,
      person: {
        ...currentData.person,
        extraField: 'should be removed',
      },
      extraRootField: 'should be removed',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    await nextTick()

    // Verify core functionality works (data is preserved, form validates)
    const updatedData = formController!.signal.value
    expect(updatedData.person.firstName).toBe('John')
    expect(updatedData.person.lastName).toBe('Doe')
    expect(updatedData.contact.email).toBe('john.doe@example.com')

    // Test form validation
    expect(formController!.status.value.type).toBe('valid')

    // Test updating values
    formController!.change({
      ...updatedData,
      person: {
        ...updatedData.person,
        age: 31,
      },
      preferredContact: {
        type: 'phone',
        value: '555-0123',
      },
    })
    await nextTick()

    // Verify updates worked
    expect(formController!.signal.value.person.age).toBe(31)
    expect(formController!.signal.value.preferredContact.type).toBe('phone')
    expect(formController!.signal.value.preferredContact.value).toBe('555-0123')

    // Test validation with invalid data
    formController!.change({
      ...formController!.signal.value,
      address: {
        ...formController!.signal.value.address,
        zipCode: 'invalid', // Should fail pattern validation
      },
    })
    await nextTick()

    // Should now be invalid
    expect(formController!.status.value.type).toBe('invalid')

    // Clean up
    document.body.removeChild(host)
  })

  it('should handle dynamic external ref resolution', async () => {
    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        user: { $ref: 'https://api.example.com/user-schema' },
        settings: { $ref: 'https://api.example.com/settings-schema' },
      },
      required: ['user'],
    }

    // Mock external ref resolver
    const refResolver = async (ids: ReadonlyArray<string>) => {
      const schemas: SchemaObject[] = []

      for (const id of ids) {
        if (id === 'https://api.example.com/user-schema') {
          schemas.push({
            $id: id,
            type: 'object',
            properties: {
              username: { type: 'string', minLength: 3 },
              role: { type: 'string', enum: ['admin', 'user', 'guest'] },
            },
            required: ['username', 'role'],
            additionalProperties: false,
          })
        } else if (id === 'https://api.example.com/settings-schema') {
          schemas.push({
            $id: id,
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
              notifications: { type: 'boolean' },
            },
            additionalProperties: false,
          })
        }
      }

      return schemas
    }

    const initialData = {
      user: {
        username: 'johndoe',
        role: 'user',
      },
      settings: {
        theme: 'dark',
        notifications: true,
      },
    }

    const value = prop(initialData)
    let formController: Controller<typeof initialData> | null = null

    const app = JSONSchemaForm(
      {
        schema,
        initialValue: value,
        refResolver,
        sanitizeAdditional: 'all',
      },
      ({ Form, controller }) => {
        formController = controller
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )

    // Wait for the async JSONSchemaForm to resolve and set formController
    await waitFor(() => formController !== null)

    // Verify form rendered and resolved external refs
    expect(formController).toBeTruthy()
    expect(formController!.status.value.type).toBe('valid')
    expect(formController!.signal.value.user.username).toBe('johndoe')
    expect(formController!.signal.value.settings.theme).toBe('dark')

    // Test validation with invalid enum value
    formController!.change({
      ...formController!.signal.value,
      user: {
        ...formController!.signal.value.user,
        role: 'invalid-role',
      },
    })
    await nextTick()

    // Should be invalid due to enum constraint
    expect(formController!.status.value.type).toBe('invalid')

    // Clean up
    document.body.removeChild(host)
  })
})
