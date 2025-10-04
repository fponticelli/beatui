import { attr, html, prop, style, Value } from '@tempots/dom'
import { NativeSelect, ScrollablePanel, Stack } from '@tempots/beatui'
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
    body: html.div(
      attr.class('flex flex-rowitems-start gap-4 p-4 h-full overflow-hidden'),
      html.div(
        attr.class('flex flex-col'),
        html.div(
          attr.class('flex flex-row items-center mb-2 w-full gap-4'),
          html.h3(
            attr.class('text-lg font-semibold text-nowrap'),
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
        MilkdownInput({
          value: markdown as Value<string>,
          onChange: v => markdown.set(v),
          autofocus: true,
        })
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
