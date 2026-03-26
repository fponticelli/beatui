import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { html, render } from '@tempots/dom'
import { defineComponent } from '../../../src/openui/library/define-component'
import { createLibrary } from '../../../src/openui/library/library'
import { resolveNode } from '../../../src/openui/renderer/node-resolver'
import { OpenUISkeleton } from '../../../src/openui/renderer/skeleton'
import type { ASTNode } from '../../../src/openui/parser/types'

const TestButton = defineComponent({
  name: 'Button',
  props: z.object({ label: z.string(), variant: z.enum(['filled', 'outline']).optional() }),
  description: 'A button.',
  renderer: (props) => html.button(props.label as string),
})

const TestStack = defineComponent({
  name: 'Stack',
  props: z.object({ children: z.array(z.unknown()).optional() }),
  description: 'Vertical stack.',
  renderer: (_props, children) => html.div(...children),
})

const lib = createLibrary({ components: [TestButton, TestStack] })

describe('OpenUISkeleton', () => {
  it('renders a skeleton placeholder with correct CSS class', () => {
    const clear = render(html.div(OpenUISkeleton()), document.body)
    const el = document.body.querySelector('.bc-skeleton')
    expect(el).not.toBeNull()
    clear(true)
  })
})

describe('resolveNode', () => {
  it('resolves string nodes to text', () => {
    const node: ASTNode = { type: 'string', value: 'hello' }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('hello')
    clear(true)
  })

  it('resolves number nodes to text', () => {
    const node: ASTNode = { type: 'number', value: 42 }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('42')
    clear(true)
  })

  it('resolves boolean nodes to text', () => {
    const node: ASTNode = { type: 'boolean', value: true }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('true')
    clear(true)
  })

  it('resolves null to empty', () => {
    const node: ASTNode = { type: 'null' }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    // Should render without error
    clear(true)
  })

  it('resolves component nodes with named props', () => {
    const node: ASTNode = {
      type: 'component', name: 'Button',
      args: [{ type: 'object', entries: { label: { type: 'string', value: 'Click me' } } }],
    }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('Click me')
    clear(true)
  })

  it('returns empty for unknown components', () => {
    const node: ASTNode = { type: 'component', name: 'Unknown', args: [] }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    clear(true)
  })

  it('returns a placeholder TNode for reference nodes', () => {
    const node: ASTNode = { type: 'reference', name: 'someRef' }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    clear(true)
  })

  it('resolves array nodes as children', () => {
    const node: ASTNode = {
      type: 'array',
      items: [
        { type: 'string', value: 'A' },
        { type: 'string', value: 'B' },
      ],
    }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('A')
    expect(document.body.textContent).toContain('B')
    clear(true)
  })
})
