import { attr, html, prop, style } from '@tempots/dom'
import {
  Card,
  ColorInput,
  Group,
  InputWrapper,
  ScrollablePanel,
  Stack,
} from '@tempots/beatui'

export default function ColorInputPage() {
  // Simple color swatch example
  const colorA = prop('#3b82f6')
  const colorB = prop('#ffffff')

  return ScrollablePanel({
    body: Stack(
      attr.class('p-6 gap-8'),
      Card(
        {},
        Stack(
          attr.class('gap-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Basic Color Swatch'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'A simple color swatch that updates a preview box.'
          ),
          Group(
            attr.class('items-center gap-4'),
            InputWrapper({
              label: 'Pick a Color',
              content: ColorInput({
                value: colorA,
                onChange: color => colorA.set(color),
                id: 'simple-color',
              }),
            }),
            html.div(
              attr.class(
                'w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600'
              ),
              style.backgroundColor(colorA)
            ),
            Stack(
              attr.class('text-sm'),
              html.div(html.strong('Selected: '), colorA)
            )
          ),
          Group(
            attr.class('items-center gap-4 w-full'),
            InputWrapper({
              label: 'Pick a Color',
              layout: 'horizontal-fixed',
              content: ColorInput({
                value: colorB,
                onChange: color => colorB.set(color),
                id: 'simple-color2',
              }),
            })
          )
        )
      )
    ),
  })
}
