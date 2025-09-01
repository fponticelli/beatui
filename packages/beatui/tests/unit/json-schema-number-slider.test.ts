import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'
import { useController } from '../../src/components/form'
import { JSONSchemaControl } from '../../src/components/json-schema/controls/generic-control'
import type { JSONSchema } from '../../src/components/json-schema/schema-context'

describe('JSON Schema Number Slider', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('autodetects slider for bounded numeric ranges with multipleOf', () => {
    const schema: JSONSchema = {
      type: 'number',
      minimum: 0,
      maximum: 100,
      multipleOf: 10,
      title: 'Score',
    }

    const { controller } = useController({ initialValue: 50, validate: () => ({ valid: true }) })

    render(WithProviders(() => JSONSchemaControl({ schema, controller })), container)

    const slider = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(slider).toBeTruthy()
    expect(slider.min).toBe('0')
    expect(slider.max).toBe('100')
    expect(slider.step).toBe('10')
  })

  it('uses slider when x:ui.format is set to slider', () => {
    const schema: JSONSchema = {
      type: 'number',
      'x:ui': { format: 'slider' },
      minimum: 1,
      maximum: 5,
    }

    const { controller } = useController({ initialValue: 3, validate: () => ({ valid: true }) })

    render(WithProviders(() => JSONSchemaControl({ schema, controller })), container)

    const slider = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(slider).toBeTruthy()
  })

  it('renders nullable slider when schema allows null', () => {
    const schema: JSONSchema = {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 10,
      multipleOf: 1,
    }

    const { controller } = useController({ initialValue: null, validate: () => ({ valid: true }) })

    render(WithProviders(() => JSONSchemaControl({ schema, controller })), container)

    const slider = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(slider).toBeTruthy()
  })
})

