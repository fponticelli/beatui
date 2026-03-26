import { Empty, Fragment } from '@tempots/dom'
import type { TNode } from '@tempots/dom'
import type { ASTNode, Statement } from '../parser/types'
import type { Library, DefinedComponent } from '../library/types'
import { OpenUISkeleton } from './skeleton'

/** Extract the Zod schema shape keys in insertion order. */
function getSchemaKeys(component: DefinedComponent): string[] {
  return Object.keys(component.props.shape)
}

/**
 * Recursively resolve an ASTNode into a TNode.
 * The optional `statements` map enables reference resolution —
 * without it, references render as skeleton placeholders.
 */
export function resolveNode(
  node: ASTNode,
  library: Library,
  debug?: boolean,
  statements?: ReadonlyMap<string, Statement>,
  onAction?: (event: Record<string, unknown>) => void
): TNode {
  switch (node.type) {
    case 'string':
      return node.value

    case 'number':
      return String(node.value)

    case 'boolean':
      return String(node.value)

    case 'null':
      return Empty

    case 'array':
      return Fragment(
        ...node.items.map(item =>
          resolveNode(item, library, debug, statements, onAction)
        )
      )

    case 'object':
      // Objects are used as component props, not rendered directly
      return Empty

    case 'reference': {
      // Resolve from statements map if available
      if (statements) {
        const stmt = statements.get(node.name)
        if (stmt)
          return resolveNode(stmt.value, library, debug, statements, onAction)
      }
      return OpenUISkeleton()
    }

    case 'component': {
      const component = library.get(node.name)
      if (!component) {
        return Empty
      }

      const hasChildrenKey = getSchemaKeys(component).includes('children')
      const args = node.args

      // Props are always passed as a named object: Component({key: value})
      // Children arrays are passed directly: Stack([child1, child2])
      let propsObj: Record<string, unknown> = {}
      let childrenNodes: ASTNode[] = []

      if (args.length >= 1 && args[0].type === 'object') {
        // Named props: Button({label: "Hi", variant: "filled"})
        propsObj = extractValue(args[0]) as Record<string, unknown>
        // Optional children array as second arg
        const lastArg = args[args.length - 1]
        if (args.length > 1 && lastArg.type === 'array' && hasChildrenKey) {
          childrenNodes = lastArg.items
        }
      } else if (
        args.length >= 1 &&
        args[0].type === 'array' &&
        hasChildrenKey
      ) {
        // Children-only: Stack([child1, child2])
        childrenNodes = args[0].items
      }

      // Resolve children into TNodes
      const resolvedChildren: TNode[] = childrenNodes.map(child =>
        resolveNode(child, library, debug, statements, onAction)
      )

      // If schema has a 'children' key, put resolved children into props
      if (hasChildrenKey && resolvedChildren.length > 0) {
        propsObj['children'] = resolvedChildren
      }

      // Validate props — skip children field since it contains TNodes, not serializable values
      const propsForValidation = { ...propsObj }
      delete propsForValidation['children']
      const parseResult = component.props.safeParse(propsForValidation)
      const validatedProps = parseResult.success
        ? {
            ...parseResult.data,
            ...(propsObj['children'] != null
              ? { children: propsObj['children'] }
              : {}),
          }
        : propsObj

      // Inject action handler for components that support actionType
      if (onAction && propsObj['actionType']) {
        ;(validatedProps as Record<string, unknown>).__onAction = onAction
      }

      return component.renderer(validatedProps, resolvedChildren)
    }
  }
}

function extractValue(node: ASTNode): unknown {
  switch (node.type) {
    case 'string':
      return node.value
    case 'number':
      return node.value
    case 'boolean':
      return node.value
    case 'null':
      return null
    case 'array':
      return node.items.map(item => extractValue(item))
    case 'object':
      return Object.fromEntries(
        Object.entries(node.entries).map(([k, v]) => [k, extractValue(v)])
      )
    case 'reference':
      return node.name
    case 'component':
      return node.name
  }
}
