import {
  AdvancedSlider,
  ControlSize,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  InputWrapper,
  Switch,
} from '@tempots/beatui'
import { html, attr, prop, style, Value } from '@tempots/dom'
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

  // With ticks
  const ticksValue = prop(50)

  // Custom tick labels
  const customTicksValue = prop(25)

  // Color variants
  const primaryColorValue = prop(60)
  const redColorValue = prop(60)
  const greenColorValue = prop(60)
  const blueColorValue = prop(60)
  const orangeColorValue = prop(60)
  const violetColorValue = prop(60)

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Size',
        content: SegmentedInput({
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
          showValue,
          size,
          disabled,
        })
      ),

      // With tick marks
      html.h3(attr.class('text-lg font-semibold mt-4'), 'With Automatic Ticks'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Value: ',
        ticksValue.map(v => String(v))
      ),
      html.div(
        attr.class('w-full max-w-lg'),
        AdvancedSlider({
          value: ticksValue,
          onChange: ticksValue.set,
          min: 0,
          max: 100,
          step: 10,
          ticks: true,
          showValue,
          size,
          disabled,
        })
      ),

      // With custom tick labels
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Custom Tick Labels'),
      html.p(
        attr.class('text-sm text-gray-600'),
        'Value: ',
        customTicksValue.map(v => `${v}%`)
      ),
      html.div(
        attr.class('w-full max-w-lg'),
        AdvancedSlider({
          value: customTicksValue,
          onChange: customTicksValue.set,
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
          showValue,
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
          showValue,
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
          showValue,
          size,
          disabled,
          color: 'violet',
        })
      ),

      // Multi-point slider with segment colors
      html.h3(
        attr.class('text-lg font-semibold mt-4'),
        'Multi-Point Slider with Segment Colors'
      ),
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
          showValue,
          size,
          disabled,
          segmentColors: ['red', 'green', 'blue'],
        })
      ),

      // Custom thumb
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Custom Thumb'),
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
          size,
          disabled,
          color: 'violet',
          renderThumb: (_index: number, val: Value<number>) =>
            html.div(
              style.width('28px'),
              style.height('28px'),
              style.borderRadius('6px'),
              style.backgroundColor('var(--slider-color)'),
              style.color('white'),
              style.display('flex'),
              style.alignItems('center'),
              style.justifyContent('center'),
              style.fontSize('11px'),
              style.fontWeight('700'),
              style.lineHeight('1'),
              Value.map(val, v => String(v))
            ),
        })
      ),

      // Color variants
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Color Variants'),
      html.div(
        attr.class('w-full max-w-lg mb-3'),
        html.p(attr.class('text-sm text-gray-500 mb-1'), 'primary'),
        AdvancedSlider({
          value: primaryColorValue,
          onChange: primaryColorValue.set,
          min: 0,
          max: 100,
          showValue,
          size,
          disabled,
          color: 'primary',
        })
      ),
      html.div(
        attr.class('w-full max-w-lg mb-3'),
        html.p(attr.class('text-sm text-gray-500 mb-1'), 'red'),
        AdvancedSlider({
          value: redColorValue,
          onChange: redColorValue.set,
          min: 0,
          max: 100,
          showValue,
          size,
          disabled,
          color: 'red',
        })
      ),
      html.div(
        attr.class('w-full max-w-lg mb-3'),
        html.p(attr.class('text-sm text-gray-500 mb-1'), 'green'),
        AdvancedSlider({
          value: greenColorValue,
          onChange: greenColorValue.set,
          min: 0,
          max: 100,
          showValue,
          size,
          disabled,
          color: 'green',
        })
      ),
      html.div(
        attr.class('w-full max-w-lg mb-3'),
        html.p(attr.class('text-sm text-gray-500 mb-1'), 'blue'),
        AdvancedSlider({
          value: blueColorValue,
          onChange: blueColorValue.set,
          min: 0,
          max: 100,
          showValue,
          size,
          disabled,
          color: 'blue',
        })
      ),
      html.div(
        attr.class('w-full max-w-lg mb-3'),
        html.p(attr.class('text-sm text-gray-500 mb-1'), 'orange'),
        AdvancedSlider({
          value: orangeColorValue,
          onChange: orangeColorValue.set,
          min: 0,
          max: 100,
          showValue,
          size,
          disabled,
          color: 'orange',
        })
      ),
      html.div(
        attr.class('w-full max-w-lg mb-3'),
        html.p(attr.class('text-sm text-gray-500 mb-1'), 'violet'),
        AdvancedSlider({
          value: violetColorValue,
          onChange: violetColorValue.set,
          min: 0,
          max: 100,
          showValue,
          size,
          disabled,
          color: 'violet',
        })
      )
    ),
  })
}
