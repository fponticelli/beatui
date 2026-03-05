import { html, attr, Fragment, TNode } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import type { ApiType, ApiReflection } from '../../api/typedoc-types'
import { ReflectionKind } from '../../api/typedoc-types'

/**
 * Recursively renders a TypeDoc type as inline code-like HTML.
 * Cross-links to documented symbols where possible.
 */
export function renderType(t: ApiType | undefined, moduleSlug?: string): TNode {
  if (!t) return html.span(attr.class('api-type api-type--unknown'), 'unknown')

  switch (t.type) {
    case 'intrinsic':
      return html.span(
        attr.class('api-type api-type--intrinsic'),
        t.name ?? 'unknown'
      )

    case 'literal':
      return html.span(
        attr.class('api-type api-type--literal'),
        t.value === null
          ? 'null'
          : typeof t.value === 'string'
            ? `"${t.value}"`
            : String(t.value)
      )

    case 'reference': {
      const name = t.name ?? 'unknown'
      const typeArgs = t.typeArguments
      const nameNode =
        typeof t.target === 'number' && moduleSlug
          ? Anchor(
              { href: `/api/${moduleSlug}/${name}`, viewTransition: true },
              attr.class('api-type api-type--reference-link'),
              name
            )
          : html.span(attr.class('api-type api-type--reference'), name)

      if (typeArgs && typeArgs.length > 0) {
        return Fragment(
          nameNode,
          '<',
          ...typeArgs.flatMap((a, i) =>
            i > 0
              ? [', ', renderType(a, moduleSlug)]
              : [renderType(a, moduleSlug)]
          ),
          '>'
        )
      }
      return nameNode
    }

    case 'union':
      return Fragment(
        ...(t.types ?? []).flatMap((u, i) =>
          i > 0
            ? [
                html.span(attr.class('api-type--separator'), ' | '),
                renderType(u, moduleSlug),
              ]
            : [renderType(u, moduleSlug)]
        )
      )

    case 'intersection':
      return Fragment(
        ...(t.types ?? []).flatMap((u, i) =>
          i > 0
            ? [
                html.span(attr.class('api-type--separator'), ' & '),
                renderType(u, moduleSlug),
              ]
            : [renderType(u, moduleSlug)]
        )
      )

    case 'array':
      return Fragment(renderType(t.elementType, moduleSlug), '[]')

    case 'tuple':
      return Fragment(
        '[',
        ...(t.elements ?? []).flatMap((e, i) =>
          i > 0
            ? [', ', renderType(e, moduleSlug)]
            : [renderType(e, moduleSlug)]
        ),
        ']'
      )

    case 'reflection':
      return renderReflectionType(t.declaration, moduleSlug)

    case 'typeOperator':
      return Fragment(
        html.span(attr.class('api-type api-type--keyword'), t.operator ?? ''),
        ' ',
        renderType(t.target as unknown as ApiType, moduleSlug)
      )

    case 'indexedAccess':
      return Fragment(
        renderType(t.objectType, moduleSlug),
        '[',
        renderType(t.indexType, moduleSlug),
        ']'
      )

    case 'conditional':
      return Fragment(
        renderType(t.checkType, moduleSlug),
        html.span(attr.class('api-type--keyword'), ' extends '),
        renderType(t.extendsType, moduleSlug),
        html.span(attr.class('api-type--keyword'), ' ? '),
        renderType(t.trueType, moduleSlug),
        html.span(attr.class('api-type--keyword'), ' : '),
        renderType(t.falseType, moduleSlug)
      )

    case 'predicate':
      return Fragment(
        html.span(attr.class('api-type'), t.name ?? 'value'),
        html.span(attr.class('api-type--keyword'), ' is '),
        renderType(t.targetType, moduleSlug)
      )

    case 'query':
      return Fragment(
        html.span(attr.class('api-type--keyword'), 'typeof '),
        renderType(t.queryType, moduleSlug)
      )

    case 'mapped':
      return Fragment(
        '{ [',
        html.span(attr.class('api-type'), t.parameter ?? 'K'),
        ' in ',
        renderType(t.parameterType, moduleSlug),
        ']: ',
        renderType(t.templateType, moduleSlug),
        ' }'
      )

    case 'templateLiteral': {
      const parts: TNode[] = ['`', t.head ?? '']
      for (const [type, text] of t.tail ?? []) {
        parts.push('${', renderType(type, moduleSlug), '}', text)
      }
      parts.push('`')
      return Fragment(...parts)
    }

    case 'rest':
      return Fragment('...', renderType(t.elementType, moduleSlug))

    default:
      return html.span(attr.class('api-type api-type--unknown'), t.type)
  }
}

function renderReflectionType(
  decl: ApiReflection | undefined,
  moduleSlug?: string
): TNode {
  if (!decl) return html.span(attr.class('api-type'), '{}')

  // Function signature
  if (decl.signatures?.length) {
    const sig = decl.signatures[0]
    const params = sig.parameters ?? []
    return Fragment(
      '(',
      ...params.flatMap((p, i) =>
        i > 0
          ? [
              ', ',
              html.span(attr.class('api-type'), p.name),
              ': ',
              renderType(p.type, moduleSlug),
            ]
          : [
              html.span(attr.class('api-type'), p.name),
              ': ',
              renderType(p.type, moduleSlug),
            ]
      ),
      ') => ',
      renderType(sig.type, moduleSlug)
    )
  }

  // Object type literal
  if (decl.children?.length) {
    if (decl.children.length <= 3) {
      return Fragment(
        '{ ',
        ...decl.children.flatMap((c, i) => {
          const optional = c.flags?.isOptional ? '?' : ''
          return i > 0
            ? [
                '; ',
                html.span(attr.class('api-type'), c.name + optional),
                ': ',
                renderType(c.type, moduleSlug),
              ]
            : [
                html.span(attr.class('api-type'), c.name + optional),
                ': ',
                renderType(c.type, moduleSlug),
              ]
        }),
        ' }'
      )
    }
    return html.span(
      attr.class('api-type'),
      `{ /* ${decl.children.length} properties */ }`
    )
  }

  // Index signatures
  if (decl.kind === ReflectionKind.TypeAlias && decl.type) {
    return renderType(decl.type, moduleSlug)
  }

  return html.span(attr.class('api-type'), '{}')
}
