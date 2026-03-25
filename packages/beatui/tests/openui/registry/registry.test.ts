import { describe, it, expect } from 'vitest'
import { render, html } from '@tempots/dom'
import { beatuiLibrary } from '../../../src/openui/registry'
import { layoutComponents } from '../../../src/openui/registry/layout'
import { buttonComponents } from '../../../src/openui/registry/button'
import { dataComponents } from '../../../src/openui/registry/data'
import { formComponents } from '../../../src/openui/registry/form'
import { navigationComponents } from '../../../src/openui/registry/navigation'
import { overlayComponents } from '../../../src/openui/registry/overlay'
import { formatComponents } from '../../../src/openui/registry/format'
import { typographyComponents } from '../../../src/openui/registry/typography'

describe('Component registries', () => {
  it('layout registry exports expected components', () => {
    expect(layoutComponents.length).toBeGreaterThanOrEqual(7)
    const names = layoutComponents.map(c => c.name)
    expect(names).toContain('Stack')
    expect(names).toContain('Card')
    expect(names).toContain('Divider')
  })

  it('button registry exports expected components', () => {
    expect(buttonComponents.length).toBeGreaterThanOrEqual(3)
    const names = buttonComponents.map(c => c.name)
    expect(names).toContain('Button')
    expect(names).toContain('CopyButton')
  })

  it('data registry exports expected components', () => {
    expect(dataComponents.length).toBeGreaterThanOrEqual(5)
    const names = dataComponents.map(c => c.name)
    expect(names).toContain('StatCard')
    expect(names).toContain('Badge')
    expect(names).toContain('ProgressBar')
  })

  it('form registry exports expected components', () => {
    expect(formComponents.length).toBeGreaterThanOrEqual(10)
    const names = formComponents.map(c => c.name)
    expect(names).toContain('TextInput')
    expect(names).toContain('NumberInput')
    expect(names).toContain('Switch')
  })

  it('navigation registry exports expected components', () => {
    expect(navigationComponents.length).toBeGreaterThanOrEqual(4)
    const names = navigationComponents.map(c => c.name)
    expect(names).toContain('Tabs')
    expect(names).toContain('Breadcrumbs')
  })

  it('overlay registry exports expected components', () => {
    expect(overlayComponents.length).toBeGreaterThanOrEqual(3)
  })

  it('format registry exports expected components', () => {
    expect(formatComponents.length).toBeGreaterThanOrEqual(4)
  })

  it('typography registry exports expected components', () => {
    expect(typographyComponents.length).toBeGreaterThanOrEqual(2)
  })
})

describe('beatuiLibrary', () => {
  it('contains all registered components', () => {
    const totalExpected =
      layoutComponents.length +
      buttonComponents.length +
      dataComponents.length +
      formComponents.length +
      navigationComponents.length +
      overlayComponents.length +
      formatComponents.length +
      typographyComponents.length
    expect(beatuiLibrary.components.size).toBe(totalExpected)
  })

  it('every component has a name matching its key and a non-empty description', () => {
    for (const [name, comp] of beatuiLibrary.components) {
      expect(comp.name).toBe(name)
      expect(comp.description.length).toBeGreaterThan(0)
    }
  })

  it('every component has a renderer function', () => {
    for (const [, comp] of beatuiLibrary.components) {
      expect(typeof comp.renderer).toBe('function')
    }
  })

  it('renders Stack with string children', () => {
    const stackDef = beatuiLibrary.get('Stack')
    expect(stackDef).toBeDefined()
    const rendered = stackDef!.renderer({ children: ['child1', 'child2'] }, [])
    const clear = render(html.div(rendered), document.body)
    expect(document.body.textContent).toContain('child1')
    expect(document.body.textContent).toContain('child2')
    clear(true)
  })

  it('renders Card with title and content', () => {
    const cardDef = beatuiLibrary.get('Card')
    expect(cardDef).toBeDefined()
    const rendered = cardDef!.renderer(
      { title: 'Test Title', content: 'Test content' },
      []
    )
    const clear = render(html.div(rendered), document.body)
    expect(document.body.textContent).toContain('Test Title')
    expect(document.body.textContent).toContain('Test content')
    clear(true)
  })

  it('renders ProgressBar with value', () => {
    const def = beatuiLibrary.get('ProgressBar')
    expect(def).toBeDefined()
    const rendered = def!.renderer({ value: 50, size: 'md' }, [])
    const clear = render(html.div(rendered), document.body)
    // ProgressBar renders a bar element — just verify no crash
    clear(true)
  })

  it('generates a prompt containing all component names', () => {
    const prompt = beatuiLibrary.prompt()
    expect(prompt).toContain('OpenUI Lang')
    for (const name of ['Stack', 'Button', 'Card', 'TextInput', 'Badge', 'Tabs']) {
      expect(prompt).toContain(name)
    }
  })
})
