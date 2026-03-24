import { Empty, Fragment } from '@tempots/dom'
import type { TNode, Renderable } from '@tempots/dom'
import type { ASTNode } from '../parser/types'
import type { Library } from '../library/types'
import { OpenUISkeleton } from './skeleton'

export function resolveNode(
  node: ASTNode,
  library: Library,
  debug?: boolean
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
        ...node.items.map(item => resolveNode(item, library, debug))
      )

    case 'object':
      // Objects are used as component props, not rendered directly
      return Empty

    case 'reference':
      // Return a skeleton placeholder; actual reference resolution is handled elsewhere
      return OpenUISkeleton()

    case 'component': {
      const component = library.get(node.name)
      if (!component) {
        return Empty
      }

      // Get the schema keys in order
      const schemaKeys = Object.keys(
        (component.props as { shape: Record<string, unknown> }).shape
      )

      // Separate children (last arg if it's an array node) from regular args
      const args = node.args
      let childrenNodes: ASTNode[] = []
      let propArgs: ASTNode[] = args

      // If the last arg is an array node, treat it as children
      if (args.length > 0 && args[args.length - 1].type === 'array') {
        childrenNodes = (args[args.length - 1] as { type: 'array'; items: ASTNode[] }).items
        propArgs = args.slice(0, -1)
      }

      // Zip positional args with schema keys to build props object
      const propsObj: Record<string, unknown> = {}
      for (let i = 0; i < propArgs.length && i < schemaKeys.length; i++) {
        const arg = propArgs[i]
        propsObj[schemaKeys[i]] = extractValue(arg)
      }

      // Resolve children into TNodes
      const resolvedChildren: TNode[] = childrenNodes.map(child =>
        resolveNode(child, library, debug)
      )

      // If schema has a 'children' key, put resolved children into props
      if (schemaKeys.includes('children') && resolvedChildren.length > 0) {
        propsObj['children'] = resolvedChildren
      }

      // Validate props — skip children field since it contains TNodes, not serializable values
      const propsForValidation = { ...propsObj }
      delete propsForValidation['children']
      const parseResult = component.props.safeParse(propsForValidation)
      const validatedProps = parseResult.success
        ? { ...parseResult.data, ...(propsObj['children'] != null ? { children: propsObj['children'] } : {}) }
        : propsObj

      return component.renderer(
        validatedProps as Record<string, unknown>,
        resolvedChildren
      ) as TNode
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
