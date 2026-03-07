import { NineSliceScrollView } from '@tempots/beatui'
import { html, attr, style, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NineSliceScrollView',
  category: 'Layout',
  component: 'NineSliceScrollView',
  description:
    'A scrollable container divided into nine regions: a scrollable body with fixed header, footer, and sidebars that stay in place while the body scrolls in both axes.',
  icon: 'lucide:layout-grid',
  order: 6,
}

const COLS = 20
const ROWS = 40
const COL_WIDTH = 120
const ROW_HEIGHT = 32
const HEADER_HEIGHT = 36
const SIDEBAR_WIDTH = 80

function makeGrid() {
  const cells = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cells.push(
        html.div(
          attr.class('absolute text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center border-r border-b border-gray-200 dark:border-gray-700'),
          style.left(`${col * COL_WIDTH}px`),
          style.top(`${row * ROW_HEIGHT}px`),
          style.width(`${COL_WIDTH}px`),
          style.height(`${ROW_HEIGHT}px`),
          `R${row + 1}C${col + 1}`
        )
      )
    }
  }
  return html.div(
    attr.class('relative'),
    style.width(`${COLS * COL_WIDTH}px`),
    style.height(`${ROWS * ROW_HEIGHT}px`),
    ...cells
  )
}

function makeColumnHeaders() {
  const headers = []
  for (let col = 0; col < COLS; col++) {
    headers.push(
      html.div(
        attr.class('absolute flex items-center justify-center text-xs font-semibold bg-gray-100 dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'),
        style.left(`${col * COL_WIDTH}px`),
        style.top('0'),
        style.width(`${COL_WIDTH}px`),
        style.height(`${HEADER_HEIGHT}px`),
        `Column ${col + 1}`
      )
    )
  }
  return html.div(
    attr.class('relative'),
    style.width(`${COLS * COL_WIDTH}px`),
    style.height(`${HEADER_HEIGHT}px`),
    ...headers
  )
}

function makeRowLabels() {
  const labels = []
  for (let row = 0; row < ROWS; row++) {
    labels.push(
      html.div(
        attr.class('absolute flex items-center justify-center text-xs font-semibold bg-gray-100 dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'),
        style.left('0'),
        style.top(`${row * ROW_HEIGHT}px`),
        style.width(`${SIDEBAR_WIDTH}px`),
        style.height(`${ROW_HEIGHT}px`),
        `Row ${row + 1}`
      )
    )
  }
  return html.div(
    attr.class('relative'),
    style.width(`${SIDEBAR_WIDTH}px`),
    style.height(`${ROWS * ROW_HEIGHT}px`),
    ...labels
  )
}

export default function NineSliceScrollViewPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NineSliceScrollView', _signals => {
      return html.div(
        attr.class('w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
        style.height('320px'),
        NineSliceScrollView({
          contentWidth: prop(BigInt(COLS * COL_WIDTH)),
          contentHeight: prop(BigInt(ROWS * ROW_HEIGHT)),
          headerHeight: HEADER_HEIGHT,
          sidebarStartWidth: SIDEBAR_WIDTH,
          header: makeColumnHeaders(),
          sidebarStart: makeRowLabels(),
          topStart: html.div(
            attr.class('w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 border-r border-b border-gray-300 dark:border-gray-600'),
            '#'
          ),
          body: makeGrid(),
        })
      )
    }),
    sections: [
      Section(
        'Spreadsheet Layout',
        () => {
          return html.div(
            attr.class('w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
            style.height('300px'),
            NineSliceScrollView({
              contentWidth: prop(BigInt(COLS * COL_WIDTH)),
              contentHeight: prop(BigInt(ROWS * ROW_HEIGHT)),
              headerHeight: HEADER_HEIGHT,
              sidebarStartWidth: SIDEBAR_WIDTH,
              header: makeColumnHeaders(),
              sidebarStart: makeRowLabels(),
              topStart: html.div(
                attr.class('w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 border-r border-b border-gray-300 dark:border-gray-600'),
                '#'
              ),
              body: makeGrid(),
            })
          )
        },
        'Classic spreadsheet-style layout with frozen row labels and column headers. The body scrolls while periphery regions remain fixed.'
      ),
      Section(
        'Full Nine-Slice',
        () => {
          return html.div(
            attr.class('w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
            style.height('350px'),
            NineSliceScrollView({
              contentWidth: prop(BigInt(COLS * COL_WIDTH)),
              contentHeight: prop(BigInt(ROWS * ROW_HEIGHT)),
              headerHeight: HEADER_HEIGHT,
              footerHeight: 32,
              sidebarStartWidth: SIDEBAR_WIDTH,
              sidebarEndWidth: 60,
              header: makeColumnHeaders(),
              footer: html.div(
                attr.class('relative flex items-center bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'),
                style.width(`${COLS * COL_WIDTH}px`),
                style.height('32px'),
                html.div(
                  attr.class('px-3 text-xs text-gray-500 dark:text-gray-400'),
                  `${ROWS} rows x ${COLS} columns`
                )
              ),
              sidebarStart: makeRowLabels(),
              sidebarEnd: html.div(
                attr.class('relative'),
                style.width('60px'),
                style.height(`${ROWS * ROW_HEIGHT}px`),
                ...Array.from({ length: ROWS }, (_, row) =>
                  html.div(
                    attr.class('absolute flex items-center justify-center text-xs bg-gray-50 dark:bg-gray-850 border-l border-b border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'),
                    style.left('0'),
                    style.top(`${row * ROW_HEIGHT}px`),
                    style.width('60px'),
                    style.height(`${ROW_HEIGHT}px`),
                    `#${row + 1}`
                  )
                )
              ),
              topStart: html.div(
                attr.class('w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 border-r border-b border-gray-300 dark:border-gray-600'),
                '#'
              ),
              topEnd: html.div(
                attr.class('w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 border-l border-b border-gray-300 dark:border-gray-600'),
                'ID'
              ),
              bottomStart: html.div(
                attr.class('w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-r border-t border-gray-300 dark:border-gray-600'),
                style.height('32px'),
                'Sum'
              ),
              bottomEnd: html.div(
                attr.class('w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-l border-t border-gray-300 dark:border-gray-600'),
                style.height('32px'),
                '--'
              ),
              body: makeGrid(),
            })
          )
        },
        'All nine regions populated: header, footer, both sidebars, all four corners, and the scrollable body. Supports wheel, drag (with momentum), keyboard (arrow keys, Page Up/Down, Home/End), and scrollbar interaction.'
      ),
      Section(
        'Body Only',
        () => {
          return html.div(
            attr.class('w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
            style.height('250px'),
            NineSliceScrollView({
              contentWidth: prop(BigInt(3000)),
              contentHeight: prop(BigInt(2000)),
              body: html.div(
                attr.class('relative w-full h-full'),
                style.width('3000px'),
                style.height('2000px'),
                html.div(
                  attr.class('absolute inset-0 p-8 text-gray-500 dark:text-gray-400 text-sm'),
                  'A very wide and tall content area that scrolls in both directions. Content dimensions must be provided explicitly.'
                ),
                ...Array.from({ length: 20 }, (_, i) =>
                  html.div(
                    attr.class('absolute w-32 h-8 rounded text-xs flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'),
                    style.left(`${(i % 5) * 600 + 20}px`),
                    style.top(`${Math.floor(i / 5) * 480 + 20}px`),
                    `Item ${i + 1}`
                  )
                )
              ),
            })
          )
        },
        'Minimal usage with just the scrollable body. Content width and height must be provided in pixels as bigint values.'
      ),
    ],
  })
}
