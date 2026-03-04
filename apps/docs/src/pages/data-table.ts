import { html, attr, Fragment, prop } from '@tempots/dom'
import {
  Card,
  DataTable,
  useForm,
  Control,
  Switch,
  type ControlSize,
  NumberInput,
  DataTablePaginationOptions,
  Badge,
  RatingInput,
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
    price: 1999,
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
    price: 3299,
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
    price: 7759,
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
      rowsPerPage: z.number(),
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
      rowsPerPage: 10,
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
  const rowsPerPage = controller.field('rowsPerPage')

  const selectionInfo = prop('')

  const data = prop(products)

  return Fragment(
    attr.class('m-4'),
    html.h2(attr.class('text-lg font-semibold mb-2'), 'DataTable Component'),
    html.div(
      attr.class('flex flex-col space-y-4'),
      // Selection info
      html.div(
        attr.class('text-sm text-gray-500 dark:text-gray-400 h-5'),
        selectionInfo
      ),
      // DataTable
      DataTable<Product>({
        data,
        columns: [
          {
            id: 'name',
            header: 'Product',
            cell: row => row.$.name,
            sortable: true,
            filter: { type: 'panel' },
            minWidth: '150px',
          },
          {
            id: 'sku',
            header: 'SKU',
            cell: row => html.code(attr.class('text-xs'), row.$.sku),
            sortable: true,
            filter: true,
            hideable: true,
            width: '140px',
          },
          {
            id: 'category',
            header: 'Category',
            cell: row =>
              Badge({ size: 'sm', variant: 'outline' }, row.$.category),
            sortable: true,
            align: 'center',
            filter: {
              type: 'tags',
              options: [
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Accessories', label: 'Accessories' },
                { value: 'Audio', label: 'Audio' },
                { value: 'Storage', label: 'Storage' },
                { value: 'Office', label: 'Office' },
              ],
            },
          },
          {
            id: 'price',
            header: 'Price',
            cell: row => row.map(r => `$${r.price.toLocaleString()}`),
            value: row => row.price,
            sortable: true,
            filter: 'number',
            align: 'right',
            width: '100px',
            hideable: true,
            footer: rows =>
              rows.map(rs => {
                const sum = rs.reduce((acc, r) => acc + r.price, 0)
                return `$${sum.toLocaleString()}`
              }),
          },
          {
            id: 'stock',
            header: 'Stock',
            cell: row => row.map(r => r.stock.toLocaleString()),
            value: row => row.stock,
            sortable: true,
            filter: 'number',
            align: 'right',
            maxWidth: '100px',
            hideable: true,
            footer: rows =>
              rows.map(rs => {
                const sum = rs.reduce((acc, r) => acc + r.stock, 0)
                return sum.toLocaleString()
              }),
          },
          {
            id: 'rating',
            header: 'Rating',
            cell: row =>
              html.div(
                attr.class('flex items-center justify-center'),
                RatingInput({ value: row.$.rating })
              ),
            value: row => row.rating,
            sortable: true,
            filter: 'number',
            align: 'center',
            hideable: true,
            footer: rows => {
              const avg = rows.map(
                rs => rs.reduce((acc, r) => acc + r.rating, 0) / rs.length
              )
              return html.div(
                attr.class('flex items-center justify-center'),
                RatingInput({ value: avg })
              )
            },
          },
        ],
        rowId: row => row.id,
        sortable: true,
        multiSort: true,
        filterable: true,
        selectable: selectable.signal,
        selectOnRowClick: selectOnRowClick.signal,
        groupBy: groupByCategory.signal.map((v): string | undefined =>
          v ? 'category' : undefined
        ),
        showFooter: true,
        reorderableColumns: true,
        pagination: rowsPerPage.signal.map(
          v =>
            ({
              pageSize: v,
              showFirstLast: true,
            }) as DataTablePaginationOptions | boolean
        ),
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
          attr.class('flex flex-col min-w-48 gap-2'),
          html.h3(attr.class('text-sm font-semibold'), 'Appearance'),
          ControlSizeSelector({
            size: size.signal,
            onChange: size.change,
            label: 'Size',
          }),
          NumberInput({
            min: 1,
            max: 100,
            step: 1,
            value: rowsPerPage.signal,
            onChange: rowsPerPage.change,
          })
        ),
        html.div(
          attr.class('flex flex-col min-w-48'),
          html.h3(attr.class('text-sm font-semibold'), '-'),
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
          attr.class('flex flex-col min-w-48'),
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
          attr.class('flex flex-col min-w-48'),
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
      )
    )
  )
}
