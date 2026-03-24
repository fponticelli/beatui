import type { z } from 'zod'
import type { DefinedComponent, ComponentGroup, PromptOptions } from './types.js'

/**
 * Extract a human-readable type name from a Zod v4 field.
 * In Zod v4, the type is stored at `_def.type` (not `typeName`).
 */
function getZodTypeName(field: z.ZodType): string {
  const def = (field as any)._def
  if (!def) return 'unknown'

  const type: string = def.type ?? 'unknown'

  switch (type) {
    case 'string':
      return 'string'
    case 'number':
    case 'int':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'bigint':
      return 'bigint'
    case 'null':
      return 'null'
    case 'undefined':
      return 'undefined'
    case 'any':
    case 'unknown':
      return type
    case 'enum': {
      const entries = def.entries
      if (entries && typeof entries === 'object') {
        // For native enums and string enums, entries is an object like { A: 'a', B: 'b' }
        // or an array-like. Get the values.
        const values = Object.values(entries) as string[]
        return values.map(v => JSON.stringify(v)).join(' | ')
      }
      return 'enum'
    }
    case 'literal': {
      const value = def.value
      return JSON.stringify(value)
    }
    case 'optional': {
      const inner = def.innerType
      if (inner) {
        return `${getZodTypeName(inner)} | undefined`
      }
      return 'optional'
    }
    case 'nullable': {
      const inner = def.innerType
      if (inner) {
        return `${getZodTypeName(inner)} | null`
      }
      return 'nullable'
    }
    case 'array': {
      const element = def.element
      if (element) {
        return `${getZodTypeName(element)}[]`
      }
      return 'array'
    }
    case 'object':
      return 'object'
    case 'union': {
      const options = def.options
      if (Array.isArray(options)) {
        return options.map((o: z.ZodType) => getZodTypeName(o)).join(' | ')
      }
      return 'union'
    }
    case 'record':
      return 'record'
    case 'map':
      return 'map'
    case 'set':
      return 'set'
    case 'tuple':
      return 'tuple'
    case 'date':
      return 'Date'
    case 'transform':
    case 'pipe': {
      const inner = def.innerType ?? def.in
      if (inner) return getZodTypeName(inner)
      return type
    }
    default:
      return type
  }
}

function generateComponentSection(component: DefinedComponent): string {
  const lines: string[] = []
  lines.push(`### ${component.name}`)
  lines.push('')
  lines.push(component.description)
  lines.push('')

  const shape = component.props.shape
  const entries = Object.entries(shape)

  if (entries.length > 0) {
    lines.push('**Props** (positional order):')
    for (const [key, field] of entries) {
      const typeName = getZodTypeName(field as z.ZodType)
      const fieldDef = (field as any)._def
      const isOptional =
        fieldDef?.type === 'optional' ||
        (field as any)._zod?.optin === 'optional'
      const optionalMark = isOptional ? '?' : ''
      lines.push(`- \`${key}${optionalMark}\`: ${typeName}`)
    }
  } else {
    lines.push('No props.')
  }

  return lines.join('\n')
}

/**
 * Generate an LLM system prompt for OpenUI Lang.
 */
export function generatePrompt(
  components: ReadonlyMap<string, DefinedComponent>,
  groups?: ComponentGroup[],
  options?: PromptOptions
): string {
  const lines: string[] = []

  lines.push('# OpenUI Lang System Prompt')
  lines.push('')
  lines.push('## Syntax')
  lines.push('')
  lines.push(
    'OpenUI Lang uses a simple declarative syntax where each statement takes the form:'
  )
  lines.push('')
  lines.push('```')
  lines.push('identifier = Expression')
  lines.push('```')
  lines.push('')
  lines.push(
    'Components are instantiated by name with positional arguments matching their prop order.'
  )
  lines.push(
    'Children are nested inside component blocks using indentation or braces.'
  )
  lines.push('')

  lines.push('## Available Components')
  lines.push('')

  if (groups && groups.length > 0) {
    // Collect all grouped component names for "ungrouped" fallback
    const groupedNames = new Set(groups.flatMap(g => g.components))

    for (const group of groups) {
      lines.push(`### Group: ${group.name}`)
      lines.push('')
      lines.push(group.description)
      lines.push('')

      for (const compName of group.components) {
        const comp = components.get(compName)
        if (comp) {
          lines.push(generateComponentSection(comp))
          lines.push('')
        }
      }
    }

    // Add any ungrouped components
    const ungrouped = [...components.values()].filter(
      c => !groupedNames.has(c.name)
    )
    if (ungrouped.length > 0) {
      lines.push('### Other Components')
      lines.push('')
      for (const comp of ungrouped) {
        lines.push(generateComponentSection(comp))
        lines.push('')
      }
    }
  } else {
    // No groups, just list all components
    for (const comp of components.values()) {
      lines.push(generateComponentSection(comp))
      lines.push('')
    }
  }

  lines.push('## Rules')
  lines.push('')
  lines.push('- Always use component names exactly as documented.')
  lines.push('- Provide props in the documented positional order.')
  lines.push('- Optional props may be omitted or passed as `undefined`.')
  lines.push('- Do not invent component names not listed above.')

  if (options?.additionalRules && options.additionalRules.length > 0) {
    for (const rule of options.additionalRules) {
      lines.push(`- ${rule}`)
    }
  }

  return lines.join('\n')
}
