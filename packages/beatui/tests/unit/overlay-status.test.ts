import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, html } from '@tempots/dom'
import { Overlay } from '../../src/components/overlay/overlay'
import { WithProviders } from '../helpers/test-providers'
import { useAnimatedElementToggle } from '../../src/utils/use-animated-toggle'

describe('Overlay data-status', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should transition data-status away from closed when opened', async () => {
    let openFn: ((options: any) => void) | undefined

    render(
      WithProviders(() =>
        Overlay((open, _close) => {
          openFn = open
          return html.button('Open')
        })
      ),
      container
    )

    expect(openFn).toBeDefined()
    openFn!({ effect: 'opaque', content: html.div('test content') })

    await new Promise(resolve => setTimeout(resolve, 50))

    const overlay = document.querySelector('.bc-overlay')
    expect(overlay).not.toBeNull()
    expect(overlay?.getAttribute('data-status')).not.toBe('closed')
  })

  it('useAnimatedElementToggle advances from closed to opening', async () => {
    const status = useAnimatedElementToggle()
    const el = document.createElement('div')
    document.body.appendChild(el)
    status.setElement(el)

    status.open()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(status.status.value).toBe('opening')

    status.dispose()
    document.body.removeChild(el)
  })

  it('listenOnClosed should not fire for initial closed state', () => {
    const status = useAnimatedElementToggle()
    let fired = false
    status.listenOnClosed(() => {
      fired = true
    })
    expect(fired).toBe(false)
    status.dispose()
  })
})
