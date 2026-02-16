import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { JSONSchemaDisplay } from '../../src/components/json-schema-display/json-schema-display'
import { SchemaContext } from '../../src/components/json-schema/schema-context'
import { StringDisplay } from '../../src/components/json-schema-display/displays/string-display'
import { BooleanDisplay } from '../../src/components/json-schema-display/displays/boolean-display'
import { DisplayWrapper } from '../../src/components/json-schema-display/display-wrapper'

function createCtx(
  definition: object,
  options?: {
    path?: Array<string | number>
    isPropertyRequired?: boolean
    schema?: object
  }
): SchemaContext {
  const schema = options?.schema ?? definition
  return new SchemaContext({
    schema,
    definition,
    horizontal: false,
    path: options?.path ?? [],
    isPropertyRequired: options?.isPropertyRequired ?? false,
  })
}

describe('JSONSchemaDisplay', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders a simple string value', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', title: 'Name' },
          },
        },
        value: { name: 'Alice' },
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('Name')
    expect(container.textContent).toContain('Alice')
  })

  it('renders a simple number value', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            age: { type: 'number', title: 'Age' },
          },
        },
        value: { age: 30 },
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('Age')
    expect(container.textContent).toContain('30')
  })

  it('renders boolean badges', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            active: { type: 'boolean', title: 'Active' },
          },
        },
        value: { active: true },
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('Active')
    expect(container.textContent).toContain('true')
    const badge = container.querySelector(
      '.bc-json-schema-display__boolean--true'
    )
    expect(badge).not.toBeNull()
  })

  it('renders null values', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            data: { type: 'null', title: 'Data' },
          },
        },
        value: { data: null },
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('null')
  })

  it('renders nested objects', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            address: {
              type: 'object',
              title: 'Address',
              properties: {
                city: { type: 'string', title: 'City' },
                zip: { type: 'string', title: 'ZIP' },
              },
            },
          },
        },
        value: { address: { city: 'NYC', zip: '10001' } },
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('Address')
    expect(container.textContent).toContain('City')
    expect(container.textContent).toContain('NYC')
    expect(container.textContent).toContain('ZIP')
    expect(container.textContent).toContain('10001')
  })

  it('renders array items', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              title: 'Tags',
              items: { type: 'string' },
            },
          },
        },
        value: { tags: ['alpha', 'beta'] },
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('Tags')
    expect(container.textContent).toContain('alpha')
    expect(container.textContent).toContain('beta')
    expect(container.textContent).toContain('[0]')
    expect(container.textContent).toContain('[1]')
  })

  it('shows empty array indicator', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              title: 'Items',
              items: { type: 'string' },
            },
          },
        },
        value: { items: [] },
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('(empty array)')
  })

  it('shows missing required indicator', () => {
    render(
      JSONSchemaDisplay({
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', title: 'Name' },
          },
          required: ['name'],
        },
        value: {},
        showMismatches: false,
      }),
      container
    )
    expect(container.textContent).toContain('Name')
    expect(container.textContent).toContain('(missing)')
  })
})

describe('BooleanDisplay', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders true badge', () => {
    const ctx = createCtx(
      { type: 'boolean', title: 'Flag' },
      { path: ['flag'] }
    )
    render(BooleanDisplay({ ctx, value: true, mismatches: [] }), container)
    const badge = container.querySelector(
      '.bc-json-schema-display__boolean--true'
    )
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('true')
  })

  it('renders false badge', () => {
    const ctx = createCtx(
      { type: 'boolean', title: 'Flag' },
      { path: ['flag'] }
    )
    render(BooleanDisplay({ ctx, value: false, mismatches: [] }), container)
    const badge = container.querySelector(
      '.bc-json-schema-display__boolean--false'
    )
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('false')
  })
})

describe('StringDisplay', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders plain text', () => {
    const ctx = createCtx({ type: 'string', title: 'Name' }, { path: ['name'] })
    render(
      StringDisplay({ ctx, value: 'Hello World', mismatches: [] }),
      container
    )
    expect(container.textContent).toContain('Hello World')
  })

  it('renders email as mailto link', () => {
    const ctx = createCtx(
      { type: 'string', format: 'email', title: 'Email' },
      { path: ['email'] }
    )
    render(
      StringDisplay({ ctx, value: 'test@example.com', mismatches: [] }),
      container
    )
    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('mailto:test@example.com')
  })

  it('renders URI as hyperlink', () => {
    const ctx = createCtx(
      { type: 'string', format: 'uri', title: 'Website' },
      { path: ['website'] }
    )
    render(
      StringDisplay({
        ctx,
        value: 'https://example.com',
        mismatches: [],
      }),
      container
    )
    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('https://example.com')
    expect(link?.getAttribute('target')).toBe('_blank')
  })

  it('renders color as swatch + text', () => {
    const ctx = createCtx(
      { type: 'string', format: 'color', title: 'Color' },
      { path: ['color'] }
    )
    render(StringDisplay({ ctx, value: '#ff0000', mismatches: [] }), container)
    const swatch = container.querySelector(
      '.bc-json-schema-display__color-swatch'
    )
    expect(swatch).not.toBeNull()
    expect(container.textContent).toContain('#ff0000')
  })

  it('renders password as masked', () => {
    const ctx = createCtx(
      { type: 'string', title: 'Password' },
      { path: ['password'] }
    )
    render(
      StringDisplay({ ctx, value: 'secret123', mismatches: [] }),
      container
    )
    expect(container.textContent).toContain('\u2022')
    expect(container.textContent).not.toContain('secret123')
  })

  it('renders uuid as monospace', () => {
    const ctx = createCtx(
      { type: 'string', format: 'uuid', title: 'ID' },
      { path: ['id'] }
    )
    render(
      StringDisplay({
        ctx,
        value: '550e8400-e29b-41d4-a716-446655440000',
        mismatches: [],
      }),
      container
    )
    const mono = container.querySelector('.bc-json-schema-display__monospace')
    expect(mono).not.toBeNull()
  })
})

describe('DisplayWrapper', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('shows label and required indicator', () => {
    const ctx = createCtx(
      { type: 'string', title: 'Name' },
      { path: ['name'], isPropertyRequired: true }
    )
    render(
      DisplayWrapper({
        ctx,
        mismatches: [],
        children: 'value',
      }),
      container
    )
    expect(container.textContent).toContain('Name')
    expect(container.textContent).toContain('*')
  })

  it('shows deprecated badge', () => {
    const ctx = createCtx(
      { type: 'string', title: 'Old Field', deprecated: true },
      { path: ['old'] }
    )
    render(
      DisplayWrapper({
        ctx,
        mismatches: [],
        children: 'value',
      }),
      container
    )
    expect(container.textContent).toContain('deprecated')
  })

  it('shows description', () => {
    const ctx = createCtx(
      {
        type: 'string',
        title: 'Name',
        description: 'Your full name',
      },
      { path: ['name'] }
    )
    render(
      DisplayWrapper({
        ctx,
        mismatches: [],
        children: 'value',
      }),
      container
    )
    expect(container.textContent).toContain('Your full name')
  })
})
