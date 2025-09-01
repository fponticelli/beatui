import { JSONSchema } from '../schema-context'

export function getUIFormat(definition: JSONSchema): string | undefined {
  const raw = (definition as unknown as Record<string, unknown>)['x:ui']
  if (raw == null) return undefined
  if (typeof raw === 'string') return raw
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const widget = (o['widget'] ?? o['format']) as unknown
    if (typeof widget === 'string') return widget
  }
  return undefined
}
