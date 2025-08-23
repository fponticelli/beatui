import type { JSONSchema7Definition } from 'json-schema'
import Ajv from 'ajv'
import { html, TNode, Value, attr } from '@tempots/dom'
import { Validation } from '@tempots/std'
import { useController } from '../form'
import { compileSchema, ajvErrorsToControllerValidation } from './ajv-utils'
import { JSONSchemaControl } from './controls'

export function JSONSchemaForm<T>({
  schema,
  initialValue,
  onChange,
  ajv: maybeAjv,
}: {
  schema: JSONSchema7Definition
  initialValue: Value<T>
  onChange?: (value: T) => void
  ajv?: Ajv
}): TNode {
  const ajv = maybeAjv ?? new Ajv({ allErrors: true })
  const result = compileSchema(schema, ajv)
  if (result.ok) {
    const validate = result.value
    const { controller } = useController({
      initialValue,
      validate: (value: T) => {
        const ok = validate(value)
        if (ok) return Validation.valid
        return ajvErrorsToControllerValidation(validate.errors ?? [])
      },
      onChange,
    })
    return JSONSchemaControl({ schema, controller })
  }
  return html.div(attr.class('bu-text-red-600'), result.error)
}
