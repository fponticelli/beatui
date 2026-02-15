import {
  DateCalendar,
  DateRangeCalendar,
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

export default function CalendarPage() {
  const size = prop<ControlSize>('md')
  const disabled = prop(false)
  const selectedDate = prop<Date | null>(new Date())

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
        label: 'Disabled',
        content: Switch({
          value: disabled,
          onChange: disabled.set,
        }),
      })
    ),
    body: Stack(
      attr.class('items-start gap-6 p-4'),

      // Basic
      html.h3(attr.class('text-lg font-semibold'), 'Basic Calendar'),
      html.p(
        attr.class('text-sm text-gray-600 dark:text-gray-400'),
        'Selected: ',
        selectedDate.map(d => (d != null ? d.toLocaleDateString() : 'None'))
      ),
      DateCalendar({
        value: selectedDate,
        onSelect: selectedDate.set,
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
        const constrainedDate = prop<Date | null>(null)
        const monthStart = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        )
        const monthEnd = new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        )
        return DateCalendar({
          value: constrainedDate,
          onSelect: constrainedDate.set,
          isDateDisabled: d => d < monthStart || d > monthEnd,
          size,
          disabled,
        })
      })(),

      // Monday start
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Week Starting Monday'),
      (() => {
        const mondayDate = prop<Date | null>(null)
        return DateCalendar({
          value: mondayDate,
          onSelect: mondayDate.set,
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
          const colorDate = prop<Date | null>(new Date())
          return Stack(
            html.p(attr.class('text-sm text-gray-500 dark:text-gray-400 mb-1'), color),
            DateCalendar({
              value: colorDate,
              onSelect: colorDate.set,
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
        const range = prop<[Date, Date] | null>(null)
        return Stack(
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Range: ',
            range.map(r =>
              r != null
                ? `${r[0].toLocaleDateString()} \u2013 ${r[1].toLocaleDateString()}`
                : 'None'
            )
          ),
          DateRangeCalendar({
            value: range,
            onChange: range.set,
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
          const sizeDate = prop<Date | null>(null)
          return Stack(
            html.p(attr.class('text-sm text-gray-500 dark:text-gray-400 mb-1'), `Size: ${s}`),
            DateCalendar({
              value: sizeDate,
              onSelect: sizeDate.set,
              size: s,
            })
          )
        })
      )
    ),
  })
}
