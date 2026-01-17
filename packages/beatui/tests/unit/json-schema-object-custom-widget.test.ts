import { describe, it, expect, vi } from 'vitest'
import { html, render, attr } from '@tempots/dom'
import { SchemaContext } from '../../src/components/json-schema/schema-context'
import { WidgetRegistry } from '../../src/components/json-schema/widgets/widget-customization'
import { tryResolveCustomWidget } from '../../src/components/json-schema/controls/shared-utils'
import { JSONSchemaForm } from '../../src/components/json-schema/json-schema-form'
import { WithProviders } from '../helpers/test-providers'
import type { Controller } from '../../src/components/form'

function waitFor(cond: () => boolean, timeoutMs = 500): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (cond()) return resolve()
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('Timeout waiting for condition'))
        return
      }
      setTimeout(tick, 10)
    }
    tick()
  })
}

describe('JSON Schema custom widgets for object types', () => {
  const mockController = {
    signal: { value: {}, on: () => () => {} },
    change: () => {},
  } as unknown as Controller<unknown>

  const schema = {
    type: 'object' as const,
    required: ['schema'],
    additionalProperties: false,
    properties: {
      schema: {
        type: 'object' as const,
        description: 'JSON Schema',
        additionalProperties: true,
      },
      count: {
        type: 'integer' as const,
        minimum: 1,
        default: 10,
      },
    },
  }

  it('should match nested object property by name', () => {
    const matcherFn = vi.fn((ctx: SchemaContext) => {
      return ctx.name?.toLowerCase().includes('schema') ?? false
    })

    const registry = new WidgetRegistry()
    registry.register('schema-widget', {
      factory: () => null as any,
      displayName: 'Schema Widget',
      priority: 100,
      matcher: matcherFn,
    })

    // Simulate what happens for the nested "schema" property
    const ctx = new SchemaContext({
      schema: schema,
      definition: schema.properties.schema,
      horizontal: false,
      path: ['schema'],
      widgetRegistry: registry,
    })

    expect(ctx.name).toBe('schema')
    expect(ctx.path).toEqual(['schema'])

    const result = registry.findBestWidget(ctx)

    expect(matcherFn).toHaveBeenCalled()
    expect(result).not.toBeNull()
    expect(result?.name).toBe('schema-widget')
  })

  it('should call tryResolveCustomWidget for object type', () => {
    const factoryFn = vi.fn(() => 'custom-widget-output' as any)

    const registry = new WidgetRegistry()
    registry.register('schema-widget', {
      factory: factoryFn,
      displayName: 'Schema Widget',
      priority: 100,
      matcher: (ctx) => ctx.name?.toLowerCase().includes('schema') ?? false,
    })

    const ctx = new SchemaContext({
      schema: schema,
      definition: schema.properties.schema,
      horizontal: false,
      path: ['schema'],
      widgetRegistry: registry,
    })

    const result = tryResolveCustomWidget({
      ctx,
      controller: mockController,
      resolved: null,
    })

    expect(factoryFn).toHaveBeenCalled()
    expect(result).toBe('custom-widget-output')
  })

  it('should NOT match root object (no name)', () => {
    const matcherFn = vi.fn((ctx: SchemaContext) => {
      return ctx.name?.toLowerCase().includes('schema') ?? false
    })

    const registry = new WidgetRegistry()
    registry.register('schema-widget', {
      factory: () => null as any,
      displayName: 'Schema Widget',
      priority: 100,
      matcher: matcherFn,
    })

    // Root level context (empty path)
    const ctx = new SchemaContext({
      schema: schema,
      definition: schema,
      horizontal: false,
      path: [],
      widgetRegistry: registry,
    })

    expect(ctx.name).toBeUndefined()

    const result = registry.findBestWidget(ctx)

    expect(matcherFn).toHaveBeenCalled()
    // Should not match because ctx.name is undefined
    expect(result).toBeNull()
  })

  it('should render custom widget via JSONSchemaForm for nested object property', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const matcherCalls: string[] = []
    const factoryCalls: string[] = []
    let formRendered = false

    try {
      const fullSchema = {
        type: 'object' as const,
        required: ['schema'],
        additionalProperties: false,
        properties: {
          schema: {
            type: 'object' as const,
            description: 'JSON Schema',
            additionalProperties: true,
          },
          count: {
            type: 'integer' as const,
            minimum: 1,
            default: 10,
          },
        },
      }

      const customWidgets = [
        {
          name: 'custom-schema-widget',
          factory: ({ ctx }: { ctx: SchemaContext }) => {
            factoryCalls.push(ctx.name ?? 'undefined')
            return html.div(
              attr.class('custom-schema-widget'),
              attr.dataTestid('custom-schema-widget'),
              `Custom widget for: ${ctx.name}`
            )
          },
          displayName: 'Custom Schema Widget',
          priority: 100,
          matcher: (ctx: SchemaContext) => {
            matcherCalls.push(ctx.name ?? 'undefined')
            return ctx.name?.toLowerCase().includes('schema') ?? false
          },
        },
      ]

      const dispose = render(
        WithProviders(() =>
          JSONSchemaForm(
            {
              schema: fullSchema,
              initialValue: { schema: {}, count: 10 },
              customWidgets,
            },
            ({ Form }) => {
              formRendered = true
              return Form
            }
          )
        ),
        container
      )

      // Wait for async rendering (AJV initialization)
      await waitFor(() => formRendered)

      // Check that the custom widget was rendered
      const customWidget = container.querySelector('.custom-schema-widget')
      expect(customWidget).not.toBeNull()
      expect(customWidget?.textContent).toContain('Custom widget for: schema')
      expect(factoryCalls).toContain('schema')
      expect(matcherCalls).toContain('schema')

      dispose()
    } finally {
      document.body.removeChild(container)
    }
  })

  it('should call matcher for ALL property types (primitives AND objects)', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const matcherCallsWithTypes: Array<{ name: string; type: string }> = []
    let formRendered = false

    try {
      // Schema with multiple properties of different types (similar to user's reported issue)
      const mixedSchema = {
        type: 'object' as const,
        properties: {
          count: {
            type: 'integer' as const,
            minimum: 1,
            default: 10,
          },
          seed: {
            type: 'string' as const,
          },
          locale: {
            type: 'string' as const,
          },
          schema: {
            type: 'object' as const,
            description: 'JSON Schema',
            additionalProperties: true,
          },
        },
      }

      const customWidgets = [
        {
          name: 'logging-widget',
          factory: () => null as any,
          displayName: 'Logging Widget',
          priority: 1, // Low priority so it doesn't actually match
          matcher: (ctx: SchemaContext) => {
            const def = ctx.definition as any
            matcherCallsWithTypes.push({
              name: ctx.name ?? 'ROOT',
              type: def?.type ?? 'unknown',
            })
            return false // Never match, just log
          },
        },
      ]

      const dispose = render(
        WithProviders(() =>
          JSONSchemaForm(
            {
              schema: mixedSchema,
              initialValue: { count: 10, seed: 'test', locale: 'en', schema: {} },
              customWidgets,
            },
            ({ Form }) => {
              formRendered = true
              return Form
            }
          )
        ),
        container
      )

      // Wait for async rendering
      await waitFor(() => formRendered)

      // Verify matcher was called for ALL properties including the object type
      const propertyNames = matcherCallsWithTypes.map(c => c.name)

      // These should all be called (both primitives and objects)
      expect(propertyNames).toContain('count')
      expect(propertyNames).toContain('seed')
      expect(propertyNames).toContain('locale')
      expect(propertyNames).toContain('schema') // Critical: object type property should also trigger matcher

      // Verify the types are correctly identified
      const schemaCall = matcherCallsWithTypes.find(c => c.name === 'schema')
      expect(schemaCall?.type).toBe('object')

      const countCall = matcherCallsWithTypes.find(c => c.name === 'count')
      expect(countCall?.type).toBe('integer')

      dispose()
    } finally {
      document.body.removeChild(container)
    }
  })

  it('should call matcher for EXACT user schema with schema/count/seed/locale properties', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const matcherCallsWithInfo: Array<{
      name: string
      type: string
      path: string[]
    }> = []
    let formRendered = false

    try {
      // EXACT schema from user's report
      const userSchema = {
        type: 'object' as const,
        required: ['schema'],
        additionalProperties: false,
        properties: {
          schema: {
            type: 'object' as const,
            description:
              'JSON Schema (draft-04) defining the structure of data to generate',
            additionalProperties: true,
          },
          count: {
            type: 'integer' as const,
            minimum: 1,
            default: 10,
            description: 'Number of records to generate',
          },
          seed: {
            type: 'integer' as const,
            description: 'Seed for reproducible generation',
          },
          locale: {
            type: 'string' as const,
            default: 'en_US',
            description: 'ISO locale code for localized data generation',
          },
        },
      }

      const customWidgets = [
        {
          name: 'logging-widget',
          factory: () => null as any,
          displayName: 'Logging Widget',
          priority: 1,
          matcher: (ctx: SchemaContext) => {
            const def = ctx.definition as any
            matcherCallsWithInfo.push({
              name: ctx.name ?? 'ROOT',
              type: def?.type ?? 'unknown',
              path: ctx.path.map(String),
            })
            return false
          },
        },
      ]

      const dispose = render(
        WithProviders(() =>
          JSONSchemaForm(
            {
              schema: userSchema,
              initialValue: {
                schema: {},
                count: 10,
                seed: 42,
                locale: 'en_US',
              },
              customWidgets,
            },
            ({ Form }) => {
              formRendered = true
              return Form
            }
          )
        ),
        container
      )

      await waitFor(() => formRendered)

      // Get property names that were processed
      const propertyNames = matcherCallsWithInfo.map(c => c.name)

      // ALL 4 properties should have their matchers called
      expect(propertyNames).toContain('count')
      expect(propertyNames).toContain('seed')
      expect(propertyNames).toContain('locale')
      expect(propertyNames).toContain('schema') // CRITICAL: This must be called!

      // Verify types
      const schemaInfo = matcherCallsWithInfo.find(c => c.name === 'schema')
      expect(schemaInfo).toBeDefined()
      expect(schemaInfo?.type).toBe('object')
      expect(schemaInfo?.path).toEqual(['schema'])

      // Log all calls for debugging
      console.log(
        'Matcher calls:',
        matcherCallsWithInfo.map(c => `${c.name}(${c.type})`)
      )

      dispose()
    } finally {
      document.body.removeChild(container)
    }
  })

  it('should verify widgetRegistry is preserved through context chain for nested objects', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const contextInfo: Array<{
      name: string
      hasRegistry: boolean
      path: string[]
    }> = []
    let formRendered = false

    try {
      const nestedSchema = {
        type: 'object' as const,
        properties: {
          level1Object: {
            type: 'object' as const,
            properties: {
              level2Object: {
                type: 'object' as const,
                properties: {
                  deepValue: { type: 'string' as const },
                },
              },
            },
          },
        },
      }

      const customWidgets = [
        {
          name: 'registry-checker',
          factory: () => null as any,
          displayName: 'Registry Checker',
          priority: 1,
          matcher: (ctx: SchemaContext) => {
            contextInfo.push({
              name: ctx.name ?? 'ROOT',
              hasRegistry: ctx.widgetRegistry !== undefined,
              path: ctx.path.map(String),
            })
            return false
          },
        },
      ]

      const dispose = render(
        WithProviders(() =>
          JSONSchemaForm(
            {
              schema: nestedSchema,
              initialValue: {
                level1Object: { level2Object: { deepValue: 'test' } },
              },
              customWidgets,
            },
            ({ Form }) => {
              formRendered = true
              return Form
            }
          )
        ),
        container
      )

      await waitFor(() => formRendered)

      // Verify widgetRegistry is preserved at all nesting levels
      const level1 = contextInfo.find(c => c.name === 'level1Object')
      const level2 = contextInfo.find(c => c.name === 'level2Object')
      const deepValue = contextInfo.find(c => c.name === 'deepValue')

      expect(level1).toBeDefined()
      expect(level1?.hasRegistry).toBe(true)
      expect(level1?.path).toEqual(['level1Object'])

      expect(level2).toBeDefined()
      expect(level2?.hasRegistry).toBe(true)
      expect(level2?.path).toEqual(['level1Object', 'level2Object'])

      expect(deepValue).toBeDefined()
      expect(deepValue?.hasRegistry).toBe(true)
      expect(deepValue?.path).toEqual(['level1Object', 'level2Object', 'deepValue'])

      dispose()
    } finally {
      document.body.removeChild(container)
    }
  })
})
