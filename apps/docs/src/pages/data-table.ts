import { html, attr, Fragment, prop } from '@tempots/dom'
import {
  Card,
  DataTable,
  useForm,
  Control,
  Switch,
  type ControlSize,
} from '@tempots/beatui'
import z from 'zod'
import { ControlSizeSelector } from '../elements/control-size-selector'

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  rating: number
}

const products: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    sku: 'ELEC-LP-001',
    category: 'Electronics',
    price: 999,
    stock: 15,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    sku: 'ACC-WM-002',
    category: 'Accessories',
    price: 29,
    stock: 150,
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    sku: 'ACC-MK-003',
    category: 'Accessories',
    price: 79,
    stock: 85,
    rating: 4.7,
  },
  {
    id: '4',
    name: '4K Monitor',
    sku: 'ELEC-4M-004',
    category: 'Electronics',
    price: 299,
    stock: 42,
    rating: 4.3,
  },
  {
    id: '5',
    name: 'Noise-Cancelling Headphones',
    sku: 'AUD-NC-005',
    category: 'Audio',
    price: 149,
    stock: 25,
    rating: 4.8,
  },
  {
    id: '6',
    name: 'USB-C Hub',
    sku: 'ACC-UH-006',
    category: 'Accessories',
    price: 49,
    stock: 60,
    rating: 4.1,
  },
  {
    id: '7',
    name: 'Webcam HD',
    sku: 'ELEC-WC-007',
    category: 'Electronics',
    price: 89,
    stock: 30,
    rating: 3.9,
  },
  {
    id: '8',
    name: 'Bluetooth Speaker',
    sku: 'AUD-BS-008',
    category: 'Audio',
    price: 59,
    stock: 40,
    rating: 4.4,
  },
  {
    id: '9',
    name: 'External SSD',
    sku: 'STOR-ES-009',
    category: 'Storage',
    price: 119,
    stock: 35,
    rating: 4.6,
  },
  {
    id: '10',
    name: 'USB Flash Drive',
    sku: 'STOR-FD-010',
    category: 'Storage',
    price: 15,
    stock: 200,
    rating: 4.0,
  },
  {
    id: '11',
    name: 'HDMI Cable',
    sku: 'ACC-HC-011',
    category: 'Accessories',
    price: 14,
    stock: 300,
    rating: 4.1,
  },
  {
    id: '12',
    name: 'Desk Lamp',
    sku: 'OFF-DL-012',
    category: 'Office',
    price: 45,
    stock: 55,
    rating: 4.3,
  },
  {
    id: '13',
    name: 'Ergonomic Chair',
    sku: 'OFF-EC-013',
    category: 'Office',
    price: 349,
    stock: 12,
    rating: 4.7,
  },
  {
    id: '14',
    name: 'Standing Desk',
    sku: 'OFF-SD-014',
    category: 'Office',
    price: 499,
    stock: 8,
    rating: 4.5,
  },
  {
    id: '15',
    name: 'Tablet',
    sku: 'ELEC-TB-015',
    category: 'Electronics',
    price: 449,
    stock: 20,
    rating: 4.4,
  },
]

export default function DataTablePage() {
  const { controller } = useForm({
    schema: z.object({
      size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
      hoverable: z.boolean(),
      selectable: z.boolean(),
      selectOnRowClick: z.boolean(),
      groupByCategory: z.boolean(),
      fullWidth: z.boolean(),
      withStripedRows: z.boolean(),
      withTableBorder: z.boolean(),
      withColumnBorders: z.boolean(),
      withRowBorders: z.boolean(),
    }),
    initialValue: {
      size: 'md' as ControlSize,
      hoverable: false,
      selectable: true,
      selectOnRowClick: true,
      groupByCategory: false,
      fullWidth: true,
      withStripedRows: false,
      withTableBorder: true,
      withColumnBorders: false,
      withRowBorders: true,
    },
  })

  const size = controller.field('size')
  const hoverable = controller.field('hoverable')
  const selectable = controller.field('selectable')
  const selectOnRowClick = controller.field('selectOnRowClick')
  const groupByCategory = controller.field('groupByCategory')
  const fullWidth = controller.field('fullWidth')
  const withStripedRows = controller.field('withStripedRows')
  const withTableBorder = controller.field('withTableBorder')
  const withColumnBorders = controller.field('withColumnBorders')
  const withRowBorders = controller.field('withRowBorders')

  const selectionInfo = prop('')

  return Fragment(
    attr.class('m-4'),
    html.h2(attr.class('text-lg font-semibold mb-2'), 'DataTable Component'),
    html.p(
      attr.class('text-sm text-gray-600 dark:text-gray-400 mb-4'),
      'Full-featured data table with sorting, filtering (text, select, and advanced panel), ',
      'click-to-select rows, pagination, toolbar with localized filter chips, and bulk actions. ',
      'Try clicking rows to select, use the filter icons in headers, and apply filters to see ',
      'localized descriptions in the toolbar.'
    ),

    html.div(
      attr.class('flex flex-col space-y-4'),
      // Selection info
      html.div(
        attr.class('text-sm text-gray-500 dark:text-gray-400 h-5'),
        selectionInfo
      ),
      // DataTable
      DataTable<Product>({
        data: prop(products),
        columns: [
          {
            id: 'name',
            header: 'Product',
            cell: row => row.name,
            sortable: true,
            filterable: 'panel',
          },
          {
            id: 'sku',
            header: 'SKU',
            cell: row => html.code(attr.class('text-xs'), row.sku),
            sortable: true,
            filterable: true,
            hideable: true,
          },
          {
            id: 'category',
            header: 'Category',
            cell: row => row.category,
            sortable: true,
            filterable: 'tags',
            filterOptions: [
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Accessories', label: 'Accessories' },
              { value: 'Audio', label: 'Audio' },
              { value: 'Storage', label: 'Storage' },
              { value: 'Office', label: 'Office' },
            ],
          },
          {
            id: 'price',
            header: 'Price',
            cell: row => `$${row.price}`,
            accessor: row => row.price,
            sortable: true,
            filterable: 'panel',
            columnType: 'number',
            align: 'right',
            hideable: true,
            aggregation: { fn: 'sum', format: v => `$${v.toFixed(0)}` },
          },
          {
            id: 'stock',
            header: 'Stock',
            cell: row => String(row.stock),
            accessor: row => row.stock,
            sortable: true,
            filterable: 'panel',
            columnType: 'number',
            align: 'right',
            hideable: true,
            aggregation: { fn: 'sum' },
          },
          {
            id: 'rating',
            header: 'Rating',
            cell: row => `${row.rating} / 5`,
            accessor: row => row.rating,
            sortable: true,
            filterable: 'panel',
            columnType: 'number',
            align: 'center',
            hideable: true,
            aggregation: { fn: 'avg', format: v => `${v.toFixed(1)} / 5` },
          },
        ],
        rowId: row => row.id,
        sortable: true,
        multiSort: true,
        filterable: true,
        selectable: selectable.signal,
        selectOnRowClick: selectOnRowClick.signal,
        groupBy: groupByCategory.signal.map((v): string | undefined => v ? 'category' : undefined),
        showAggregation: true,
        reorderableColumns: true,
        pagination: { pageSize: 5, showFirstLast: true },
        toolbar: {
          bulkActions: [
            {
              label: 'Log Selected',
              icon: 'lucide:terminal',
              onClick: sel => {
                selectionInfo.set(`Bulk action on IDs: ${[...sel].join(', ')}`)
              },
            },
          ],
        },
        size: size.signal,
        hoverable: hoverable.signal,
        fullWidth: fullWidth.signal,
        withStripedRows: withStripedRows.signal,
        withTableBorder: withTableBorder.signal,
        withColumnBorders: withColumnBorders.signal,
        withRowBorders: withRowBorders.signal,
        onSelectionChange: sel => {
          selectionInfo.set(
            sel.size > 0 ? `Selected IDs: ${[...sel].join(', ')}` : ''
          )
        },
        columnVisibility: {},
        emptyContent: 'No products match your filters',
      }),

      // Appearance controls
      Card(
        {},
        attr.class('flex flex-row flex-wrap gap-6'),
        html.div(
          attr.class('flex flex-col space-y-3 min-w-48'),
          html.h3(attr.class('text-sm font-semibold'), 'Appearance'),
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
            controller: withStripedRows,
            label: 'Striped Rows',
          })
        ),
        html.div(
          attr.class('flex flex-col space-y-3 min-w-48'),
          html.h3(attr.class('text-sm font-semibold'), 'Selection & Grouping'),
          Control(Switch, {
            layout: 'horizontal-label-right',
            controller: selectable,
            label: 'Selectable',
          }),
          Control(Switch, {
            layout: 'horizontal-label-right',
            controller: selectOnRowClick,
            label: 'Select on Row Click',
          }),
          Control(Switch, {
            layout: 'horizontal-label-right',
            controller: groupByCategory,
            label: 'Group by Category',
          })
        ),
        html.div(
          attr.class('flex flex-col space-y-3 min-w-48'),
          html.h3(attr.class('text-sm font-semibold'), 'Borders'),
          Control(Switch, {
            layout: 'horizontal-label-right',
            controller: withTableBorder,
            label: 'Table Border',
          }),
          Control(Switch, {
            layout: 'horizontal-label-right',
            controller: withColumnBorders,
            label: 'Column Borders',
          }),
          Control(Switch, {
            layout: 'horizontal-label-right',
            controller: withRowBorders,
            label: 'Row Borders',
          })
        )
      ),

      // Feature descriptions
      Card(
        {},
        html.h3(attr.class('text-sm font-semibold mb-2'), 'Filter Types'),
        html.ul(
          attr.class('text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-4'),
          html.li(
            html.strong('Product'),
            ' \u2014 Panel filter (text): contains, starts with, equals, etc.'
          ),
          html.li(
            html.strong('SKU'),
            ' \u2014 Basic text input filter (shown as icon trigger in header).'
          ),
          html.li(
            html.strong('Category'),
            ' \u2014 Multi-select tags filter (shown as icon trigger in header).'
          ),
          html.li(
            html.strong('Price / Stock / Rating'),
            ' \u2014 Panel filter (number): =, >, between, etc.'
          ),
          html.li(
            html.strong('Tooltips'),
            ' \u2014 Hover any active filter icon to see the applied filter description.'
          )
        )
      )
    )
  )
}
