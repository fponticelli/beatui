/**
 * JSON Structure Widget Registry Tests
 *
 * Tests for widget registration, resolution, and helper functions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  DefaultWidgetRegistry,
  createWidgetRegistry,
  getGlobalWidgetRegistry,
  setGlobalWidgetRegistry,
  forType,
  forFormat,
  forTypeAndFormat,
  forMatcher,
  type WidgetFactory,
  type WidgetRegistry,
} from '../../src/components/json-structure/widgets/widget-registry'
import { StructureContext } from '../../src/components/json-structure/structure-context'
import type { JSONStructureSchema } from '../../src/components/json-structure/structure-types'

describe('JSON Structure Widget Registry', () => {
  const baseSchema: JSONStructureSchema = {
    $schema: 'https://json-structure.org/draft/2024-01/schema',
    $id: 'test',
    name: 'Test Schema',
    type: 'object',
    properties: {},
  }

  const mockFactory: WidgetFactory = () => null

  describe('DefaultWidgetRegistry', () => {
    describe('register/unregister', () => {
      it('should register a widget', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('test-widget', {
          factory: mockFactory,
          displayName: 'Test Widget',
        })

        expect(registry.has('test-widget')).toBe(true)
      })

      it('should unregister a widget', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('test-widget', {
          factory: mockFactory,
          displayName: 'Test Widget',
        })

        registry.unregister('test-widget')
        expect(registry.has('test-widget')).toBe(false)
      })
    })

    describe('get/has', () => {
      it('should get registered widget', () => {
        const registry = new DefaultWidgetRegistry()
        const registration = {
          factory: mockFactory,
          displayName: 'Test Widget',
          description: 'A test widget',
        }

        registry.register('test-widget', registration)

        const result = registry.get('test-widget')
        expect(result).toBe(registration)
      })

      it('should return undefined for non-existent widget', () => {
        const registry = new DefaultWidgetRegistry()
        expect(registry.get('non-existent')).toBeUndefined()
      })

      it('should check if widget exists', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('exists', { factory: mockFactory, displayName: 'Exists' })

        expect(registry.has('exists')).toBe(true)
        expect(registry.has('not-exists')).toBe(false)
      })
    })

    describe('names', () => {
      it('should return all registered widget names', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('widget-a', { factory: mockFactory, displayName: 'A' })
        registry.register('widget-b', { factory: mockFactory, displayName: 'B' })

        const names = registry.names()
        expect(names).toContain('widget-a')
        expect(names).toContain('widget-b')
      })

      it('should return empty array for empty registry', () => {
        const registry = new DefaultWidgetRegistry()
        expect(registry.names()).toHaveLength(0)
      })
    })

    describe('getForType', () => {
      it('should return widgets supporting a type', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('string-widget', {
          factory: mockFactory,
          displayName: 'String',
          supportedTypes: ['string'],
        })
        registry.register('int-widget', {
          factory: mockFactory,
          displayName: 'Int',
          supportedTypes: ['int32', 'int64'],
        })

        const stringWidgets = registry.getForType('string')
        expect(stringWidgets).toHaveLength(1)

        const intWidgets = registry.getForType('int32')
        expect(intWidgets).toHaveLength(1)
      })

      it('should return empty array for unsupported type', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('string-widget', {
          factory: mockFactory,
          displayName: 'String',
          supportedTypes: ['string'],
        })

        expect(registry.getForType('boolean')).toHaveLength(0)
      })
    })

    describe('getForFormat', () => {
      it('should return widgets supporting a format', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('email-widget', {
          factory: mockFactory,
          displayName: 'Email',
          supportedFormats: ['email'],
        })
        registry.register('uri-widget', {
          factory: mockFactory,
          displayName: 'URI',
          supportedFormats: ['uri', 'uri-reference'],
        })

        const emailWidgets = registry.getForFormat('email')
        expect(emailWidgets).toHaveLength(1)

        const uriWidgets = registry.getForFormat('uri')
        expect(uriWidgets).toHaveLength(1)
      })
    })

    describe('findBestWidget', () => {
      it('should find widget by type match', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('string-widget', {
          factory: mockFactory,
          displayName: 'String',
          supportedTypes: ['string'],
        })

        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['field'],
        })

        const result = registry.findBestWidget(ctx)
        expect(result).not.toBeNull()
        expect(result!.name).toBe('string-widget')
      })

      it('should prefer type+format match over type-only match', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('string-widget', {
          factory: mockFactory,
          displayName: 'String',
          supportedTypes: ['string'],
          priority: 0,
        })
        // Type+format widget scores higher: type (50) + format (30) + priority (10) = 90
        // vs type-only: type (50) + priority (0) = 50
        registry.register('email-widget', {
          factory: mockFactory,
          displayName: 'Email',
          supportedTypes: ['string'],
          supportedFormats: ['email'],
          priority: 10,
        })

        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', format: 'email' },
          path: ['email'],
        })

        const result = registry.findBestWidget(ctx)
        expect(result!.name).toBe('email-widget')
      })

      it('should use custom matcher', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('custom-widget', {
          factory: mockFactory,
          displayName: 'Custom',
          matcher: (ctx) => ctx.name === 'special',
          priority: 100,
        })

        const specialCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['special'],
        })

        const normalCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['normal'],
        })

        expect(registry.findBestWidget(specialCtx)!.name).toBe('custom-widget')
        expect(registry.findBestWidget(normalCtx)).toBeNull()
      })

      it('should return null when no matching widget', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('string-widget', {
          factory: mockFactory,
          displayName: 'String',
          supportedTypes: ['string'],
        })

        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'int32' },
          path: ['number'],
        })

        expect(registry.findBestWidget(ctx)).toBeNull()
      })

      it('should exclude widget when matcher returns false', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('conditional-widget', {
          factory: mockFactory,
          displayName: 'Conditional',
          supportedTypes: ['string'],
          matcher: () => false, // Always returns false
        })

        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['field'],
        })

        expect(registry.findBestWidget(ctx)).toBeNull()
      })

      it('should sort by priority as tiebreaker', () => {
        const registry = new DefaultWidgetRegistry()
        registry.register('low-priority', {
          factory: mockFactory,
          displayName: 'Low',
          supportedTypes: ['string'],
          priority: 1,
        })
        registry.register('high-priority', {
          factory: mockFactory,
          displayName: 'High',
          supportedTypes: ['string'],
          priority: 10,
        })

        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['field'],
        })

        expect(registry.findBestWidget(ctx)!.name).toBe('high-priority')
      })
    })

    describe('createChild', () => {
      it('should create child registry inheriting from parent', () => {
        const parent = new DefaultWidgetRegistry()
        parent.register('parent-widget', {
          factory: mockFactory,
          displayName: 'Parent',
        })

        const child = parent.createChild()
        expect(child.has('parent-widget')).toBe(true)
      })

      it('should allow child to override parent widgets', () => {
        const parent = new DefaultWidgetRegistry()
        parent.register('widget', {
          factory: mockFactory,
          displayName: 'Parent Version',
        })

        const child = parent.createChild()
        const childFactory: WidgetFactory = () => 'child'
        child.register('widget', {
          factory: childFactory,
          displayName: 'Child Version',
        })

        expect(child.get('widget')!.displayName).toBe('Child Version')
      })

      it('should combine names from parent and child', () => {
        const parent = new DefaultWidgetRegistry()
        parent.register('parent-only', { factory: mockFactory, displayName: 'P' })

        const child = parent.createChild()
        child.register('child-only', { factory: mockFactory, displayName: 'C' })

        const names = child.names()
        expect(names).toContain('parent-only')
        expect(names).toContain('child-only')
      })

      it('should deduplicate names from parent and child', () => {
        const parent = new DefaultWidgetRegistry()
        parent.register('shared', { factory: mockFactory, displayName: 'P' })

        const child = parent.createChild()
        child.register('shared', { factory: mockFactory, displayName: 'C' })

        const names = child.names()
        expect(names.filter(n => n === 'shared')).toHaveLength(1)
      })

      it('should combine getForType from parent and child', () => {
        const parent = new DefaultWidgetRegistry()
        parent.register('parent-string', {
          factory: mockFactory,
          displayName: 'Parent String',
          supportedTypes: ['string'],
        })

        const child = parent.createChild()
        child.register('child-string', {
          factory: mockFactory,
          displayName: 'Child String',
          supportedTypes: ['string'],
        })

        const widgets = child.getForType('string')
        expect(widgets).toHaveLength(2)
      })
    })
  })

  describe('createWidgetRegistry', () => {
    it('should create a new registry', () => {
      const registry = createWidgetRegistry()
      expect(registry).toBeInstanceOf(DefaultWidgetRegistry)
    })

    it('should create child registry with parent', () => {
      const parent = createWidgetRegistry()
      parent.register('parent-widget', { factory: mockFactory, displayName: 'P' })

      const child = createWidgetRegistry(parent)
      expect(child.has('parent-widget')).toBe(true)
    })
  })

  describe('global registry', () => {
    let originalRegistry: WidgetRegistry | null

    beforeEach(() => {
      // Save original global registry
      originalRegistry = null
      try {
        originalRegistry = getGlobalWidgetRegistry()
      } catch {
        // Ignore if not initialized
      }
    })

    afterEach(() => {
      // Restore original global registry
      if (originalRegistry) {
        setGlobalWidgetRegistry(originalRegistry)
      }
    })

    it('should get global registry (lazily created)', () => {
      const registry = getGlobalWidgetRegistry()
      expect(registry).toBeDefined()
    })

    it('should set global registry', () => {
      const customRegistry = new DefaultWidgetRegistry()
      customRegistry.register('custom', { factory: mockFactory, displayName: 'Custom' })

      setGlobalWidgetRegistry(customRegistry)
      expect(getGlobalWidgetRegistry().has('custom')).toBe(true)
    })
  })

  describe('registration helpers', () => {
    describe('forType', () => {
      it('should create type-based registration', () => {
        const { name, registration } = forType('string', mockFactory)

        expect(name).toBe('type:string')
        expect(registration.supportedTypes).toContain('string')
        expect(registration.displayName).toBe('string widget')
      })

      it('should use custom options', () => {
        const { registration } = forType('string', mockFactory, {
          displayName: 'Custom String',
          description: 'A custom string widget',
          priority: 5,
        })

        expect(registration.displayName).toBe('Custom String')
        expect(registration.description).toBe('A custom string widget')
        expect(registration.priority).toBe(5)
      })
    })

    describe('forFormat', () => {
      it('should create format-based registration', () => {
        const { name, registration } = forFormat('email', mockFactory)

        expect(name).toBe('format:email')
        expect(registration.supportedFormats).toContain('email')
        expect(registration.priority).toBe(10) // Higher than type default
      })
    })

    describe('forTypeAndFormat', () => {
      it('should create type+format registration', () => {
        const { name, registration } = forTypeAndFormat('string', 'email', mockFactory)

        expect(name).toBe('type:string:format:email')
        expect(registration.supportedTypes).toContain('string')
        expect(registration.supportedFormats).toContain('email')
        expect(registration.priority).toBe(20) // Highest default priority
      })
    })

    describe('forMatcher', () => {
      it('should create matcher-based registration', () => {
        const matcher = (ctx: StructureContext) => ctx.name === 'special'
        const { name, registration } = forMatcher('special-matcher', matcher, mockFactory)

        expect(name).toBe('special-matcher')
        expect(registration.matcher).toBe(matcher)
        expect(registration.priority).toBe(50) // Very high priority
      })

      it('should use custom display name', () => {
        const { registration } = forMatcher(
          'test-matcher',
          () => true,
          mockFactory,
          { displayName: 'Special Widget' }
        )

        expect(registration.displayName).toBe('Special Widget')
      })
    })
  })

  describe('integration: widget resolution flow', () => {
    it('should resolve widget through full flow', () => {
      // Set up registry
      const registry = createWidgetRegistry()

      // Register type-only widget
      const { name: stringName, registration: stringReg } = forType('string', mockFactory)
      registry.register(stringName, stringReg)

      // Register format-only widget (for email format)
      // This only matches when format is 'email', not when type is 'string' without format
      const { name: emailName, registration: emailReg } = forFormat('email', mockFactory)
      registry.register(emailName, emailReg)

      const { name: customName, registration: customReg } = forMatcher(
        'special-field',
        ctx => ctx.name === 'specialEmail',
        mockFactory,
        { displayName: 'Special Email Widget' }
      )
      registry.register(customName, customReg)

      // Test resolution for plain string (no format)
      // type:string scores: type (50) + priority (0) = 50
      // format:email scores: 0 (no format match since no format in definition)
      const stringCtx = new StructureContext({
        schema: baseSchema,
        definition: { type: 'string' },
        path: ['name'],
      })
      expect(registry.findBestWidget(stringCtx)!.name).toBe('type:string')

      // Test resolution for string with email format
      // type:string scores: type (50) + priority (0) = 50
      // format:email scores: format (30) + priority (10) = 40
      // type:string wins because type match (50) > format match (30+10)
      const emailCtx = new StructureContext({
        schema: baseSchema,
        definition: { type: 'string', format: 'email' },
        path: ['email'],
      })
      expect(registry.findBestWidget(emailCtx)!.name).toBe('type:string')

      // Test resolution for special field - custom matcher has highest priority (100)
      const specialCtx = new StructureContext({
        schema: baseSchema,
        definition: { type: 'string', format: 'email' },
        path: ['specialEmail'],
      })
      expect(registry.findBestWidget(specialCtx)!.name).toBe('special-field')
    })

    it('should prefer combined type+format widget when format matches', () => {
      const registry = createWidgetRegistry()

      // Register type-only widget
      const { name: stringName, registration: stringReg } = forType('string', mockFactory)
      registry.register(stringName, stringReg)

      // Register combined type+format widget
      const { name: emailName, registration: emailReg } = forTypeAndFormat('string', 'email', mockFactory)
      registry.register(emailName, emailReg)

      // For string with email format:
      // type:string scores: type (50) + priority (0) = 50
      // type:string:format:email scores: type (50) + format (30) + priority (20) = 100
      const emailCtx = new StructureContext({
        schema: baseSchema,
        definition: { type: 'string', format: 'email' },
        path: ['email'],
      })
      expect(registry.findBestWidget(emailCtx)!.name).toBe('type:string:format:email')
    })
  })
})
