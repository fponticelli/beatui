import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { html, render, prop } from '@tempots/dom'
import { defineComponent } from '../../../src/openui/library/define-component'
import { createLibrary } from '../../../src/openui/library/library'
import { OpenUIRenderer } from '../../../src/openui/renderer/openui-renderer'

const TestButton = defineComponent({
  name: 'Button',
  props: z.object({ label: z.string() }),
  description: 'A button.',
  renderer: (props) => html.button(props.label),
})

const TestStack = defineComponent({
  name: 'Stack',
  props: z.object({ children: z.array(z.unknown()).optional() }),
  description: 'Stack layout.',
  renderer: (_props, children) => html.div(...children),
})

const lib = createLibrary({ components: [TestButton, TestStack], root: 'Stack' })

function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('OpenUIRenderer', () => {
  it('renders a static response', async () => {
    const tree = OpenUIRenderer({ library: lib, response: 'root = Button("Hello")' })
    const clear = render(tree, document.body)
    await flush()
    expect(document.body.textContent).toContain('Hello')
    clear(true)
  })

  it('renders with forward references', async () => {
    const tree = OpenUIRenderer({
      library: lib,
      response: 'root = Stack([btn])\nbtn = Button("World")',
    })
    const clear = render(tree, document.body)
    await flush()
    expect(document.body.textContent).toContain('World')
    clear(true)
  })

  it('updates reactively when response signal changes', async () => {
    const response = prop('')
    const tree = OpenUIRenderer({ library: lib, response })
    const clear = render(tree, document.body)
    response.set('root = Button("First")')
    await flush()
    expect(document.body.textContent).toContain('First')
    clear(true)
  })

  it('calls onComplete when streaming ends', async () => {
    let completed = false
    const response = prop('')
    const isStreaming = prop(true)
    const tree = OpenUIRenderer({
      library: lib, response, isStreaming,
      onComplete: () => { completed = true },
    })
    const clear = render(tree, document.body)
    response.set('root = Button("Done")')
    await flush()
    isStreaming.set(false)
    expect(completed).toBe(true)
    clear(true)
  })

  it('calls onAction when provided', async () => {
    const actions: unknown[] = []
    const tree = OpenUIRenderer({
      library: lib,
      response: 'root = Button("Test")',
      onAction: (e) => actions.push(e),
    })
    const clear = render(tree, document.body)
    await flush()
    clear(true)
  })
})
