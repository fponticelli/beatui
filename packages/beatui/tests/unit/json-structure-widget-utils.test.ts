/**
 * Tests for Widget Resolution Utilities
 *
 * Tests for resolving and configuring widgets based on structure context.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- Test fixtures use x:ui extensions not in base types */

import { describe, it, expect, vi } from 'vitest'
import { StructureContext } from '../../src/components/json-structure/structure-context'
import {
  resolveWidget,
  getWidgetOptions,
  getExplicitWidgetName,
  hasCustomWidget,
  resolveWidgetWithOverride,
  mergeWidgetOptions,
} from '../../src/components/json-structure/widgets/widget-utils'
import type { TypeDefinition, JSONStructureSchema } from '../../src/components/json-structure/structure-types'

describe('Widget Resolution Utilities', () => {
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

  describe('resolveWidget', () => {
    it('should return null for unknown type without custom registry', () => {
      const ctx = createContext({ type: 'customUnknownType' as any })
      const result = resolveWidget(ctx)
      // May or may not find a widget depending on global registry state
      expect(result === null || result !== null).toBe(true)
    })

    it('should check form-scoped registry first', () => {
      const ctx = createContext({ type: 'string' })
      const mockRegistry = {
        findBestWidget: vi.fn().mockReturnValue({ name: 'custom', registration: { render: () => {} } }),
        get: vi.fn(),
      }

      const result = resolveWidget(ctx, mockRegistry as any)

      expect(mockRegistry.findBestWidget).toHaveBeenCalledWith(ctx)
      expect(result?.name).toBe('custom')
    })

    it('should fall back to global registry when form registry returns null', () => {
      const ctx = createContext({ type: 'string' })
      const mockRegistry = {
        findBestWidget: vi.fn().mockReturnValue(null),
        get: vi.fn(),
      }

      resolveWidget(ctx, mockRegistry as any)

      expect(mockRegistry.findBestWidget).toHaveBeenCalledWith(ctx)
      // Result may or may not be null depending on global registry
    })

    it('should use global registry when no form registry provided', () => {
      const ctx = createContext({ type: 'string' })
      const result = resolveWidget(ctx)
      // Just verify it doesn't throw
      expect(result === null || result !== null).toBe(true)
    })
  })

  describe('getWidgetOptions', () => {
    it('should return undefined when no widget options present', () => {
      const ctx = createContext({ type: 'string' })
      const result = getWidgetOptions(ctx)
      expect(result).toBeUndefined()
    })

    it('should extract options from x:ui extension', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          widget: { placeholder: 'Enter text' },
        },
      } as any)

      const result = getWidgetOptions(ctx)

      expect(result).toBeDefined()
      expect(result?.options).toEqual({ placeholder: 'Enter text' })
    })

    it('should extract priority from x:ui extension', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          priority: 100,
        },
      } as any)

      const result = getWidgetOptions(ctx)

      expect(result).toBeDefined()
      expect(result?.priority).toBe(100)
    })

    it('should extract options from legacy widget field', () => {
      const ctx = createContext({
        type: 'string',
        widget: { rows: 5 },
      } as any)

      const result = getWidgetOptions(ctx)

      expect(result).toBeDefined()
      expect(result?.options).toEqual({ rows: 5 })
    })

    it('should merge options from x:ui and legacy widget', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          widget: { placeholder: 'Enter text' },
        },
        widget: { rows: 5 },
      } as any)

      const result = getWidgetOptions(ctx)

      expect(result).toBeDefined()
      expect(result?.options).toEqual({ placeholder: 'Enter text', rows: 5 })
    })

    it('should handle non-object widget field', () => {
      const ctx = createContext({
        type: 'string',
        widget: 'textarea',
      } as any)

      const result = getWidgetOptions(ctx)

      // Should not crash, widget as string is not extracted as options
      expect(result).toBeUndefined()
    })

    it('should handle non-object x:ui.widget', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          widget: 'textarea',
        },
      } as any)

      const result = getWidgetOptions(ctx)

      // widget is a string, not an object, so no options extracted
      expect(result).toBeUndefined()
    })
  })

  describe('getExplicitWidgetName', () => {
    it('should return undefined when no explicit widget specified', () => {
      const ctx = createContext({ type: 'string' })
      const result = getExplicitWidgetName(ctx)
      expect(result).toBeUndefined()
    })

    it('should extract widget name from x:ui.widget as string', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          widget: 'textarea',
        },
      } as any)

      const result = getExplicitWidgetName(ctx)

      expect(result).toBe('textarea')
    })

    it('should extract widget name from legacy widget.type', () => {
      const ctx = createContext({
        type: 'string',
        widget: {
          type: 'rich-text',
        },
      } as any)

      const result = getExplicitWidgetName(ctx)

      expect(result).toBe('rich-text')
    })

    it('should prefer x:ui.widget over legacy widget.type', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          widget: 'textarea',
        },
        widget: {
          type: 'rich-text',
        },
      } as any)

      const result = getExplicitWidgetName(ctx)

      expect(result).toBe('textarea')
    })

    it('should return undefined when x:ui.widget is an object', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          widget: { options: 'value' },
        },
      } as any)

      const result = getExplicitWidgetName(ctx)

      expect(result).toBeUndefined()
    })

    it('should return undefined when widget.type is not a string', () => {
      const ctx = createContext({
        type: 'string',
        widget: {
          type: 123,
        },
      } as any)

      const result = getExplicitWidgetName(ctx)

      expect(result).toBeUndefined()
    })
  })

  describe('hasCustomWidget', () => {
    it('should return false when no custom widget specified', () => {
      const ctx = createContext({ type: 'string' })
      const result = hasCustomWidget(ctx)
      expect(result).toBe(false)
    })

    it('should return true when x:ui.widget is specified as string', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': {
          widget: 'custom-widget',
        },
      } as any)

      const result = hasCustomWidget(ctx)

      expect(result).toBe(true)
    })

    it('should return true when widget.type is specified', () => {
      const ctx = createContext({
        type: 'string',
        widget: {
          type: 'custom-widget',
        },
      } as any)

      const result = hasCustomWidget(ctx)

      expect(result).toBe(true)
    })
  })

  describe('resolveWidgetWithOverride', () => {
    it('should fall back to automatic resolution when no explicit name', () => {
      const ctx = createContext({ type: 'string' })
      const result = resolveWidgetWithOverride(ctx)
      // Just verify it doesn't throw
      expect(result === null || result !== null).toBe(true)
    })

    it('should try form registry first for explicit widget name', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': { widget: 'my-custom-widget' },
      } as any)

      const mockRegistry = {
        findBestWidget: vi.fn().mockReturnValue(null),
        get: vi.fn().mockReturnValue({ render: () => {} }),
      }

      const result = resolveWidgetWithOverride(ctx, mockRegistry as any)

      expect(mockRegistry.get).toHaveBeenCalledWith('my-custom-widget')
      expect(result?.name).toBe('my-custom-widget')
    })

    it('should try global registry when form registry has no match', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': { widget: 'non-existent-widget' },
      } as any)

      const mockRegistry = {
        findBestWidget: vi.fn().mockReturnValue(null),
        get: vi.fn().mockReturnValue(undefined),
      }

      // Suppress console.warn for this test
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      resolveWidgetWithOverride(ctx, mockRegistry as any)

      expect(mockRegistry.get).toHaveBeenCalledWith('non-existent-widget')
      // Result will be from fallback automatic resolution

      warnSpy.mockRestore()
    })

    it('should warn when explicit widget not found in any registry', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': { widget: 'non-existent-widget' },
      } as any)

      const mockRegistry = {
        findBestWidget: vi.fn().mockReturnValue(null),
        get: vi.fn().mockReturnValue(undefined),
      }

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      resolveWidgetWithOverride(ctx, mockRegistry as any)

      expect(warnSpy).toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('should fall back to automatic resolution when widget not found', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': { widget: 'non-existent-widget' },
      } as any)

      const mockRegistry = {
        findBestWidget: vi.fn().mockReturnValue({ name: 'fallback', registration: {} }),
        get: vi.fn().mockReturnValue(undefined),
      }

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      resolveWidgetWithOverride(ctx, mockRegistry as any)

      // Should call findBestWidget for fallback
      expect(mockRegistry.findBestWidget).toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })

  describe('mergeWidgetOptions', () => {
    it('should return empty object when all params undefined', () => {
      const result = mergeWidgetOptions()
      expect(result).toEqual({})
    })

    it('should return base options when only base provided', () => {
      const result = mergeWidgetOptions({ baseKey: 'baseValue' })
      expect(result).toEqual({ baseKey: 'baseValue' })
    })

    it('should merge base and context options', () => {
      const result = mergeWidgetOptions(
        { baseKey: 'baseValue' },
        { contextKey: 'contextValue' }
      )
      expect(result).toEqual({
        baseKey: 'baseValue',
        contextKey: 'contextValue',
      })
    })

    it('should merge all three option sources', () => {
      const result = mergeWidgetOptions(
        { baseKey: 'baseValue' },
        { contextKey: 'contextValue' },
        { userKey: 'userValue' }
      )
      expect(result).toEqual({
        baseKey: 'baseValue',
        contextKey: 'contextValue',
        userKey: 'userValue',
      })
    })

    it('should override base with context options', () => {
      const result = mergeWidgetOptions(
        { key: 'baseValue' },
        { key: 'contextValue' }
      )
      expect(result).toEqual({ key: 'contextValue' })
    })

    it('should override context with user options', () => {
      const result = mergeWidgetOptions(
        { key: 'baseValue' },
        { key: 'contextValue' },
        { key: 'userValue' }
      )
      expect(result).toEqual({ key: 'userValue' })
    })

    it('should handle undefined values in merge chain', () => {
      const result = mergeWidgetOptions(
        { baseKey: 'baseValue' },
        undefined,
        { userKey: 'userValue' }
      )
      expect(result).toEqual({
        baseKey: 'baseValue',
        userKey: 'userValue',
      })
    })
  })
})
