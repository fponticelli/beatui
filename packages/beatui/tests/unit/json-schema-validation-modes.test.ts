import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { useController } from '../../src/components/form'
import { JSONSchemaControl } from '../../src/components/json-schema/controls/generic-control'
import type { JSONSchema } from '../../src/components/json-schema/schema-context'
import {
  ajvErrorsToControllerValidation,
  getAjvForSchema,
} from '../../src/components/json-schema/ajv-utils'
import { Validation } from '@tempots/std'

describe('JSON Schema validation modes', () => {
  let container: HTMLElement
  const schema: JSONSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, title: 'Name' },
    },
    required: ['name'],
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    container.innerHTML = ''
  })

  it('touchedOrSubmit: validates on change, shows only after touched', async () => {
    const ajv = await getAjvForSchema(schema)
    if (!ajv.ok) throw new Error(ajv.error)
    const validate = ajv.value.validate

    const { controller } = useController({
      initialValue: { name: '' },
      validationMode: 'touchedOrSubmit',
      validate: v =>
        validate(v)
          ? Validation.valid
          : ajvErrorsToControllerValidation(validate.errors ?? []),
    })

    render(
      WithProviders(() => JSONSchemaControl({ schema, controller })),
      container
    )

    const obj = controller.object()
    const nameCtl = obj.field('name')
    await nameCtl.change('a') // invalid (minLength 2)

    // Status invalid but error hidden until touched
    expect(nameCtl.error.value).toBeDefined()
    expect(nameCtl.errorVisible.value).toBe(false)

    nameCtl.markTouched()
    expect(nameCtl.errorVisible.value).toBe(true)
  })

  it('continuous: shows errors immediately without touch', async () => {
    const ajv = await getAjvForSchema(schema)
    if (!ajv.ok) throw new Error(ajv.error)
    const validate = ajv.value.validate

    const { controller } = useController({
      initialValue: { name: '' },
      validationMode: 'continuous',
      validate: v =>
        validate(v)
          ? Validation.valid
          : ajvErrorsToControllerValidation(validate.errors ?? []),
    })

    render(
      WithProviders(() => JSONSchemaControl({ schema, controller })),
      container
    )

    const objSubmit = controller.object()
    const nameCtl = objSubmit.field('name')
    await nameCtl.change('a')
    expect(nameCtl.errorVisible.value).toBe(true)
  })

  it('onSubmit: skips validation on change; visible after manual setStatus + touched', async () => {
    const ajv = await getAjvForSchema(schema)
    if (!ajv.ok) throw new Error(ajv.error)
    const validate = ajv.value.validate

    const { controller, setStatus } = useController({
      initialValue: { name: '' },
      validationMode: 'onSubmit',
      validate: v =>
        validate(v)
          ? Validation.valid
          : ajvErrorsToControllerValidation(validate.errors ?? []),
    })

    render(
      WithProviders(() => JSONSchemaControl({ schema, controller })),
      container
    )

    const objSubmit = controller.object()
    const nameCtl = objSubmit.field('name')
    await nameCtl.change('a')
    // Validation should be skipped on change
    expect(controller.status.value.type).toBe('valid')
    expect(nameCtl.errorVisible.value).toBe(false)

    // Simulate submit: mark all touched and set status manually
    objSubmit.markAllTouched()
    const v = controller.signal.value
    const res = validate(v)
    setStatus(
      res
        ? Validation.valid
        : ajvErrorsToControllerValidation(validate.errors ?? [])
    )
    await Promise.resolve()
    expect(nameCtl.touched.value).toBe(true)
    expect(nameCtl.errorVisible.value).toBe(true)
  })
})
