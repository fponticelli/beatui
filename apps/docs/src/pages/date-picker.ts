import {
  DatePicker,
  DateRangePicker,
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

export default function DatePickerPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)
  const selectedDate = prop<{ year: number; month: number; day: number } | null>(null)

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Size',
        content: SegmentedInput({
          options: { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' },
          value: size,
          onChange: v => size.set(v),
        }),
      }),
      InputWrapper({
        label: 'Disabled',
        content: Switch({
          value: disabled,
          onChange: v => disabled.set(v),
        }),
      })
    ),
    body: Stack(
      attr.class('items-start gap-6 p-4'),

      // Basic
      html.h3(attr.class('text-lg font-semibold'), 'Basic DatePicker'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Selected: ',
        selectedDate.map(d =>
          d != null
            ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
            : 'None'
        )
      ),
      DatePicker({
        value: selectedDate as never,
        onSelect: v => selectedDate.set(v as never),
        size,
        disabled,
      }),

      // With date range
      html.h3(
        attr.class('text-lg font-semibold mt-4'),
        'With Date Constraints'
      ),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Only dates in the current month are selectable.'
      ),
      (() => {
        const constrainedDate = prop<{ year: number; month: number; day: number } | null>(null)
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1
        return DatePicker({
          value: constrainedDate as never,
          onSelect: (v: { year: number; month: number; day: number }) => constrainedDate.set(v),
          isDateDisabled: (d: { year: number; month: number; day: number }) =>
            d.year !== currentYear || d.month !== currentMonth,
          size,
          disabled,
        } as never)
      })(),

      // Monday start
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Week Starting Monday'),
      (() => {
        const mondayDate = prop<{ year: number; month: number; day: number } | null>(null)
        return DatePicker({
          value: mondayDate as never,
          onSelect: v => mondayDate.set(v as never),
          weekStartsOn: 1,
          size,
          disabled,
        })
      })(),

      // Color variants
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Color Variants'),
      Group(
        attr.class('flex-wrap gap-4'),
        ...(
          ['primary', 'red', 'green', 'blue', 'orange', 'violet'] as const
        ).map(color => {
          return Stack(
            html.p(
              attr.class('text-sm text-gray-500 dark:text-gray-400 mb-1'),
              color
            ),
            DatePicker({
              color,
              size,
              disabled,
            })
          )
        })
      ),

      // Date Range
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Date Range'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Click two dates to select a range. Hover to preview.'
      ),
      (() => {
        const range = prop<[{ year: number; month: number; day: number }, { year: number; month: number; day: number }] | null>(null)
        return Stack(
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Range: ',
            range.map(r =>
              r != null
                ? `${r[0].year}-${String(r[0].month).padStart(2, '0')}-${String(r[0].day).padStart(2, '0')} \u2013 ${r[1].year}-${String(r[1].month).padStart(2, '0')}-${String(r[1].day).padStart(2, '0')}`
                : 'None'
            )
          ),
          DateRangePicker({
            value: range as never,
            onChange: v => range.set(v as never),
            size,
            disabled,
          })
        )
      })(),

      // Size comparison
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Size Comparison'),
      Group(
        attr.class('flex-wrap gap-4'),
        ...(['xs', 'sm', 'md', 'lg'] as ControlSize[]).map(s => {
          return Stack(
            html.p(
              attr.class('text-sm text-gray-500 dark:text-gray-400 mb-1'),
              `Size: ${s}`
            ),
            DatePicker({
              size: s,
            })
          )
        })
      )
    ),
  })
}
