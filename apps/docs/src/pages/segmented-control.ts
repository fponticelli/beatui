import {
  ControlSize,
  ScrollablePanel,
  SegmentedInput,
  Stack,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export default function SegmentedControlPage() {
  const disabled = prop(false)
  const options = {
    first: 'First',
    second: 'Second',
    third: 'Third',
  }
  const value = prop<keyof typeof options>('second')

  return ScrollablePanel({
    header: ControlsHeader(DisabledSelector({ disabled })),
    body: Stack(
      attr.class('items-center gap-4 p-4 h-full overflow-hidden'),
      html.h3(attr.class('text-lg font-semibold'), 'Size Variations'),
      html.table(
        attr.class('w-full border-collapse'),
        html.thead(
          html.tr(
            html.th(attr.class('border p-2 text-left'), 'Size'),
            html.th(attr.class('border p-2 text-left'), 'Example')
          )
        ),
        html.tbody(
          ...allSizes.map(currentSize =>
            html.tr(
              html.th(attr.class('border p-2'), currentSize),
              html.td(
                attr.class('border p-2'),
                SegmentedInput({
                  options,
                  size: currentSize,
                  disabled,
                  value,
                  onChange: value.set,
                })
              )
            )
          )
        )
      )
    ),
  })
}
