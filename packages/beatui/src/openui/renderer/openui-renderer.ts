import {
  html,
  attr,
  MapSignal,
  Provide,
  OnDispose,
  Fragment,
  Empty,
  Value,
} from '@tempots/dom'
import type { TNode, Renderable } from '@tempots/dom'
import type { ASTNode, ParseResult, ParseError } from '../parser/types'
import type { Library } from '../library/types'
import { createParser } from '../parser/parser'
import { resolveNode } from './node-resolver'
import { ActionContextProvider, type ActionEvent } from './action-context'

export interface OpenUIRendererOptions {
  /** The component library to resolve against. */
  library: Library
  /** The OpenUI Lang response text — can be static or a signal that updates as chunks stream in. */
  response: Value<string>
  /** Whether the response is still streaming. */
  isStreaming?: Value<boolean>
  /** Callback fired when a rendered component dispatches an action. */
  onAction?: (event: ActionEvent) => void
  /** Callback fired when parse errors occur. */
  onError?: (errors: ParseError[]) => void
  /** Callback fired when streaming ends (isStreaming transitions to false). */
  onComplete?: () => void
  /** CSS class for the renderer's root container. */
  className?: Value<string>
  /** When true, render warning notices for unknown components. */
  debug?: boolean
}

/**
 * Parses OpenUI Lang text and renders the result as live BeatUI components.
 *
 * Accepts both static strings and reactive signals. When `response` is a
 * signal, the output re-renders on each update via `MapSignal`.
 */
export function OpenUIRenderer(options: OpenUIRendererOptions): Renderable {
  const {
    library,
    response,
    isStreaming,
    onAction,
    onError,
    onComplete,
    debug,
  } = options

  function parseAndRender(text: string): TNode {
    if (!text) return Empty

    const parse = createParser(library)
    const result = parse(text)

    if (result.meta.errors.length > 0 && onError) {
      onError(result.meta.errors)
    }

    if (!result.root) return Empty
    return renderNode(result.root, result)
  }

  function renderNode(node: ASTNode, result: ParseResult): TNode {
    if (node.type === 'reference') {
      const statement = result.statements.get(node.name)
      if (statement) {
        return renderNode(statement.value, result)
      }
      // Unresolved reference — render nothing (incomplete input)
      return Empty
    }

    if (node.type === 'component') {
      // Resolve reference args inline before passing to resolveNode
      const resolvedArgs = node.args.map((arg): ASTNode => {
        if (arg.type === 'reference') {
          const stmt = result.statements.get(arg.name)
          return stmt ? stmt.value : arg
        }
        if (arg.type === 'array') {
          return {
            ...arg,
            items: arg.items.map((item): ASTNode => {
              if (item.type === 'reference') {
                const stmt = result.statements.get(item.name)
                return stmt ? stmt.value : item
              }
              return item
            }),
          }
        }
        return arg
      })
      return resolveNode({ ...node, args: resolvedArgs }, library, debug)
    }

    return resolveNode(node, library, debug)
  }

  // Static string — parse once, no reactivity needed
  if (typeof response === 'string') {
    return html.div(
      attr.class(options.className ?? ''),
      Provide(ActionContextProvider, { onAction }, () =>
        parseAndRender(response)
      )
    )
  }

  // Signal — re-render via MapSignal when response changes
  const disposeHandlers: Array<() => void> = []

  if (isStreaming !== undefined) {
    disposeHandlers.push(
      Value.on(isStreaming, streaming => {
        if (!streaming && onComplete) {
          onComplete()
        }
      })
    )
  }

  return html.div(
    attr.class(options.className ?? ''),
    Provide(ActionContextProvider, { onAction }, () =>
      Fragment(
        MapSignal(response, text => parseAndRender(text)),
        OnDispose(() => {
          for (const fn of disposeHandlers) fn()
        })
      )
    )
  )
}
