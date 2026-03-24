import { z } from 'zod'
import type { DefinedComponent, ComponentGroup, Library, PromptOptions } from './types.js'
import { generatePrompt } from './prompt-generator.js'

function buildMap(components: DefinedComponent[]): Map<string, DefinedComponent> {
  const map = new Map<string, DefinedComponent>()
  for (const comp of components) {
    map.set(comp.name, comp)
  }
  return map
}

function componentToJSONSchema(comp: DefinedComponent): object {
  // Use Zod v4's built-in toJSONSchema if available
  try {
    const result = z.toJSONSchema(comp.props as unknown as z.ZodType)
    return result as object
  } catch {
    // Fall back to manual conversion
    const properties: Record<string, unknown> = {}
    const required: string[] = []

    for (const [key, field] of Object.entries(comp.props.shape)) {
      const fieldAny = field as any
      const fieldDef = fieldAny._def
      const isOptional =
        fieldDef?.type === 'optional' ||
        fieldAny._zod?.optin === 'optional'

      if (!isOptional) {
        required.push(key)
      }

      const innerField = isOptional ? fieldDef?.innerType ?? field : field
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

function fieldToJSONSchemaProperty(field: unknown): object {
  const fieldAny = field as any
  const def = fieldAny?._def
  if (!def) return {}

  const type: string = def.type ?? 'unknown'

  switch (type) {
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
    case 'array': {
      const element = def.element
      return {
        type: 'array',
        items: element ? fieldToJSONSchemaProperty(element) : {},
      }
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
      const entries = def.entries
      if (entries && typeof entries === 'object') {
        const values = Object.values(entries)
        return { enum: values }
      }
      return { type: 'string' }
    }
    case 'literal': {
      return { const: def.value }
    }
    case 'optional':
    case 'nullable': {
      if (def.innerType) {
        return fieldToJSONSchemaProperty(def.innerType)
      }
      return {}
    }
    case 'union': {
      const options = def.options
      if (Array.isArray(options)) {
        return { oneOf: options.map(fieldToJSONSchemaProperty) }
      }
      return {}
    }
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
      // Merge stored groups with option groups (option groups take precedence)
      const mergedGroups = options?.groups ?? groups
      return generatePrompt(map, mergedGroups, options)
    },

    toJSONSchema(): object {
      const result: Record<string, object> = {}
      for (const [name, comp] of map) {
        result[name] = componentToJSONSchema(comp)
      }
      return result
    },

    extend(extConfig: { components?: DefinedComponent[]; root?: string }): Library {
      // Merge components: existing ones first, new ones override on name collision
      const merged = new Map(map)
      if (extConfig.components) {
        for (const comp of extConfig.components) {
          merged.set(comp.name, comp)
        }
      }
      const newRoot = extConfig.root ?? root
      return createLibrary({
        components: [...merged.values()],
        root: newRoot,
        groups,
      })
    },
  }

  return library
}
