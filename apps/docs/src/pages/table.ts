import { html, attr, Fragment } from '@tempots/dom'
import {
  Card,
  Table,
  useForm,
  Control,
  Switch,
  type ControlSize,
  SegmentedInput,
} from '@tempots/beatui'
import z from 'zod'
import { ControlSizeSelector } from '../elements/control-size-selector'

export default function TablePage() {
  const { controller } = useForm({
    schema: z.object({
      size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
      hoverable: z.boolean(),
      stickyHeader: z.boolean(),
      fullWidth: z.boolean(),
      withStripedRows: z.boolean(),
      withTableBorder: z.boolean(),
      withColumnBorders: z.boolean(),
      withRowBorders: z.boolean(),
      borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
    }),
    initialValue: {
      size: 'md' as ControlSize,
      hoverable: false,
      stickyHeader: false,
      fullWidth: false,
      withStripedRows: false,
      withTableBorder: true,
      withColumnBorders: false,
      withRowBorders: true,
      borderRadius: 'none' as 'none' | 'sm' | 'md' | 'lg' | 'xl',
    },
  })
  const fullWidth = controller.field('fullWidth')
  const size = controller.field('size')
  const hoverable = controller.field('hoverable')
  const stickyHeader = controller.field('stickyHeader')
  const withStripedRows = controller.field('withStripedRows')
  const withTableBorder = controller.field('withTableBorder')
  const withColumnBorders = controller.field('withColumnBorders')
  const withRowBorders = controller.field('withRowBorders')
  const borderRadius = controller.field('borderRadius')

  return Fragment(
    attr.class('m-4'),
    html.h2(attr.class('text-lg font-semibold'), 'Table Component'),
    html.div(
      attr.class('flex flex-row space-x-3 justify-between'),
      html.div(
        attr.class('space-y-3 flex-grow'),
        attr.class(
          stickyHeader.signal.map((v): string =>
            v ? 'overflow-hidden h-103' : ''
          )
        ),
        Table(
          {
            fullWidth: fullWidth.signal,
            size: size.signal,
            hoverable: hoverable.signal,
            stickyHeader: stickyHeader.signal,
            withStripedRows: withStripedRows.signal,
            withTableBorder: withTableBorder.signal,
            withColumnBorders: withColumnBorders.signal,
            withRowBorders: withRowBorders.signal,
            borderRadius: borderRadius.signal,
          },
          html.thead(
            html.tr(html.th('Product'), html.th('Price'), html.th('Stock'))
          ),
          html.tbody(
            html.tr(html.td('Laptop'), html.td('$999'), html.td('15')),
            html.tr(html.td('Mouse'), html.td('$29'), html.td('150')),
            html.tr(html.td('Keyboard'), html.td('$79'), html.td('85')),
            html.tr(html.td('Monitor'), html.td('$299'), html.td('42')),
            html.tr(html.td('Headphones'), html.td('$149'), html.td('25')),
            html.tr(html.td('USB-C Cable'), html.td('$19'), html.td('50')),
            html.tr(html.td('HDMI Cable'), html.td('$14'), html.td('30')),
            html.tr(html.td('Ethernet Cable'), html.td('$12'), html.td('40')),
            html.tr(html.td('Power Adapter'), html.td('$29'), html.td('35')),
            html.tr(html.td('SD Card'), html.td('$10'), html.td('60')),
            html.tr(html.td('USB Flash Drive'), html.td('$15'), html.td('45'))
          ),
          html.tfoot(
            html.tr(html.td('Total'), html.td('$1,500'), html.td('500'))
          )
        )
      ),
      Card(
        {},
        attr.class('flex flex-col space-y-3'),
        ControlSizeSelector({
          size: size.signal,
          onChange: size.change,
          label: 'Size',
        }),
        Control(Switch, {
          layout: 'horizontal-label-right',
          controller: hoverable,
          label: 'Hoverable',
        }),
        Control(Switch, {
          layout: 'horizontal-label-right',
          controller: fullWidth,
          label: 'Full Width',
        }),
        Control(Switch, {
          layout: 'horizontal-label-right',
          controller: stickyHeader,
          label: 'Sticky Header',
        }),
        Control(Switch, {
          layout: 'horizontal-label-right',
          controller: withStripedRows,
          label: 'With Striped Rows',
        }),
        Control(Switch, {
          layout: 'horizontal-label-right',
          controller: withTableBorder,
          label: 'With Table Border',
        }),
        Control(Switch, {
          layout: 'horizontal-label-right',
          controller: withColumnBorders,
          label: 'With Column Borders',
        }),
        Control(Switch, {
          layout: 'horizontal-label-right',
          controller: withRowBorders,
          label: 'With Row Borders',
        }),
        Control(
          opts =>
            SegmentedInput({
              ...opts,
              size: 'sm',
              options: {
                none: 'None',
                xs: 'XS',
                sm: 'SM',
                md: 'MD',
                lg: 'LG',
                xl: 'XL',
              },
            }),
          {
            controller: borderRadius,
            label: 'Border Radius',
          }
        )
      )
    )
  )
}
