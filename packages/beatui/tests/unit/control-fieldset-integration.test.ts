import { describe, it, expect, beforeEach } from 'vitest'
import { render, html } from '@tempots/dom'
import { Fieldset } from '../../src/components/form/fieldset/fieldset'
import { Field } from '../../src/components/form/input/field'
import { Control } from '../../src/components/form/control/control'
import { useController } from '../../src/components/form'
import { TextInput } from '../../src/components/form/input/text-input'

describe('Control + Fieldset integration', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('Control inside Fieldset inherits layout from FieldLayout provider', () => {
    const { controller } = useController<string>({ initialValue: 'hello' })

    render(
      Fieldset(
        { layout: 'horizontal-fixed', legend: 'Settings' },
        Control(TextInput, {
          controller,
          label: 'Name',
        })
      ),
      container
    )

    // Control uses Field internally; Field reads FieldLayout from the
    // Fieldset's provider → should apply horizontal-fixed layout class.
    const field = container.querySelector('.bc-field')
    expect(field).toBeTruthy()
    expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(true)
  })

  it('Control inside Fieldset inherits compact setting', () => {
    const { controller } = useController<string>({ initialValue: '' })

    render(
      Fieldset(
        { compact: true },
        Control(TextInput, {
          controller,
          label: 'Email',
        })
      ),
      container
    )

    const field = container.querySelector('.bc-field')
    expect(field!.classList.contains('bc-field--compact')).toBe(true)
  })

  it('Control can locally override Fieldset layout', () => {
    const { controller } = useController<string>({ initialValue: '' })

    render(
      Fieldset(
        { layout: 'horizontal-fixed' },
        Control(TextInput, {
          controller,
          label: 'Name',
          layout: 'vertical',
        })
      ),
      container
    )

    const field = container.querySelector('.bc-field')
    // Local 'vertical' override wins — no horizontal-fixed class
    expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(false)
  })

  it('multiple Controls inside Fieldset all inherit the same layout', () => {
    const { controller: ctrl1 } = useController<string>({ initialValue: '' })
    const { controller: ctrl2 } = useController<string>({ initialValue: '' })

    render(
      Fieldset(
        { layout: 'horizontal', columns: 2 },
        Control(TextInput, { controller: ctrl1, label: 'First Name' }),
        Control(TextInput, { controller: ctrl2, label: 'Last Name' })
      ),
      container
    )

    const fields = container.querySelectorAll('.bc-field')
    expect(fields.length).toBe(2)
    fields.forEach(field => {
      expect(field.classList.contains('bc-field--horizontal')).toBe(true)
    })
  })

  it('Field inside Fieldset applies span style to grid-column', () => {
    render(
      Fieldset(
        { columns: 2 },
        Field({ content: html.input(), label: 'Full Name', span: 2 })
      ),
      container
    )

    const field = container.querySelector('.bc-field') as HTMLElement
    expect(field.style.cssText).toContain('span 2')
  })
})
