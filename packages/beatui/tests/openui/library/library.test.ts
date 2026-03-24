import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { defineComponent } from '../../../src/openui/library/define-component'
import { createLibrary } from '../../../src/openui/library/library'
import type { ComponentGroup } from '../../../src/openui/library/types'

// Helper to create test components
function makeButton() {
  return defineComponent({
    name: 'Button',
    props: z.object({
      label: z.string(),
      variant: z.enum(['primary', 'secondary']),
      disabled: z.optional(z.boolean()),
    }),
    description: 'A clickable button component',
    renderer: () => null,
  })
}

function makeText() {
  return defineComponent({
    name: 'Text',
    props: z.object({
      content: z.string(),
      size: z.optional(z.number()),
    }),
    description: 'A text display component',
    renderer: () => null,
  })
}

function makeIcon() {
  return defineComponent({
    name: 'Icon',
    props: z.object({
      name: z.string(),
      color: z.optional(z.string()),
    }),
    description: 'An icon component',
    renderer: () => null,
  })
}

describe('createLibrary', () => {
  describe('component registration', () => {
    it('registers components by name', () => {
      const button = makeButton()
      const lib = createLibrary({ components: [button] })

      expect(lib.has('Button')).toBe(true)
      expect(lib.has('NonExistent')).toBe(false)
    })

    it('retrieves components by name with get()', () => {
      const button = makeButton()
      const lib = createLibrary({ components: [button] })

      const retrieved = lib.get('Button')
      expect(retrieved).toBe(button)
      expect(lib.get('NonExistent')).toBeUndefined()
    })

    it('exposes readonly components map', () => {
      const button = makeButton()
      const text = makeText()
      const lib = createLibrary({ components: [button, text] })

      expect(lib.components.size).toBe(2)
      expect(lib.components.has('Button')).toBe(true)
      expect(lib.components.has('Text')).toBe(true)
    })

    it('components map is typed as ReadonlyMap', () => {
      const lib = createLibrary({ components: [makeButton()] })
      // ReadonlyMap is a TypeScript-level restriction; at runtime it's still a Map.
      // Verify the map has the expected size and is iterable.
      expect(lib.components.size).toBe(1)
      expect(lib.components.has('Button')).toBe(true)
    })
  })

  describe('root', () => {
    it('stores root when provided', () => {
      const lib = createLibrary({ components: [], root: 'Container' })
      expect(lib.root).toBe('Container')
    })

    it('root is undefined when not provided', () => {
      const lib = createLibrary({ components: [] })
      expect(lib.root).toBeUndefined()
    })
  })

  describe('extend()', () => {
    it('adds new components while preserving originals', () => {
      const lib = createLibrary({ components: [makeButton()] })
      const extended = lib.extend({ components: [makeText()] })

      expect(extended.has('Button')).toBe(true)
      expect(extended.has('Text')).toBe(true)
      expect(extended.components.size).toBe(2)
    })

    it('overrides existing components with same name', () => {
      const originalButton = makeButton()
      const lib = createLibrary({ components: [originalButton] })

      const newButton = defineComponent({
        name: 'Button',
        props: z.object({ label: z.string() }),
        description: 'Overridden button',
        renderer: () => null,
      })

      const extended = lib.extend({ components: [newButton] })

      expect(extended.has('Button')).toBe(true)
      expect(extended.get('Button')?.description).toBe('Overridden button')
    })

    it('does not mutate the original library', () => {
      const lib = createLibrary({ components: [makeButton()] })
      lib.extend({ components: [makeText()] })

      expect(lib.has('Text')).toBe(false)
      expect(lib.components.size).toBe(1)
    })

    it('overrides root when provided', () => {
      const lib = createLibrary({ components: [], root: 'OriginalRoot' })
      const extended = lib.extend({ root: 'NewRoot' })

      expect(extended.root).toBe('NewRoot')
      // Original should be unchanged
      expect(lib.root).toBe('OriginalRoot')
    })

    it('preserves original root when not overriding', () => {
      const lib = createLibrary({ components: [], root: 'OriginalRoot' })
      const extended = lib.extend({ components: [makeButton()] })

      expect(extended.root).toBe('OriginalRoot')
    })
  })

  describe('prompt()', () => {
    it('contains "OpenUI Lang" in the generated prompt', () => {
      const lib = createLibrary({ components: [makeButton()] })
      const prompt = lib.prompt()

      expect(prompt).toContain('OpenUI Lang')
    })

    it('contains component names', () => {
      const lib = createLibrary({ components: [makeButton(), makeText()] })
      const prompt = lib.prompt()

      expect(prompt).toContain('Button')
      expect(prompt).toContain('Text')
    })

    it('contains prop names', () => {
      const lib = createLibrary({ components: [makeButton()] })
      const prompt = lib.prompt()

      expect(prompt).toContain('label')
      expect(prompt).toContain('variant')
      expect(prompt).toContain('disabled')
    })

    it('includes component descriptions', () => {
      const lib = createLibrary({ components: [makeButton()] })
      const prompt = lib.prompt()

      expect(prompt).toContain('A clickable button component')
    })

    it('organizes components by groups when groups provided', () => {
      const groups: ComponentGroup[] = [
        {
          name: 'Inputs',
          description: 'Input components',
          components: ['Button'],
        },
        {
          name: 'Display',
          description: 'Display components',
          components: ['Text'],
        },
      ]

      const lib = createLibrary({ components: [makeButton(), makeText()] })
      const prompt = lib.prompt({ groups })

      expect(prompt).toContain('Inputs')
      expect(prompt).toContain('Display')
      expect(prompt).toContain('Input components')
      expect(prompt).toContain('Display components')
    })

    it('uses stored groups when no options groups provided', () => {
      const groups: ComponentGroup[] = [
        {
          name: 'Core',
          description: 'Core components',
          components: ['Button'],
        },
      ]

      const lib = createLibrary({
        components: [makeButton()],
        groups,
      })
      const prompt = lib.prompt()

      expect(prompt).toContain('Core')
      expect(prompt).toContain('Core components')
    })

    it('includes additional rules when provided', () => {
      const lib = createLibrary({ components: [] })
      const prompt = lib.prompt({
        additionalRules: ['Always use dark mode', 'Prefer compact layouts'],
      })

      expect(prompt).toContain('Always use dark mode')
      expect(prompt).toContain('Prefer compact layouts')
    })
  })

  describe('toJSONSchema()', () => {
    it('has a key for each registered component', () => {
      const lib = createLibrary({ components: [makeButton(), makeText()] })
      const schema = lib.toJSONSchema() as Record<string, any>

      expect(schema).toHaveProperty('Button')
      expect(schema).toHaveProperty('Text')
    })

    it('each component schema has type: object', () => {
      const lib = createLibrary({ components: [makeButton()] })
      const schema = lib.toJSONSchema() as Record<string, any>

      expect(schema.Button.type).toBe('object')
    })

    it('each component schema has properties', () => {
      const lib = createLibrary({ components: [makeButton()] })
      const schema = lib.toJSONSchema() as Record<string, any>

      expect(schema.Button).toHaveProperty('properties')
      expect(schema.Button.properties).toHaveProperty('label')
      expect(schema.Button.properties).toHaveProperty('variant')
    })

    it('returns an empty object for a library with no components', () => {
      const lib = createLibrary({ components: [] })
      const schema = lib.toJSONSchema() as Record<string, any>

      expect(Object.keys(schema)).toHaveLength(0)
    })

    it('schema properties reflect correct types', () => {
      const lib = createLibrary({
        components: [
          defineComponent({
            name: 'TypeTest',
            props: z.object({
              name: z.string(),
              count: z.number(),
              active: z.boolean(),
            }),
            description: 'type test',
            renderer: () => null,
          }),
        ],
      })
      const schema = lib.toJSONSchema() as Record<string, any>
      const props = schema.TypeTest.properties

      expect(props.name.type).toBe('string')
      expect(props.count.type).toBe('number')
      expect(props.active.type).toBe('boolean')
    })
  })

  describe('ComponentNameChecker interface', () => {
    it('library can be used as a ComponentNameChecker', () => {
      const lib = createLibrary({ components: [makeButton(), makeIcon()] })

      // Library implements ComponentNameChecker (has method)
      const checker: { has(name: string): boolean } = lib

      expect(checker.has('Button')).toBe(true)
      expect(checker.has('Icon')).toBe(true)
      expect(checker.has('Unknown')).toBe(false)
    })
  })
})
