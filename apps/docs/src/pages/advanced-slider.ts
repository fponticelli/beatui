import {
  AdvancedSlider,
  ControlSize,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  InputWrapper,
  Switch,
  Group,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

export default function AdvancedSliderPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)
  const showValue = prop(true)

  // Single value
  const singleValue = prop(50)

  // Range values
  const rangeValue = prop<[number, number]>([20, 80])

  // Multi-point values
  const multiPoints = prop([10, 40, 70, 90])

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Size',
        content: SegmentedInput({
          size: 'sm',
          options: { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' },
          value: size,
          onChange: size.set,
        }),
      }),
      InputWrapper({
        label: 'Show Value',
        content: Switch({
          value: showValue,
          onChange: showValue.set,
        }),
      }),
      InputWrapper({
        label: 'Disabled',
        content: Switch({
          value: disabled,
          onChange: disabled.set,
        }),
      })
    ),
    body: Stack(
      attr.class('items-start gap-6 p-4'),

      // Single value slider
      html.h3(attr.class('text-lg font-semibold'), 'Single Value Slider'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Value: ',
        singleValue.map(v => String(v))
      ),
      html.div(
        attr.class('w-full max-w-lg'),
        AdvancedSlider({
          value: singleValue,
          onChange: singleValue.set,
          min: 0,
          max: 100,
          step: 1,
          showValue: showValue.value,
          size,
          disabled,
        })
      ),

      // With tick marks
      html.h3(attr.class('text-lg font-semibold mt-4'), 'With Automatic Ticks'),
      html.div(
        attr.class('w-full max-w-lg'),
        AdvancedSlider({
          value: prop(50),
          onChange: () => {},
          min: 0,
          max: 100,
          step: 10,
          ticks: true,
          showValue: showValue.value,
          size,
          disabled,
        })
      ),

      // With custom tick labels
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Custom Tick Labels'),
      html.div(
        attr.class('w-full max-w-lg'),
        AdvancedSlider({
          value: prop(25),
          onChange: () => {},
          min: 0,
          max: 100,
          step: 25,
          ticks: [
            { value: 0, label: '0%' },
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: '100%' },
          ],
          showValue: showValue.value,
          formatValue: (v: number) => `${v}%`,
          size,
          disabled,
        })
      ),

      // Range slider
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Range Slider'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Range: ',
        rangeValue.map(r => `${r[0]} - ${r[1]}`)
      ),
      html.div(
        attr.class('w-full max-w-lg'),
        AdvancedSlider({
          range: rangeValue,
          onRangeChange: rangeValue.set,
          min: 0,
          max: 100,
          step: 5,
          showValue: showValue.value,
          ticks: [
            { value: 0, label: '$0' },
            { value: 50, label: '$50' },
            { value: 100, label: '$100' },
          ],
          formatValue: (v: number) => `$${v}`,
          size,
          disabled,
          color: 'green',
        })
      ),

      // Multi-point slider
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Multi-Point Slider'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Points: ',
        multiPoints.map(pts => pts.join(', '))
      ),
      html.div(
        attr.class('w-full max-w-lg'),
        AdvancedSlider({
          points: multiPoints,
          onPointsChange: multiPoints.set,
          min: 0,
          max: 100,
          step: 1,
          showValue: showValue.value,
          size,
          disabled,
          color: 'violet',
        })
      ),

      // Color variants
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Color Variants'),
      ...(['primary', 'red', 'green', 'blue', 'orange', 'violet'] as const).map(
        color =>
          html.div(
            attr.class('w-full max-w-lg mb-3'),
            html.p(attr.class('text-sm text-gray-500 mb-1'), color),
            AdvancedSlider({
              value: prop(60),
              onChange: () => {},
              min: 0,
              max: 100,
              showValue: showValue.value,
              size,
              disabled,
              color,
            })
          )
      )
    ),
  })
}
