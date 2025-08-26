import type { JSONSchema7Definition } from 'json-schema'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { html, TNode, Value, attr } from '@tempots/dom'
import { Validation } from '@tempots/std'
import { useController } from '../form'
import { compileSchema, ajvErrorsToControllerValidation } from './ajv-utils'
import { JSONSchemaControl } from './controls'

/*
TODO

- [ ] date: full-date according to RFC3339 (opens new window).
- [ ] time: time (time-zone is mandatory).
- [ ] date-time: date-time (time-zone is mandatory).
- [ ] iso-time: time with optional time-zone.
- [ ] iso-date-time: date-time with optional time-zone.
- [ ] duration: duration from RFC3339(opens new window)
- [ ] uri: full URI.
- [ ] uri-reference: URI reference, including full and relative URIs.
- [ ] uri-template: URI template according to RFC6570(opens new window)
- [ ] url (deprecated): URL record (opens new window).
- [x] email: email address.
- [ ] hostname: host name according to RFC1034 (opens new window).
- [ ] ipv4: IP address v4.
- [ ] ipv6: IP address v6.
- [ ] regex: tests whether a string is a valid regular expression by passing it to RegExp constructor.
- [ ] uuid: Universally Unique IDentifier according to RFC4122 (opens new window).
- [ ] json-pointer: JSON-pointer according to RFC6901 (opens new window).
- [ ] relative-json-pointer: relative JSON-pointer according to this draft (opens new window).
- [ ] byte: base64 encoded data according to the openApi 3.0.0 specification(opens new window)
- [ ] int32: signed 32 bits integer according to the openApi 3.0.0 specification(opens new window)
- [ ] int64: signed 64 bits according to the openApi 3.0.0 specification(opens new window)
- [ ] float: float according to the openApi 3.0.0 specification(opens new window)
- [ ] double: double according to the openApi 3.0.0 specification(opens new window)
- [x] password: password string according to the openApi 3.0.0 specification(opens new window)
- [ ] binary: binary string according to the openApi 3.0.0 specification
*/

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
    const { controller } = useController({
      initialValue,
      validate: (value: T) => {
        const ok = validate(value)
        if (ok) return Validation.valid
        return ajvErrorsToControllerValidation(validate.errors ?? [])
      },
      onChange,
    })
    // Pass AJV for conditional evaluation in combinators
    return JSONSchemaControl({ schema, controller, ajv })
  }
  return html.div(attr.class('bu-text-red-600'), result.error)
}
