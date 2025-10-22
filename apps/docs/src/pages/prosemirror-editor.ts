import { attr, computedOf, html, prop, style } from '@tempots/dom'
import { NativeSelect, ScrollablePanel, Stack, Switch } from '@tempots/beatui'
import {
  MarkdownFeatures,
  ProseMirrorMarkdownInput,
} from '@tempots/beatui/prosemirror'

const samples = [
  {
    label: 'Welcome',
    value:
      '# Hello, ProseMirror!\n\nStart writing your **markdown**...\n\n- Item 1\n- Item 2\n\n**Bold**, _Italic_, and `code`.',
  },
  {
    label: 'Full Features',
    value: `# Heading 1

## Heading 2

### Heading 3

This is a paragraph with **bold**, _italic_, and \`inline code\`.

- Bullet list item 1
- Bullet list item 2
  - Nested item

1. Ordered list item 1
2. Ordered list item 2

> This is a blockquote with some emphasized text.

\`\`\`
function hello() {
  console.log("Code block")
}
\`\`\`

---

[Link to example](https://example.com)
`,
  },
  {
    label: 'Simple Text',
    value: 'Just a simple paragraph without any formatting.',
  },
]

export default function ProseMirrorEditorPage() {
  const selectedIndex = prop(0)
  const markdown = selectedIndex.map(i => samples[i].value).deriveProp()
  const showToolbar = prop(true)
  const readOnly = prop(false)

  // Feature toggles
  const headings = prop(true)
  const bold = prop(true)
  const italic = prop(true)
  const code = prop(true)
  const links = prop(true)
  const bulletList = prop(true)
  const orderedList = prop(true)
  const blockquote = prop(true)
  const codeBlock = prop(true)
  const horizontalRule = prop(true)

  const features = computedOf(
    headings,
    bold,
    italic,
    code,
    links,
    bulletList,
    orderedList,
    blockquote,
    codeBlock,
    horizontalRule
  )(
    (
      headings,
      bold,
      italic,
      code,
      links,
      bulletList,
      orderedList,
      blockquote,
      codeBlock,
      horizontalRule
    ) =>
      ({
        headings,
        bold,
        italic,
        code,
        links,
        bulletList,
        orderedList,
        blockquote,
        codeBlock,
        horizontalRule,
        headerLevels: 3,
      }) as MarkdownFeatures
  )

  return ScrollablePanel({
    body: html.div(
      attr.class('flex flex-row items-start gap-4 p-4 h-full overflow-hidden'),
      // Left side - Editor
      html.div(
        attr.class('flex flex-col flex-1 gap-4 h-full'),
        html.div(
          attr.class('flex flex-row items-center gap-4'),
          html.h3(
            attr.class('text-lg font-semibold text-nowrap'),
            'ProseMirror Markdown Editor'
          ),
          NativeSelect({
            options: samples.map((s, i) => ({
              type: 'value',
              value: i,
              label: s.label,
            })),
            value: selectedIndex,
            onChange: selectedIndex.set,
          })
        ),
        html.div(
          attr.class('flex flex-row items-center gap-4 flex-wrap'),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: showToolbar, onChange: showToolbar.set }),
            html.span('Show Toolbar')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: readOnly, onChange: readOnly.set }),
            html.span('Read Only')
          )
        ),
        html.div(
          style.flex('1'),
          style.minHeight('0'),
          ProseMirrorMarkdownInput({
            value: markdown,
            onInput: v => markdown.set(v),
            showToolbar,
            features,
            readOnly,
            placeholder: 'Start typing your markdown...',
            autofocus: true,
          })
        )
      ),
      // Right side - Controls and Preview
      html.div(
        attr.class('flex flex-col gap-4'),
        style.minWidth('20rem'),
        style.maxWidth('20rem'),
        // Feature toggles
        html.div(
          attr.class('flex flex-col gap-2 p-4 border rounded'),
          html.h4(attr.class('font-semibold mb-2'), 'Markdown Features'),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: headings, onChange: headings.set }),
            html.span('Headings')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: bold, onChange: bold.set }),
            html.span('Bold')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: italic, onChange: italic.set }),
            html.span('Italic')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: code, onChange: code.set }),
            html.span('Inline Code')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: links, onChange: links.set }),
            html.span('Links')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: bulletList, onChange: bulletList.set }),
            html.span('Bullet Lists')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: orderedList, onChange: orderedList.set }),
            html.span('Ordered Lists')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: blockquote, onChange: blockquote.set }),
            html.span('Blockquotes')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: codeBlock, onChange: codeBlock.set }),
            html.span('Code Blocks')
          ),
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: horizontalRule, onChange: horizontalRule.set }),
            html.span('Horizontal Rules')
          )
        ),
        // Current value preview
        Stack(
          attr.class('flex-1 gap-2 p-4 border rounded overflow-auto'),
          html.h4(attr.class('font-semibold'), 'Current Markdown'),
          html.pre(
            attr.class('text-sm overflow-auto'),
            markdown.map(v => String(v))
          )
        )
      )
    ),
  })
}
