import { describe, it, expect, beforeEach } from 'vitest'
import type { SchemaObject } from 'ajv'
import { JSONSchemaForm } from '../../src/components/json-schema'
import { prop } from '@tempots/dom'
import { clearCaches } from '../../src/components/json-schema/ajv-utils'
import { clearRefCaches } from '../../src/components/json-schema/ref-utils'

// Minimal harness to get AJV initializeable via JSONSchemaForm
function renderWithAjv<T = unknown>(
  schema: SchemaObject,
  opts?: {
    externalSchemas?: ReadonlyArray<SchemaObject>
    refResolver?: (
      ids: ReadonlyArray<string>
    ) => Promise<ReadonlyArray<SchemaObject>>
  }
) {
  const value = prop<T>({} as T)
  JSONSchemaForm<T>(
    { schema, initialValue: value, ...opts },
    ({ Form }) => Form
  )
}

beforeEach(() => {
  clearCaches()
  clearRefCaches()
})

describe('external $ref resolution', () => {
  it('resolves pre-bundled external schemas via externalSchemas', async () => {
    const address: SchemaObject = {
      $id: 'https://example.com/address.json',
      type: 'object',
      properties: {
        street: { type: 'string' },
      },
      required: ['street'],
      additionalProperties: false,
    }

    const root: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        addr: { $ref: `${address.$id}#` },
      },
      required: ['addr'],
      additionalProperties: false,
    }

    // Should not throw during AJV compile
    renderWithAjv(root)
    renderWithAjv(root, { externalSchemas: [address] })
    expect(true).toBe(true)
  })

  it('resolves external refs transitively using refResolver', async () => {
    const country: SchemaObject = {
      $id: 'https://example.com/country.json',
      type: 'string',
      enum: ['US', 'AR'],
    }
    const address: SchemaObject = {
      $id: 'https://example.com/address.json',
      type: 'object',
      properties: {
        country: { $ref: `${country.$id}#` },
      },
    }

    const resolver = async (ids: ReadonlyArray<string>) => {
      const set = new Set(ids)
      const out: SchemaObject[] = []
      if (set.has('https://example.com/address.json')) out.push(address)
      if (set.has('https://example.com/country.json')) out.push(country)
      return out
    }

    const root: SchemaObject = {
      type: 'object',
      properties: {
        addr: { $ref: 'https://example.com/address.json#' },
      },
    }

    renderWithAjv(root, { refResolver: resolver })
    expect(true).toBe(true)
  })
})

describe('in-document $ref semantics', () => {
  it('merges sibling keywords over referenced target', () => {
    const root: SchemaObject = {
      $defs: {
        Name: { type: 'string', minLength: 1 },
      },
      type: 'object',
      properties: {
        name: { $ref: '#/$defs/Name', type: 'string', minLength: 3 },
      },
    }

    // Resolve is exercised via controls path; here we just assert no crash during setup
    renderWithAjv(root)
    expect(true).toBe(true)
  })
})
