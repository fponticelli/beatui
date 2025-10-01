import { attr, prop } from '@tempots/dom'
import { Stack } from '@tempots/beatui'
import { Markdown } from '@tempots/beatui/markdown'

const content = prop(`
# Markdown Sample

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

| Col A | Col B | Col C |
| ---- | ---- | ---- |
| a | b | c |
| d | e | f |
| g | h | i |

---

![Image](https://picsum.photos/600/400)
`)

export default function MarkdownPage() {
  return Stack(
    attr.class('p-4 gap-4 h-full overflow-auto'),
    Markdown({ content, features: { gfm: true } })
  )
}
