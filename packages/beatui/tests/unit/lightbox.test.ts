import { describe, it, expect } from 'vitest'
import { html, render } from '@tempots/dom'
import { Lightbox } from '@/components/overlay'
import { WithProviders } from '../helpers/test-providers'

function setupRoot() {
  const root = document.createElement('div')
  document.body.innerHTML = ''
  document.body.appendChild(root)
  return root
}

describe('Lightbox', () => {
  it('does not render overlay until opened', () => {
    setupRoot()
    const app = Lightbox({}, open => html.button('open'))
    render(
      WithProviders(() => app),
      document.body
    )
    expect(document.querySelector('[data-overlay="true"]')).toBeNull()
  })

  it('opens into a body portal with dark overlay and renders content', () => {
    setupRoot()
    let doOpen: ((c: any) => void) | null = null
    const app = Lightbox({}, open => {
      doOpen = open
      return html.button('open')
    })
    render(
      WithProviders(() => app),
      document.body
    )
    expect(doOpen).toBeTruthy()
    doOpen!(html.div('Hello Lightbox'))

    const overlay = document.querySelector(
      '[data-overlay="true"]'
    ) as HTMLElement | null
    expect(overlay).not.toBeNull()
    // overlay classes should include bc-overlay and effect (opaque by default)
    expect(overlay!.className).toContain('bc-overlay')
    expect(overlay!.className).toContain('bc-overlay--effect-opaque')

    // Content present
    const contentText = document.body.textContent || ''
    expect(contentText).toContain('Hello Lightbox')
  })

  it('closes when clicking the close button', () => {
    setupRoot()
    let doOpen: ((c: any) => void) | null = null
    const app = Lightbox({}, open => {
      doOpen = open
      return html.button('open')
    })
    render(
      WithProviders(() => app),
      document.body
    )
    doOpen!(html.div('Close me'))

    const closeBtn = document.querySelector(
      '.bc-lightbox__close button'
    ) as HTMLButtonElement | null
    expect(closeBtn).not.toBeNull()
    closeBtn!.click()

    const overlayAfter = document.querySelector('[data-overlay="true"]')
    expect(overlayAfter).toBeNull()
  })
})
