import type { JSONSchema7Definition } from 'json-schema'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import {
  html,
  Value,
  attr,
  Renderable,
  prop,
  Fragment,
  OnDispose,
} from '@tempots/dom'
import { Validation } from '@tempots/std'
import { Controller, ControllerValidation, useController } from '../form'
import { compileSchema, ajvErrorsToControllerValidation } from './ajv-utils'
import { JSONSchemaControl } from './controls'

export function JSONSchemaForm<T>({
  schema,
  initialValue,
  ajv: maybeAjv,
}: {
  schema: JSONSchema7Definition
  initialValue: Value<T>
  ajv?: Ajv
}): {
  Form: Renderable
  controller: Controller<T>
  setStatus: (result: ControllerValidation) => void
} {
  const ajv =
    maybeAjv ??
    (() => {
      const ajv = new Ajv({ allErrors: true })
      addFormats(ajv)
      ajv.addKeyword({
        keyword: 'ui:widget',
        type: 'string',
        validate: () => true,
      })
      return ajv
    })()
  const result = compileSchema(schema, ajv)
  if (result.ok) {
    const validate = result.value
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
    return { Form, controller, setStatus }
  }
  return {
    Form: html.div(attr.class('bu-text-red-600'), result.error),
    controller: new Controller(
      [],
      () => {},
      Value.toSignal(initialValue),
      prop<ControllerValidation>(Validation.valid),
      {
        disabled: prop(false),
      }
    ),
    setStatus: () => {},
  }
}
