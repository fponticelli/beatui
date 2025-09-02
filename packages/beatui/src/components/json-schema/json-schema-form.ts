import { type SchemaObject } from 'ajv'
import {
  html,
  Value,
  attr,
  Renderable,
  Fragment,
  OnDispose,
  Async,
} from '@tempots/dom'
import { Validation } from '@tempots/std'
import { Controller, ControllerValidation, useController } from '../form'
import { ajvErrorsToControllerValidation, getAjvForSchema } from './ajv-utils'
import { JSONSchemaControl } from './controls'

export function JSONSchemaForm<T>(
  {
    schema,
    initialValue,
    externalSchemas,
    refResolver,
  }: {
    schema: SchemaObject
    initialValue: Value<T>
    externalSchemas?: ReadonlyArray<SchemaObject>
    refResolver?: (
      ids: ReadonlyArray<string>
    ) => Promise<ReadonlyArray<SchemaObject>>
  },
  fn: ({
    Form,
    controller,
    setStatus,
  }: {
    Form: Renderable
    controller: Controller<T>
    setStatus: (result: ControllerValidation) => void
  }) => Renderable
): Renderable {
  return Async(
    getAjvForSchema(schema, { externalSchemas, refResolver }),
    result => {
      if (result.ok) {
        const { ajv, validate } = result.value
        const { controller, setStatus } = useController({
          initialValue,
          validate: (value: T) => {
            const ok = validate(value)
            if (ok) return Validation.valid
            return ajvErrorsToControllerValidation(validate.errors ?? [])
          },
        })
        // Pass AJV for conditional evaluation in combinators
        const Form = Fragment(
          OnDispose(controller.dispose),
          JSONSchemaControl({ schema, controller, ajv })
        )
        return fn({ Form, controller, setStatus })
      }
      return html.div(attr.class('bu-text-red-600'), result.error)
    }
  )
}
