import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { ControlSize } from '../theme'

export interface TableOptions {
  /** Size of the table (affects padding and spacing) */
  size?: Value<ControlSize>
  /** Enable hover effect on rows */
  hoverable?: Value<boolean>
  /** Make the header sticky when scrolling */
  stickyHeader?: Value<boolean>
  /** Table takes full width of container */
  fullWidth?: Value<boolean>
  /** Stripe rows for better readability */
  withStripedRows?: Value<boolean>
  /** Show outer table border */
  withTableBorder?: Value<boolean>
  /** Show vertical borders between columns */
  withColumnBorders?: Value<boolean>
  /** Show horizontal borders between rows */
  withRowBorders?: Value<boolean>
  /** Custom border radius (CSS value) */
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
 * Table component with styling variants
 * Focused on presentation, not data management
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
