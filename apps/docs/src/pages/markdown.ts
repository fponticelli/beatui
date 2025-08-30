import { Async, attr, html, prop } from '@tempots/dom'
import { Stack } from '@tempots/beatui'

const content = prop(`# Markdown Sample

This is a paragraph with **bold**, _italic_, and \`inline code\`.

- List Item 1
- List Item 2

1. Ordered A
2. Ordered B

> Blockquote with some emphasized text.

---

## Code Block

\`\`\`ts
function greet(name: string) {
  return 'Hello ' + name
}
\`\`\`

| Col A | Col B |
| ---- | ---- |
| a | b |

![Image](https://picsum.photos/600/400)
`)

export const MarkdownPage = () =>
  Async(import('@tempots/beatui/markdown'), ({ Markdown }) =>
    Stack(
      attr.class('bu-p-4 bu-gap-4'),
      html.h1(attr.class('bu-text-xl bu-font-semibold'), 'Markdown'),
      Markdown({ content })
    )
  )
