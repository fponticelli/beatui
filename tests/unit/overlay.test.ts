import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { OverlayElement } from '../../src/components/overlay'
import { html, render } from '@tempots/dom'

describe('OverlayElement Component', () => {
  let dom: JSDOM
  let container: HTMLElement

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    global.document = dom.window.document
    global.window = dom.window as any
    global.HTMLElement = dom.window.HTMLElement
    global.Element = dom.window.Element
    global.Node = dom.window.Node

    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with the expected API pattern', () => {
    let openFunction: ((renderFn: (close: () => void) => any) => void) | null = null

    const element = OverlayElement(
      {
        mode: 'capturing',
        effect: 'dark',
      },
      open => {
        openFunction = open
        return html.button('Open Overlay')
      }
    )

    render(element, container)

    // Verify that the open function was provided
    expect(openFunction).toBeDefined()
    expect(typeof openFunction).toBe('function')

    // Verify that the button was rendered
    const button = container.querySelector('button')
    expect(button).toBeDefined()
    expect(button?.textContent).toBe('Open Overlay')
  })

  it('should create overlay when open is called', () => {
    let openFunction: ((renderFn: (close: () => void) => any) => void) | null = null
    let closeFunction: (() => void) | null = null

    const element = OverlayElement(
      {
        mode: 'capturing',
        effect: 'dark',
      },
      open => {
        openFunction = open
        return html.button('Open Overlay')
      }
    )

    render(element, container)

    // Call the open function
    openFunction!(close => {
      closeFunction = close
      return html.div('Overlay Content')
    })

    // Verify that overlay was created
    const overlay = container.querySelector('.fixed.inset-0')
    expect(overlay).toBeDefined()
    expect(overlay?.textContent).toBe('Overlay Content')

    // Verify that close function was provided
    expect(closeFunction).toBeDefined()
    expect(typeof closeFunction).toBe('function')
  })

  it('should close overlay when close function is called', () => {
    let openFunction: ((renderFn: (close: () => void) => any) => void) | null = null
    let closeFunction: (() => void) | null = null

    const element = OverlayElement(
      {
        mode: 'capturing',
        effect: 'dark',
      },
      open => {
        openFunction = open
        return html.button('Open Overlay')
      }
    )

    render(element, container)

    // Open the overlay
    openFunction!(close => {
      closeFunction = close
      return html.div('Overlay Content')
    })

    // Verify overlay exists
    expect(container.querySelector('.fixed.inset-0')).toBeDefined()

    // Close the overlay
    closeFunction!()

    // Verify overlay is removed
    expect(container.querySelector('.fixed.inset-0')).toBeNull()
  })
})
