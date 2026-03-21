import { VirtualList } from '@tempots/beatui'
import { html, attr, prop, style, on } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'VirtualList',
  category: 'Tables & Data',
  component: 'VirtualList',
  description:
    'A virtualized list that renders only visible items for high performance with large datasets (10,000+ items).',
  icon: 'lucide:scroll',
  order: 7,
}

interface ListItem {
  id: number
  label: string
  description: string
}

function makeItems(count: number): ListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }))
}

const ITEM_HEIGHT = 56

export default function VirtualListPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const items = prop(makeItems(10000))
      const containerHeight = prop<number | string>(400)

      return html.div(
        attr.class('flex flex-col gap-4'),
        html.div(
          attr.class('flex items-center gap-3 flex-wrap'),
          html.span(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            items.map(list => `${list.length.toLocaleString()} items`)
          )
        ),
        VirtualList({
          items,
          itemHeight: ITEM_HEIGHT,
          containerHeight,
          overscan: 5,
          class: 'border border-gray-200 dark:border-gray-700 rounded-md',
          renderItem: (item, index) =>
            html.div(
              attr.class(
                'flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
              ),
              style.height(`${ITEM_HEIGHT}px`),
              html.div(
                attr.class(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold'
                ),
                String(index + 1)
              ),
              html.div(
                attr.class('min-w-0 flex-1'),
                html.div(
                  attr.class('text-sm font-medium text-gray-900 dark:text-gray-100'),
                  item.label
                ),
                html.div(
                  attr.class('text-xs text-gray-500 dark:text-gray-400 truncate'),
                  item.description
                )
              )
            ),
        })
      )
    })(),
    sections: [
      Section(
        '10,000 Items (Fixed Height)',
        () => {
          const items = prop(makeItems(10000))
          return html.div(
            attr.class('flex flex-col gap-2'),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              '10,000 items rendered virtually. Only ~15 items are in the DOM at any time.'
            ),
            VirtualList({
              items,
              itemHeight: ITEM_HEIGHT,
              containerHeight: 320,
              overscan: 5,
              class: 'border border-gray-200 dark:border-gray-700 rounded-md',
              renderItem: (item, index) =>
                html.div(
                  attr.class(
                    'flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800'
                  ),
                  style.height(`${ITEM_HEIGHT}px`),
                  html.span(
                    attr.class('text-xs text-gray-400 dark:text-gray-500 w-12 tabular-nums'),
                    `#${index + 1}`
                  ),
                  html.span(
                    attr.class('text-sm text-gray-900 dark:text-gray-100'),
                    item.label
                  )
                ),
            })
          )
        },
        'Renders 10,000 items with a fixed item height of 56px. Only visible items are in the DOM.'
      ),
      Section(
        'Variable Item Heights',
        () => {
          interface VarItem {
            id: number
            text: string
            tall: boolean
          }
          const varItems: VarItem[] = Array.from({ length: 500 }, (_, i) => ({
            id: i,
            text: i % 5 === 0 ? `Section header ${Math.floor(i / 5) + 1}` : `Row ${i + 1}: Regular content item`,
            tall: i % 5 === 0,
          }))

          const heightFn = (index: number) => (varItems[index]?.tall ? 64 : 40)

          return html.div(
            attr.class('flex flex-col gap-2'),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              '500 items with variable heights: section headers are 64px, rows are 40px.'
            ),
            VirtualList({
              items: varItems,
              itemHeight: heightFn,
              containerHeight: 320,
              overscan: 5,
              class: 'border border-gray-200 dark:border-gray-700 rounded-md',
              renderItem: (item) =>
                item.tall
                  ? html.div(
                      attr.class(
                        'flex items-center px-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-300'
                      ),
                      style.height('64px'),
                      item.text
                    )
                  : html.div(
                      attr.class(
                        'flex items-center px-4 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400'
                      ),
                      style.height('40px'),
                      item.text
                    ),
            })
          )
        },
        'Supports variable item heights via a height function. Internally uses cumulative heights and binary search for fast visible range calculation.'
      ),
      Section(
        'Reactive Items',
        () => {
          const count = prop(100)
          const items = count.map(n => makeItems(n))

          return html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              attr.class('flex items-center gap-3'),
              html.label(attr.class('text-sm font-medium'), 'Item count:'),
              html.input(
                attr.type('range'),
                attr.min(0),
                attr.max(10000),
                attr.step(100),
                attr.value(count.map(String)),
                attr.class('flex-1'),
                on.input(e => {
                  count.set(Number((e.target as HTMLInputElement).value))
                })
              ),
              html.span(
                attr.class('text-sm text-gray-600 dark:text-gray-400 w-20 text-right tabular-nums'),
                count.map(n => `${n.toLocaleString()} items`)
              )
            ),
            VirtualList({
              items,
              itemHeight: 44,
              containerHeight: 280,
              overscan: 3,
              class: 'border border-gray-200 dark:border-gray-700 rounded-md',
              renderItem: (item, index) =>
                html.div(
                  attr.class(
                    'flex items-center px-4 border-b border-gray-100 dark:border-gray-800 text-sm'
                  ),
                  style.height('44px'),
                  html.span(attr.class('text-gray-400 w-12 tabular-nums'), `${index + 1}.`),
                  html.span(attr.class('text-gray-800 dark:text-gray-200'), item.label)
                ),
            })
          )
        },
        'The items prop is reactive. Drag the slider to change the item count and the virtual list updates automatically.'
      ),
      Section(
        'Custom Overscan',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.p(
              attr.class('text-sm text-gray-500'),
              'overscan: 15 — renders 15 extra items above and below the viewport to reduce blank flicker during fast scrolling.'
            ),
            VirtualList({
              items: makeItems(1000),
              itemHeight: 40,
              containerHeight: 240,
              overscan: 15,
              class: 'border border-gray-200 dark:border-gray-700 rounded-md',
              renderItem: (item, index) =>
                html.div(
                  attr.class(
                    'flex items-center px-4 border-b border-gray-100 dark:border-gray-800 text-sm'
                  ),
                  style.height('40px'),
                  html.span(attr.class('text-gray-400 w-12 tabular-nums'), `${index + 1}.`),
                  html.span(attr.class('text-gray-800 dark:text-gray-200'), item.label)
                ),
            })
          ),
        'Overscan is set at mount time (not reactive). Higher values reduce blank flicker during fast scrolling at the cost of more DOM nodes.'
      ),
    ],
  })
}
