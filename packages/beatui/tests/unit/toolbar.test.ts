import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, html } from '@tempots/dom'
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
} from '../../src/components/navigation/toolbar/toolbar'
import { WithProviders } from '../helpers/test-providers'
import { Icon } from '../../src/components/data/icon'
import { TextInput } from '../../src/components/form/input/text-input'

describe('Toolbar Component System', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders a basic toolbar with role and label', () => {
    render(
      WithProviders(() => Toolbar(html.span('A'), html.span('B'))),
      container
    )

    const toolbar = container.querySelector('[role="toolbar"]') as HTMLElement
    expect(toolbar).toBeTruthy()
    expect(toolbar.className).toContain('bc-toolbar')
  })

  it('supports toolbar groups, dividers, spacer', () => {
    render(
      WithProviders(() =>
        Toolbar(
          ToolbarGroup(html.span('Group')),
          ToolbarDivider(),
          ToolbarSpacer()
        )
      ),
      container
    )

    expect(container.querySelector('.bc-toolbar__group')).toBeTruthy()
    expect(container.querySelector('.bc-toolbar__divider')).toBeTruthy()
    expect(container.querySelector('.bc-toolbar__spacer')).toBeTruthy()
  })

  it('renders ToolbarButton and supports icon-only', () => {
    render(
      WithProviders(() =>
        Toolbar(ToolbarButton({}, Icon({ icon: 'mdi:home', size: 'sm' })))
      ),
      container
    )

    const btn = container.querySelector('button') as HTMLButtonElement
    expect(btn).toBeTruthy()
    expect(btn.className).toContain('bc-button')
  })

  it('wraps inputs and controls', () => {
    render(
      WithProviders(() =>
        Toolbar(TextInput({ value: '' }), ToolbarButton({}, 'X'))
      ),
      container
    )

    expect(container.querySelector('.bc-input-container')).toBeTruthy()
    expect(container.querySelector('.bc-toolbar__button')).toBeTruthy()
  })

  it('supports arrow key navigation between focusable children', () => {
    render(
      WithProviders(() =>
        Toolbar(
          ToolbarButton({}, 'A'),
          ToolbarButton({}, 'B'),
          html.button('C')
        )
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)

    const first = buttons[0] as HTMLButtonElement
    first.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    })
    first.dispatchEvent(event)

    const active = document.activeElement as HTMLElement
    expect(active).toBe(buttons[1])
  })
})

