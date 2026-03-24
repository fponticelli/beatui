import { describe, it, expect } from 'vitest'
import { render, Provide, Use, html } from '@tempots/dom'
import { ActionContextProvider } from '../../../src/openui/renderer/action-context'
import type { ActionEvent } from '../../../src/openui/renderer/action-context'

describe('ActionContextProvider', () => {
  it('provides action context to children', () => {
    let captured: ActionEvent[] | undefined
    const tree = Provide(ActionContextProvider, {}, () =>
      Use(ActionContextProvider, (ctx) => {
        captured = ctx.actions.value
        return html.div('test')
      })
    )
    const clear = render(tree, document.body)
    expect(captured).toEqual([])
    clear(true)
  })

  it('dispatches button actions via onAction callback', () => {
    const events: ActionEvent[] = []
    const tree = Provide(ActionContextProvider, { onAction: (e) => events.push(e) }, () =>
      Use(ActionContextProvider, (ctx) => {
        ctx.onAction?.({
          kind: 'button', type: 'open_url',
          params: { url: 'https://example.com' },
          humanFriendlyMessage: 'Open example',
        })
        return html.div('test')
      })
    )
    const clear = render(tree, document.body)
    expect(events).toHaveLength(1)
    expect(events[0].kind).toBe('button')
    clear(true)
  })

  it('accumulates actions in the signal', () => {
    let actionsSignal: ActionEvent[] | undefined
    const tree = Provide(ActionContextProvider, {}, () =>
      Use(ActionContextProvider, (ctx) => {
        const action: ActionEvent = {
          kind: 'button', type: 'test', params: {},
          humanFriendlyMessage: 'test',
        }
        ctx.actions.update(prev => [...prev, action])
        actionsSignal = ctx.actions.value
        return html.div('test')
      })
    )
    const clear = render(tree, document.body)
    expect(actionsSignal).toHaveLength(1)
    clear(true)
  })
})
