import { Empty, Fragment } from '@tempots/dom'
import type { TNode } from '@tempots/dom'
import type { ASTNode } from '../parser/types'
import type { Library, DefinedComponent } from '../library/types'
import { OpenUISkeleton } from './skeleton'

/** Extract the Zod schema shape keys in insertion order. */
function getSchemaKeys(component: DefinedComponent): string[] {
  return Object.keys(component.props.shape)
}

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

      const schemaKeys = getSchemaKeys(component)
      const hasChildrenKey = schemaKeys.includes('children')

      // Only split off the last array arg as "children" if the schema
      // explicitly has a `children` key. Otherwise all args are positional.
      const args = node.args
      let childrenNodes: ASTNode[] = []
      let propArgs: ASTNode[] = args

      if (hasChildrenKey) {
        const lastArg = args[args.length - 1]
        if (args.length > 0 && lastArg.type === 'array') {
          childrenNodes = lastArg.items
          propArgs = args.slice(0, -1)
        }
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
        ? {
            ...parseResult.data,
            ...(propsObj['children'] != null
              ? { children: propsObj['children'] }
              : {}),
          }
        : propsObj

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
