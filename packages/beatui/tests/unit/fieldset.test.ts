import { describe, it, expect, beforeEach } from 'vitest'
import { render, prop, html } from '@tempots/dom'
import { Fieldset } from '../../src/components/form/fieldset/fieldset'
import { Field } from '../../src/components/form/input/field'
import { WithProviders } from '../helpers/test-providers'

describe('Fieldset', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders a fieldset element', () => {
    render(Fieldset({}), container)

    const fieldset = container.querySelector('fieldset')
    expect(fieldset).toBeTruthy()
  })

  it('applies bc-fieldset class', () => {
    render(Fieldset({}), container)

    const fieldset = container.querySelector('fieldset')
    expect(fieldset!.classList.contains('bc-fieldset')).toBe(true)
  })

  it('applies bc-fieldset--plain variant class by default', () => {
    render(Fieldset({}), container)

    const fieldset = container.querySelector('fieldset')
    expect(fieldset!.classList.contains('bc-fieldset--plain')).toBe(true)
  })

  it('applies bc-fieldset--bordered variant class', () => {
    render(Fieldset({ variant: 'bordered' }), container)

    const fieldset = container.querySelector('fieldset')
    expect(fieldset!.classList.contains('bc-fieldset--bordered')).toBe(true)
  })

  it('applies bc-fieldset--card variant class', () => {
    render(Fieldset({ variant: 'card' }), container)

    const fieldset = container.querySelector('fieldset')
    expect(fieldset!.classList.contains('bc-fieldset--card')).toBe(true)
  })

  it('renders legend text', () => {
    render(Fieldset({ legend: 'Personal Info' }), container)

    const legend = container.querySelector('legend')
    expect(legend?.textContent).toContain('Personal Info')
  })

  it('does not render legend element when no legend is provided', () => {
    render(Fieldset({}), container)

    const legend = container.querySelector('legend')
    expect(legend).toBeFalsy()
  })

  it('renders description text', () => {
    render(Fieldset({ description: 'Fill in your details' }), container)

    const desc = container.querySelector('.bc-fieldset__description')
    expect(desc?.textContent).toContain('Fill in your details')
  })

  it('does not render description element when no description is provided', () => {
    render(Fieldset({}), container)

    const desc = container.querySelector('.bc-fieldset__description')
    expect(desc).toBeFalsy()
  })

  it('renders children inside content div', () => {
    render(Fieldset({}, html.div(html.span('child-content'))), container)

    const content = container.querySelector('.bc-fieldset__content')
    expect(content).toBeTruthy()
    expect(content?.textContent).toContain('child-content')
  })

  it('sets disabled attribute when disabled is true', () => {
    render(Fieldset({ disabled: true }), container)

    const fieldset = container.querySelector('fieldset') as HTMLFieldSetElement
    expect(fieldset.disabled).toBe(true)
  })

  it('renders non-collapsible legend as a span', () => {
    render(Fieldset({ legend: 'My Group', collapsible: false }), container)

    const legendSpan = container.querySelector('.bc-fieldset__legend-text')
    expect(legendSpan?.tagName.toLowerCase()).toBe('span')

    // Should NOT render a toggle button
    const toggleBtn = container.querySelector('.bc-fieldset__legend-toggle')
    expect(toggleBtn).toBeFalsy()
  })

  it('renders collapsible legend with toggle button', () => {
    render(
      WithProviders(() => Fieldset({ legend: 'My Group', collapsible: true })),
      container
    )

    const toggleBtn = container.querySelector('.bc-fieldset__legend-toggle')
    expect(toggleBtn).toBeTruthy()
    expect(toggleBtn?.tagName.toLowerCase()).toBe('button')
  })

  it('renders collapse icon without collapsed class when open', () => {
    render(
      WithProviders(() =>
        Fieldset({
          legend: 'My Group',
          collapsible: true,
          defaultCollapsed: false,
        })
      ),
      container
    )

    const icon = container.querySelector('.bc-fieldset__collapse-icon')
    expect(icon).toBeTruthy()
    expect(
      icon?.classList.contains('bc-fieldset__collapse-icon--collapsed')
    ).toBe(false)
  })

  it('renders collapse icon with collapsed class when defaultCollapsed is true', () => {
    render(
      WithProviders(() =>
        Fieldset({
          legend: 'My Group',
          collapsible: true,
          defaultCollapsed: true,
        })
      ),
      container
    )

    const icon = container.querySelector('.bc-fieldset__collapse-icon')
    expect(icon).toBeTruthy()
    expect(
      icon?.classList.contains('bc-fieldset__collapse-icon--collapsed')
    ).toBe(true)
  })

  it('reacts to variant prop signal', async () => {
    const variant = prop<'plain' | 'bordered' | 'card'>('plain')

    render(Fieldset({ variant }), container)

    let fieldset = container.querySelector('fieldset')!
    expect(fieldset.classList.contains('bc-fieldset--plain')).toBe(true)

    variant.set('bordered')
    await Promise.resolve()

    fieldset = container.querySelector('fieldset')!
    expect(fieldset.classList.contains('bc-fieldset--bordered')).toBe(true)
    expect(fieldset.classList.contains('bc-fieldset--plain')).toBe(false)
  })

  describe('FieldLayout provider cascade', () => {
    it('provides FieldLayout to descendant Fields', () => {
      render(
        Fieldset(
          { layout: 'horizontal-fixed' },
          Field({ content: html.input(), label: 'Name' })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(true)
    })

    it('cascades compact setting to descendant Fields', () => {
      render(
        Fieldset(
          { compact: true },
          Field({ content: html.input(), label: 'Name' })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      expect(field!.classList.contains('bc-field--compact')).toBe(true)
    })

    it('allows Field to override Fieldset layout locally', () => {
      render(
        Fieldset(
          { layout: 'horizontal-fixed' },
          Field({ content: html.input(), label: 'Name', layout: 'vertical' })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      // Local 'vertical' override means neither horizontal class should appear
      expect(field!.classList.contains('bc-field--horizontal-fixed')).toBe(
        false
      )
    })

    it('cascades horizontal-end layout to descendant Fields', () => {
      render(
        Fieldset(
          { layout: 'horizontal-end' },
          Field({ content: html.input(), label: 'Name' })
        ),
        container
      )

      const field = container.querySelector('.bc-field')
      expect(field!.classList.contains('bc-field--horizontal-end')).toBe(true)
    })
  })

  describe('collapsible interaction', () => {
    it('click on toggle button flips collapse state', async () => {
      render(
        WithProviders(() =>
          Fieldset({
            legend: 'My Group',
            collapsible: true,
            defaultCollapsed: false,
          })
        ),
        container
      )

      const toggleBtn = container.querySelector(
        '.bc-fieldset__legend-toggle'
      ) as HTMLButtonElement
      expect(toggleBtn).toBeTruthy()

      const icon = container.querySelector('.bc-fieldset__collapse-icon')
      expect(
        icon?.classList.contains('bc-fieldset__collapse-icon--collapsed')
      ).toBe(false)

      toggleBtn.click()
      await Promise.resolve()

      expect(
        icon?.classList.contains('bc-fieldset__collapse-icon--collapsed')
      ).toBe(true)

      // Click again to reopen
      toggleBtn.click()
      await Promise.resolve()

      expect(
        icon?.classList.contains('bc-fieldset__collapse-icon--collapsed')
      ).toBe(false)
    })
  })

  describe('content grid styles', () => {
    it('sets fieldset-gap custom property via inline style', () => {
      render(Fieldset({ gap: 'lg' }), container)

      const content = container.querySelector(
        '.bc-fieldset__content'
      ) as HTMLElement
      expect(content.style.cssText).toContain('--fieldset-gap')
    })

    it('sets fieldset-columns custom property when columns > 1', () => {
      render(Fieldset({ columns: 3 }), container)

      const content = container.querySelector(
        '.bc-fieldset__content'
      ) as HTMLElement
      expect(content.style.cssText).toContain('--fieldset-columns: 3')
    })

    it('does not set fieldset-columns when columns is 1', () => {
      render(Fieldset({ columns: 1 }), container)

      const content = container.querySelector(
        '.bc-fieldset__content'
      ) as HTMLElement
      expect(content.style.cssText).not.toContain('--fieldset-columns')
    })

    it('sets fieldset-min-field-width when provided', () => {
      render(Fieldset({ minFieldWidth: '300px' }), container)

      const content = container.querySelector(
        '.bc-fieldset__content'
      ) as HTMLElement
      expect(content.style.cssText).toContain(
        '--fieldset-min-field-width: 300px'
      )
    })
  })
})
