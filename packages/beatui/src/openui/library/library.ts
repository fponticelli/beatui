import { z } from 'zod'
import type {
  DefinedComponent,
  ComponentGroup,
  Library,
  PromptOptions,
} from './types.js'
import { generatePrompt } from './prompt-generator.js'

/**
 * Internal Zod v4 _def shape for schema introspection.
 */
interface ZodDef {
  type?: string
  entries?: Record<string, string>
  value?: unknown
  innerType?: z.ZodType
  element?: z.ZodType
  options?: z.ZodType[]
  shape?: Record<string, z.ZodType>
}

function getZodDef(field: unknown): ZodDef {
  return ((field as { _def?: ZodDef })?._def) ?? {}
}

function buildMap(
  components: DefinedComponent[]
): Map<string, DefinedComponent> {
  const map = new Map<string, DefinedComponent>()
  for (const comp of components) {
    map.set(comp.name, comp)
  }
  return map
}

function componentToJSONSchema(comp: DefinedComponent): Record<string, unknown> {
  // Use Zod v4's built-in toJSONSchema if available
  try {
    return z.toJSONSchema(comp.props as unknown as z.ZodType) as Record<string, unknown>
  } catch {
    // Fall back to manual conversion
    const properties: Record<string, unknown> = {}
    const required: string[] = []

    for (const [key, field] of Object.entries(comp.props.shape)) {
      const def = getZodDef(field)
      const isOptional = def.type === 'optional'

      if (!isOptional) {
        required.push(key)
      }

      const innerField = isOptional && def.innerType ? def.innerType : field
      properties[key] = fieldToJSONSchemaProperty(innerField)
    }

    const schema: Record<string, unknown> = {
      type: 'object',
      properties,
    }
    if (required.length > 0) {
      schema.required = required
    }
    return schema
  }
}

function fieldToJSONSchemaProperty(field: unknown): Record<string, unknown> {
  const def = getZodDef(field)
  if (!def.type) return {}

  switch (def.type) {
    case 'string':
      return { type: 'string' }
    case 'number':
    case 'int':
      return { type: 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'bigint':
      return { type: 'integer' }
    case 'null':
      return { type: 'null' }
    case 'array':
      return {
        type: 'array',
        items: def.element ? fieldToJSONSchemaProperty(def.element) : {},
      }
    case 'object': {
      const properties: Record<string, unknown> = {}
      if (def.shape) {
        for (const [k, v] of Object.entries(def.shape)) {
          properties[k] = fieldToJSONSchemaProperty(v)
        }
      }
      return { type: 'object', properties }
    }
    case 'enum': {
      if (def.entries && typeof def.entries === 'object') {
        return { enum: Object.values(def.entries) }
      }
      return { type: 'string' }
    }
    case 'literal':
      return { const: def.value }
    case 'optional':
    case 'nullable':
      return def.innerType ? fieldToJSONSchemaProperty(def.innerType) : {}
    case 'union':
      return Array.isArray(def.options)
        ? { oneOf: def.options.map(fieldToJSONSchemaProperty) }
        : {}
    default:
      return {}
  }
}

export interface CreateLibraryConfig {
  components: DefinedComponent[]
  root?: string
  groups?: ComponentGroup[]
}

export function createLibrary(config: CreateLibraryConfig): Library {
  const map = buildMap(config.components)
  const root = config.root
  const groups = config.groups

  const library: Library = {
    get components(): ReadonlyMap<string, DefinedComponent> {
      return map
    },

    get root(): string | undefined {
      return root
    },

    get(name: string): DefinedComponent | undefined {
      return map.get(name)
    },

    has(name: string): boolean {
      return map.has(name)
    },

    prompt(options?: PromptOptions): string {
      const mergedGroups = options?.groups ?? groups
      return generatePrompt(map, mergedGroups, options)
    },

    toJSONSchema(): Record<string, unknown> {
      const result: Record<string, unknown> = {}
      for (const [name, comp] of map) {
        result[name] = componentToJSONSchema(comp)
      }
      return result
    },

    extend(extConfig: {
      components?: DefinedComponent[]
      root?: string
    }): Library {
      const merged = new Map(map)
      if (extConfig.components) {
        for (const comp of extConfig.components) {
          merged.set(comp.name, comp)
        }
      }
      return createLibrary({
        components: [...merged.values()],
        root: extConfig.root ?? root,
        groups,
      })
    },
  }

  return library
}
