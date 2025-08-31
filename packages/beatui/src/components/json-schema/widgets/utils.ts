import { JSONSchema } from '../schema-context'

export function getUIInfo(definition: JSONSchema): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (definition as any)['x:ui']
}
