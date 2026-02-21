import {
  html,
  attr,
  prop,
  computedOf,
  Signal,
  signal,
  Repeat,
  style,
} from '@tempots/dom'
import {
  AnchorMode,
  Group,
  InputWrapper,
  NativeSelect,
  NineSliceScrollView,
  NumberInput,
  Option,
  ScrollablePanel,
  SelectOption,
  Stack,
} from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

const colorFromPos = (row: number, column: number) => {
  const hue = (Math.sin(row * 0.15) * 0.5 + 0.5) * 360
  const lightness = (Math.sin(column * 0.25) * 0.2 + 0.7) * 100
  return `hsl(${hue}, 80%, ${lightness}%)`
}

const createGrid = ({
  rows,
  columns,
  cellWidth,
  cellHeight,
  startRows,
  startColumn,
}: {
  rows: Signal<number>
  columns: Signal<number>
  cellWidth: Signal<number>
  cellHeight: Signal<number>
  startRows: Signal<number>
  startColumn: Signal<number>
}) => {
  return Repeat(rows, ({ index: row }) => {
    return html.div(
      attr.class('flex flex-row flex-nowrap text-xs'),
      style.width(
        computedOf(
          columns,
          cellWidth
        )((columns, cellWidth) => {
          return `${columns * cellWidth}px`
        })
      ),
      Repeat(columns, ({ index: column }) => {
        return html.div(
          attr.class('flex flex-row items-center justify-center'),
          style.width(cellWidth.map(w => `${w}px`)),
          style.height(cellHeight.map(h => `${h}px`)),
          style.backgroundColor(
            computedOf(
              row,
              column,
              startRows,
              startColumn
            )((row, column, startRows, startColumn) => {
              return colorFromPos(row + startRows, column + startColumn)
            })
          ),
          computedOf(
            row,
            column,
            startRows,
            startColumn
          )((row, column, startRows, startColumn) => {
            return `${row + startRows + 1}:${column + startColumn + 1}`
          })
        )
      })
    )
  })
}

export default function NineSliceScrollViewPage() {
  const rows = prop(30)
  const columns = prop(16)
  const headerRows = prop(3)
  const footerRows = prop(2)
  const startColumns = prop(3)
  const endColumns = prop(2)
  const cellWidth = prop(48)
  const cellHeight = prop(24)

  const contentWidth = computedOf(
    columns,
    startColumns,
    endColumns,
    cellWidth
  )((columns, startColumns, endColumns, cellWidth) => {
    return BigInt(columns - startColumns - endColumns) * BigInt(cellWidth)
  })
  const contentHeight = computedOf(
    rows,
    headerRows,
    footerRows,
    cellHeight
  )((rows, headerRows, footerRows, cellHeight) => {
    return BigInt(rows - headerRows - footerRows) * BigInt(cellHeight)
  })
  const headerHeight = computedOf(
    headerRows,
    cellHeight
  )((headerRows, cellHeight) => {
    return headerRows * cellHeight
  })
  const footerHeight = computedOf(
    footerRows,
    cellHeight
  )((footerRows, cellHeight) => {
    return footerRows * cellHeight
  })
  const sidebarStartWidth = computedOf(
    startColumns,
    cellWidth
  )((startColumns, cellWidth) => {
    return startColumns * cellWidth
  })
  const sidebarEndWidth = computedOf(
    endColumns,
    cellWidth
  )((endColumns, cellWidth) => {
    return endColumns * cellWidth
  })

  const bodyColumns = computedOf(
    columns,
    startColumns,
    endColumns
  )((columns, startColumns, endColumns) => {
    return columns - startColumns - endColumns
  })
  const bodyRows = computedOf(
    rows,
    headerRows,
    footerRows
  )((rows, headerRows, footerRows) => {
    return rows - headerRows - footerRows
  })

  const topStart = createGrid({
    rows: headerRows,
    columns: startColumns,
    cellWidth,
    cellHeight,
    startRows: signal(0),
    startColumn: signal(0),
  })
  const header = createGrid({
    rows: headerRows,
    columns: bodyColumns,
    cellWidth,
    cellHeight,
    startRows: signal(0),
    startColumn: startColumns,
  })
  const topEnd = createGrid({
    rows: headerRows,
    columns: endColumns,
    cellWidth,
    cellHeight,
    startRows: signal(0),
    startColumn: computedOf(
      columns,
      endColumns
    )((columns, endColumns) => {
      return columns - endColumns
    }),
  })
  const sidebarStart = createGrid({
    rows: bodyRows,
    columns: startColumns,
    cellWidth,
    cellHeight,
    startRows: headerRows,
    startColumn: signal(0),
  })
  const body = createGrid({
    rows: bodyRows,
    columns: bodyColumns,
    cellWidth,
    cellHeight,
    startRows: headerRows,
    startColumn: startColumns,
  })
  const sidebarEnd = createGrid({
    rows: bodyRows,
    columns: endColumns,
    cellWidth,
    cellHeight,
    startRows: headerRows,
    startColumn: computedOf(
      columns,
      endColumns
    )((columns, endColumns) => {
      return columns - endColumns
    }),
  })
  const bottomStart = createGrid({
    rows: footerRows,
    columns: startColumns,
    cellWidth,
    cellHeight,
    startRows: computedOf(
      rows,
      footerRows
    )((rows, footerRows) => {
      return rows - footerRows
    }),
    startColumn: signal(0),
  })
  const footer = createGrid({
    rows: footerRows,
    columns: bodyColumns,
    cellWidth,
    cellHeight,
    startRows: computedOf(
      rows,
      footerRows
    )((rows, footerRows) => {
      return rows - footerRows
    }),
    startColumn: startColumns,
  })
  const bottomEnd = createGrid({
    rows: footerRows,
    columns: endColumns,
    cellWidth,
    cellHeight,
    startRows: computedOf(
      rows,
      footerRows
    )((rows, footerRows) => {
      return rows - footerRows
    }),
    startColumn: computedOf(
      columns,
      endColumns
    )((columns, endColumns) => {
      return columns - endColumns
    }),
  })
  const anchorMode = prop<AnchorMode>('container-edge')

  return ScrollablePanel({
    header: ControlsHeader(
      Group(
        InputWrapper({
          label: 'Columns',
          content: NumberInput({
            value: columns,
            onChange: v => columns.set(v),
            step: 1,
            min: 1,
          }),
        }),
        InputWrapper({
          label: 'Rows',
          content: NumberInput({
            value: rows,
            onChange: v => rows.set(v),
            step: 1,
            min: 1,
          }),
        }),
        InputWrapper({
          label: 'Start Columns',
          content: NumberInput({
            value: startColumns,
            onChange: v => startColumns.set(v),
            step: 1,
            min: 0,
            max: columns,
          }),
        }),
        InputWrapper({
          label: 'End Columns',
          content: NumberInput({
            value: endColumns,
            onChange: v => endColumns.set(v),
            step: 1,
            min: 0,
            max: columns,
          }),
        }),
        InputWrapper({
          label: 'Header Rows',
          content: NumberInput({
            value: headerRows,
            onChange: v => headerRows.set(v),
            step: 1,
            min: 0,
            max: rows,
          }),
        }),
        InputWrapper({
          label: 'Footer Rows',
          content: NumberInput({
            value: footerRows,
            onChange: v => footerRows.set(v),
            step: 1,
            min: 0,
            max: rows,
          }),
        }),
        InputWrapper({
          label: 'Anchor Mode',
          content: NativeSelect({
            options: [
              Option.value('container-edge', 'Container Edge'),
              Option.value('body-end', 'Body End'),
              Option.value('body-bottom', 'Body Bottom'),
              Option.value('body-end-bottom', 'Body End & Bottom'),
            ] as SelectOption<AnchorMode>[],
            value: anchorMode,
            onChange: v => anchorMode.set(v),
          }),
        })
      )
    ),
    body: Stack(
      attr.class('items-start gap-1 p-4 h-full'),
      NineSliceScrollView({
        anchorMode,
        body,
        contentWidth,
        contentHeight,
        headerHeight,
        footerHeight,
        sidebarStartWidth,
        sidebarEndWidth,
        header,
        footer,
        sidebarStart,
        sidebarEnd,
        topStart,
        bottomStart,
        topEnd,
        bottomEnd,
      })
    ),
  })
}
