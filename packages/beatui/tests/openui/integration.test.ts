import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { html, render, prop } from '@tempots/dom'
import {
  beatuiLibrary,
  OpenUIRenderer,
  createParser,
  createStreamingParser,
  defineComponent,
} from '../../src/openui'

describe('OpenUI integration', () => {
  it('beatuiLibrary has all expected component groups', () => {
    expect(beatuiLibrary.has('Stack')).toBe(true)
    expect(beatuiLibrary.has('Button')).toBe(true)
    expect(beatuiLibrary.has('TextInput')).toBe(true)
    expect(beatuiLibrary.has('Card')).toBe(true)
    expect(beatuiLibrary.has('FormatNumber')).toBe(true)
  })

  it('generates a system prompt', () => {
    const prompt = beatuiLibrary.prompt()
    expect(prompt).toContain('OpenUI Lang')
    expect(prompt).toContain('Stack')
    expect(prompt).toContain('Button')
    expect(prompt.length).toBeGreaterThan(500)
  })

  it('parser + renderer round-trip: static', async () => {
    // Use a simple custom library to avoid needing BeatUI providers (Theme, Locale, i18n)
    const SimpleButton = defineComponent({
      name: 'SimpleButton',
      props: z.object({ label: z.string() }),
      description: 'Test button.',
      renderer: (props) => html.button(props.label),
    })
    const simpleLib = beatuiLibrary.extend({ components: [SimpleButton] })

    const input = 'root = SimpleButton("Hello")'
    const tree = OpenUIRenderer({
      library: simpleLib,
      response: input,
    })
    const clear = render(tree, document.body)
    await new Promise(r => setTimeout(r, 0))
    expect(document.body.textContent).toContain('Hello')
    clear(true)
  })

  it('extend library with custom component', () => {
    const MyWidget = defineComponent({
      name: 'MyWidget',
      props: z.object({ title: z.string() }),
      description: 'Custom widget.',
      renderer: (props) => html.div(props.title),
    })

    const extended = beatuiLibrary.extend({ components: [MyWidget] })
    expect(extended.has('MyWidget')).toBe(true)
    expect(extended.has('Button')).toBe(true)

    const prompt = extended.prompt()
    expect(prompt).toContain('MyWidget')
  })

  it('streaming parser resolves forward references incrementally', () => {
    const parser = createStreamingParser(beatuiLibrary)

    const r1 = parser.push('root = Stack([card])\n')
    expect(r1.meta.unresolved).toContain('card')

    const r2 = parser.push('card = Card("Dashboard")')
    expect(r2.meta.unresolved).not.toContain('card')
  })

  it('synchronous parser works with beatuiLibrary', () => {
    const parse = createParser(beatuiLibrary)
    const result = parse('root = Button("Test")')
    expect(result.root).not.toBeNull()
    expect(result.root?.type).toBe('component')
    expect(result.meta.errors.filter(e => e.code === 'unknown-component')).toEqual([])
  })
})
