import { describe, it, expect, beforeEach } from 'vitest'
import { render, prop, Provide, html } from '@tempots/dom'
import { Field } from '../../src/components/form/input/field'
import { FieldLayout } from '../../src/components/form/input/field-layout'

describe('Field', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders with default vertical layout when used standalone', () => {
    render(
      Field({ content: html.input(), label: 'Name' }),
      container
    )

    const field = container.querySelector('.bc-field')
    expect(field).toBeTruthy()
    // Default layout is vertical — should NOT have horizontal class
    expect(field!.classList.contains('bc-field--horizontal')).toBe(false)
    expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(false)
  })

  it('applies bc-field--horizontal-fixed class when layout is horizontal-fixed', () => {
    render(
      Field({ content: html.input(), label: 'Name', layout: 'horizontal-fixed' }),
      container
    )

    const field = container.querySelector('.bc-field')
    expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(true)
  })

  it('applies bc-field--full-width class when fullWidth is true', () => {
    render(
      Field({ content: html.input(), label: 'Name', fullWidth: true }),
      container
    )

    const field = container.querySelector('.bc-field')
    expect(field!.classList.contains('bc-field--full-width')).toBe(true)
  })

  it('renders label text', () => {
    render(
      Field({ content: html.input(), label: 'Email Address' }),
      container
    )

    const label = container.querySelector('.bc-field__label')
    expect(label?.textContent).toContain('Email Address')
  })

  it('renders required symbol when required is true', () => {
    render(
      Field({ content: html.input(), label: 'Name', required: true }),
      container
    )

    const required = container.querySelector('.bc-field__required')
    expect(required).toBeTruthy()
  })

  it('does not render required symbol when required is false', () => {
    render(
      Field({ content: html.input(), label: 'Name', required: false }),
      container
    )

    const required = container.querySelector('.bc-field__required')
    expect(required).toBeFalsy()
  })

  it('renders description text below input in vertical layout', () => {
    render(
      Field({ content: html.input(), label: 'Name', description: 'Your full name' }),
      container
    )

    const desc = container.querySelector('.bc-field__description')
    expect(desc?.textContent).toContain('Your full name')
    // Not under-label in vertical mode
    expect(desc?.classList.contains('bc-field__description--under-label')).toBe(false)
  })

  it('renders description under label in horizontal layout', () => {
    render(
      Field({
        content: html.input(),
        label: 'Name',
        description: 'Your full name',
        layout: 'horizontal',
      }),
      container
    )

    const desc = container.querySelector('.bc-field__description--under-label')
    expect(desc?.textContent).toContain('Your full name')
  })

  it('renders error message when error is provided', () => {
    render(
      Field({ content: html.input(), label: 'Name', error: 'This field is required' }),
      container
    )

    const error = container.querySelector('.bc-field__error')
    expect(error?.textContent).toContain('This field is required')
  })

  it('applies error label class when hasError is true', () => {
    render(
      Field({ content: html.input(), label: 'Name', hasError: true }),
      container
    )

    const labelText = container.querySelector('.bc-field__label-text')
    expect(labelText!.classList.contains('bc-field__label-text--error')).toBe(true)
  })

  it('applies disabled label class when disabled is true', () => {
    render(
      Field({ content: html.input(), label: 'Name', disabled: true }),
      container
    )

    const labelText = container.querySelector('.bc-field__label-text')
    expect(labelText!.classList.contains('bc-field__label-text--disabled')).toBe(true)
  })

  it('applies bc-field--compact class when compact is true', () => {
    render(
      Field({ content: html.input(), label: 'Name', compact: true }),
      container
    )

    const field = container.querySelector('.bc-field')
    expect(field!.classList.contains('bc-field--compact')).toBe(true)
  })

  it('applies bc-field--horizontal-end class for horizontal-end layout', () => {
    render(
      Field({ content: html.input(), label: 'Name', layout: 'horizontal-end' }),
      container
    )
    const field = container.querySelector('.bc-field')
    expect(field!.classList.contains('bc-field--horizontal-end')).toBe(true)
  })

  it('applies bc-field--responsive class when layout is responsive', () => {
    render(
      Field({ content: html.input(), label: 'Name', layout: 'responsive' }),
      container
    )

    const field = container.querySelector('.bc-field')
    expect(field!.classList.contains('bc-field--responsive')).toBe(true)
  })

  it('applies grid-column span style when span is set', () => {
    render(
      Field({ content: html.input(), label: 'Name', span: 2 }),
      container
    )

    const field = container.querySelector('.bc-field') as HTMLElement
    expect(field!.style.cssText).toContain('span 2')
  })

  it('reacts to reactive layout prop', async () => {
    const layout = prop<'vertical' | 'horizontal'>('vertical')

    render(
      Field({ content: html.input(), label: 'Name', layout }),
      container
    )

    let field = container.querySelector('.bc-field') as HTMLElement
    expect(field.classList.contains('bc-field--horizontal')).toBe(false)

    layout.set('horizontal')
    await Promise.resolve()

    field = container.querySelector('.bc-field') as HTMLElement
    expect(field.classList.contains('bc-field--horizontal')).toBe(true)
  })

  describe('FieldLayout provider integration', () => {
    it('inherits layout from parent FieldLayout provider', () => {
      render(
        Provide(FieldLayout, { layout: 'horizontal-fixed' }, () =>
          Field({ content: html.input(), label: 'Name' })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(true)
    })

    it('local layout overrides parent FieldLayout provider', () => {
      render(
        Provide(FieldLayout, { layout: 'horizontal-fixed' }, () =>
          Field({ content: html.input(), label: 'Name', layout: 'vertical' })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(false)
      expect(field!.classList.contains('bc-field--horizontal')).toBe(false)
    })

    it('inherits compact from parent FieldLayout provider', () => {
      render(
        Provide(FieldLayout, { compact: true }, () =>
          Field({ content: html.input(), label: 'Name' })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      expect(field!.classList.contains('bc-field--compact')).toBe(true)
    })

    it('local compact overrides parent FieldLayout compact', () => {
      render(
        Provide(FieldLayout, { compact: true }, () =>
          Field({ content: html.input(), label: 'Name', compact: false })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      expect(field!.classList.contains('bc-field--compact')).toBe(false)
    })

    it('works standalone without any FieldLayout provider', () => {
      // Should not throw — Field internally provides its own FieldLayout
      expect(() => {
        render(
          Field({ content: html.input(), label: 'Standalone' }),
          container
        )
      }).not.toThrow()

      const field = container.querySelector('.bc-field')
      expect(field).toBeTruthy()
    })
  })
})
