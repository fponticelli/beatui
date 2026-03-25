import {
  html,
  attr,
  prop,
  MapSignal,
  Provide,
  OnDispose,
  Fragment,
  Empty,
  Value,
  computedOf,
} from '@tempots/dom'
import type { TNode, Renderable, Prop } from '@tempots/dom'
import type { ASTNode, ParseResult, ParseError } from '../parser/types'
import type { Library } from '../library/types'
import { createStreamingParser } from '../parser/streaming-parser'
import { resolveNode } from './node-resolver'
import { OpenUISkeleton } from './skeleton'
import { ActionContextProvider, type ActionEvent } from './action-context'

export interface OpenUIRendererOptions {
  library: Library
  response: Value<string>
  isStreaming?: Value<boolean>
  onAction?: (event: ActionEvent) => void
  onError?: (errors: ParseError[]) => void
  onComplete?: () => void
  initialState?: Record<string, unknown>
  className?: Value<string>
  debug?: boolean
}

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

  const streamingParser = createStreamingParser(library)

  // Track forward references: name -> prop that will be updated when resolved
  const refProps = new Map<string, Prop<ASTNode | null>>()

  let lastPushed = ''

  function pushResponse(text: string): ParseResult {
    if (text === lastPushed) return streamingParser.getResult()
    // Compute delta and push new chars
    const delta = text.slice(lastPushed.length)
    lastPushed = text
    if (delta.length === 0) return streamingParser.getResult()

    const result = streamingParser.push(delta)

    // Report errors
    if (result.meta.errors.length > 0 && onError) {
      onError(result.meta.errors)
    }

    // Resolve forward references
    resolveForwardRefs(result)

    return result
  }

  function resolveForwardRefs(result: ParseResult) {
    for (const [name, statement] of result.statements) {
      const refProp = refProps.get(name)
      if (refProp && refProp.get() === null) {
        refProp.set(statement.value)
      }
    }
  }

  function renderResult(result: ParseResult): TNode {
    if (!result.root) {
      return Empty
    }
    return renderNode(result.root, result)
  }

  function renderNode(node: ASTNode, result: ParseResult): TNode {
    if (node.type === 'reference') {
      // Check if the reference is already resolved in statements
      const statement = result.statements.get(node.name)
      if (statement) {
        return renderNode(statement.value, result)
      }

      // Create a prop for forward reference resolution
      let refProp = refProps.get(node.name)
      if (!refProp) {
        refProp = prop<ASTNode | null>(null)
        refProps.set(node.name, refProp)
      }

      return html.div(
        MapSignal(refProp, resolved =>
          resolved ? resolveNode(resolved, library, debug) : OpenUISkeleton()
        )
      )
    }

    if (node.type === 'component') {
      // Resolve any reference args before passing to resolveNode
      const resolvedArgs = node.args.map(arg => {
        if (arg.type === 'reference') {
          const statement = result.statements.get(arg.name)
          if (statement) return statement.value
        }
        if (arg.type === 'array') {
          return {
            ...arg,
            items: arg.items.map(item => {
              if (item.type === 'reference') {
                const statement = result.statements.get(item.name)
                if (statement) return statement.value
              }
              return item
            }),
          }
        }
        return arg
      })
      const resolvedNode: ASTNode = { ...node, args: resolvedArgs }
      return resolveNode(resolvedNode, library, debug)
    }

    return resolveNode(node, library, debug)
  }

  // Create the parse result signal from the response
  const responseSignal = Value.toSignal(response)
  const parseResultProp = computedOf(responseSignal)<ParseResult>(
    text => {
      return pushResponse(text)
    },
    () => false
  ) // never equal — always update

  // Handle isStreaming transitions
  const disposeHandlers: Array<() => void> = []

  if (isStreaming !== undefined) {
    const disposeStreaming = Value.on(isStreaming, streaming => {
      if (!streaming) {
        // Streaming ended — replace unresolved refs with empty
        for (const [, refProp] of refProps) {
          if (refProp.get() === null) {
            refProp.set({ type: 'null' })
          }
        }
        if (onComplete) {
          onComplete()
        }
      }
    })
    disposeHandlers.push(disposeStreaming)
  }

  return html.div(
    attr.class(options.className ?? ''),
    Provide(ActionContextProvider, { onAction }, () =>
      Fragment(
        MapSignal(parseResultProp, renderResult),
        OnDispose(() => {
          for (const dispose of disposeHandlers) {
            dispose()
          }
          for (const refProp of refProps.values()) {
            refProp.dispose()
          }
        })
      )
    )
  )
}
