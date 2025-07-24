import { html, attr, TNode } from '@tempots/dom'

export function CodeBlock({
  code,
  language = 'typescript',
  title,
}: {
  code: string
  language?: string
  title?: string
}) {
  return html.div(
    attr.class('bu-bg--darker-neutral bu-rounded-lg bu-overflow-hidden bu-border'),
    
    // Title bar if provided
    title && html.div(
      attr.class('bu-bg--lighter-neutral bu-px-4 bu-py-2 bu-border-b'),
      html.span(
        attr.class('bu-text-sm bu-font-medium'),
        title
      )
    ),
    
    // Code content
    html.pre(
      attr.class('bu-p-4 bu-overflow-x-auto bu-text-sm'),
      html.code(
        attr.class(`language-${language}`),
        code
      )
    )
  )
}

export function InlineCode(content: TNode) {
  return html.code(
    attr.class('bu-bg--lighter-neutral bu-px-1 bu-py-0.5 bu-rounded bu-text-sm bu-font-mono'),
    content
  )
}
