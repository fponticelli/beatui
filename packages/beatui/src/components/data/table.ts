import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { ControlSize } from '../theme'

/**
 * Configuration options for the {@link Table} component.
 * Controls visual presentation including size, borders, hover effects, and sticky headers.
 */
export interface TableOptions {
  /** Size of the table affecting cell padding and font size. @default 'md' */
  size?: Value<ControlSize>
  /** Enable background color change on row hover. @default false */
  hoverable?: Value<boolean>
  /** Make the header row sticky when scrolling vertically. @default false */
  stickyHeader?: Value<boolean>
  /** Whether the table takes the full width of its container. @default false */
  fullWidth?: Value<boolean>
  /** Alternate row background colors for improved readability. @default false */
  withStripedRows?: Value<boolean>
  /** Show a border around the entire table container. @default true */
  withTableBorder?: Value<boolean>
  /** Show vertical borders between columns. @default false */
  withColumnBorders?: Value<boolean>
  /** Show horizontal borders between rows. @default true */
  withRowBorders?: Value<boolean>
  /** Border radius of the table container. @default undefined */
  borderRadius?: Value<'none' | 'sm' | 'md' | 'lg' | 'xl'>
}

function generateTableClasses(
  size: ControlSize,
  hoverable: boolean,
  stickyHeader: boolean,
  withStripedRows: boolean,
  withColumnBorders: boolean,
  withRowBorders: boolean
): string {
  const classes = ['bc-table']

  if (size !== 'md') {
    classes.push(`bc-table--size-${size}`)
  }

  if (hoverable) {
    classes.push('bc-table--hoverable')
  }

  if (stickyHeader) {
    classes.push('bc-table--sticky-header')
  }

  if (withStripedRows) {
    classes.push('bc-table--with-striped-rows')
  }

  if (withColumnBorders) {
    classes.push('bc-table--with-column-borders')
  }

  if (withRowBorders) {
    classes.push('bc-table--with-row-borders')
  }

  return classes.join(' ')
}

function generateTableStyles(borderRadius?: string): string | undefined {
  if (borderRadius == null) {
    return undefined
  }
  if (borderRadius === 'none') {
    return '--table-border-radius: 0'
  }
  return `--table-border-radius: var(--radius-${borderRadius})`
}

/**
 * A styled table component focused on presentation with configurable borders,
 * hover effects, sticky headers, and striped rows. Wraps a standard HTML table
 * in a container that handles overflow scrolling and border radius.
 *
 * This component provides styling only — data management and row rendering
 * are handled by the caller using standard `html.thead`, `html.tbody`, `html.tr`,
 * `html.th`, and `html.td` elements.
 *
 * @param options - Visual configuration for the table
 * @param children - Table content (thead, tbody, tfoot elements)
 * @returns A container div wrapping a styled table element
 *
 * @example
 * ```typescript
 * Table(
 *   { hoverable: true, withStripedRows: true, fullWidth: true },
 *   html.thead(
 *     html.tr(html.th('Name'), html.th('Email'), html.th('Role'))
 *   ),
 *   html.tbody(
 *     html.tr(html.td('Alice'), html.td('alice@example.com'), html.td('Admin')),
 *     html.tr(html.td('Bob'), html.td('bob@example.com'), html.td('User'))
 *   )
 * )
 * ```
 */
export function Table(
  {
    size = 'md',
    hoverable = false,
    stickyHeader = false,
    fullWidth = false,
    withStripedRows = false,
    withTableBorder = true,
    withColumnBorders = false,
    withRowBorders = true,
    borderRadius,
  }: TableOptions = {},
  ...children: TNode[]
) {
  const tableClasses = computedOf(
    size,
    hoverable,
    stickyHeader,
    withStripedRows,
    withColumnBorders,
    withRowBorders
  )(
    (
      size,
      hoverable,
      stickyHeader,
      withStripedRows,
      withColumnBorders,
      withRowBorders
    ) =>
      generateTableClasses(
        size ?? 'md',
        hoverable ?? false,
        stickyHeader ?? false,
        withStripedRows ?? false,
        withColumnBorders ?? false,
        withRowBorders ?? true
      )
  )

  const containerClasses = computedOf(
    stickyHeader,
    fullWidth,
    withTableBorder
  )((sticky, full, border) => {
    const classes = ['bc-table-container']
    if (sticky) {
      classes.push('bc-table-container--sticky')
    }
    if (full) {
      classes.push('bc-table-container--full-width')
    }
    if (border) {
      classes.push('bc-table-container--with-table-border')
    }
    return classes.join(' ')
  })

  const containerStyles = computedOf(borderRadius)(br =>
    generateTableStyles(br)
  )

  return html.div(
    attr.class(containerClasses),
    attr.style(containerStyles),
    html.table(attr.class(tableClasses), ...children)
  )
}
