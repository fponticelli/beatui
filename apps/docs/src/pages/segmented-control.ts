import {
  ControlSize,
  ScrollablePanel,
  SegmentedControl,
  Stack,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export const SegmentedControlPage = () => {
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
      attr.class(
        'bu-items-center bu-gap-4 bu-p-4 bu-h-full bu-overflow-hidden'
      ),
      html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Size Variations'),
      html.table(
        attr.class('bu-w-full bu-border-collapse'),
        html.thead(
          html.tr(
            html.th(attr.class('bu-border bu-p-2 bu-text-left'), 'Size'),
            html.th(attr.class('bu-border bu-p-2 bu-text-left'), 'Example')
          )
        ),
        html.tbody(
          ...allSizes.map(currentSize =>
            html.tr(
              html.th(attr.class('bu-border bu-p-2'), currentSize),
              html.td(
                attr.class('bu-border bu-p-2'),
                SegmentedControl({
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
