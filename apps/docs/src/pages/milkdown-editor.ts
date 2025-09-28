import { attr, html, prop, style, Value } from '@tempots/dom'
import { Group, NativeSelect, ScrollablePanel, Stack } from '@tempots/beatui'
import { MilkdownInput } from '@tempots/beatui/milkdown'

const samples = [
  {
    label: 'Welcome',
    value:
      '# Hello, Milkdown!\n\nStart writing your markdown...\n\n- Item 1\n- Item 2\n\n**Bold**, _Italic_, and `code`.',
  },
  {
    label: 'Tables',
    value: '| Col A | Col B |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |',
  },
]

export default function MilkdownEditorPage() {
  const selectedIndex = prop(0)
  const markdown = selectedIndex.map(i => samples[i].value).deriveProp()

  return ScrollablePanel({
    body: Group(
        attr.class('items-start gap-4 p-4 h-full overflow-hidden'),
      ScrollablePanel(
        {
          header: Group(
        attr.class('gap-2 items-center'),
            html.h3(
              attr.class('text-lg font-semibold'),
              'Milkdown Editor'
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
          body: MilkdownInput({
            value: markdown as Value<string>,
            onChange: v => markdown.set(v),
            autofocus: true,
          }),
        },
        style.minWidth('42rem'),
        style.maxWidth('42rem')
      ),
      Stack(
        style.minWidth('42rem'),
        style.maxWidth('42rem'),
        attr.class('flex-1 gap-2'),
        html.h3(attr.class('text-lg font-semibold'), 'Current Value'),
        html.pre(
          attr.class('overflow-y-auto'),
          markdown.map(v => String(v))
        )
      )
    ),
  })
}
