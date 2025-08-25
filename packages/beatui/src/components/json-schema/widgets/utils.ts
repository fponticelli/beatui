import { JSONSchema7 } from 'json-schema'

export function getUIWidget(definition: JSONSchema7): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (definition as any)['ui:widget']
}
