import { SortableList } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'SortableList',
  category: 'Inputs',
  component: 'SortableList',
  description:
    'A drag-and-drop reorderable list. Each item receives a drag handle for the user to grab.',
  icon: 'lucide:grip-vertical',
  order: 23,
}

export default function SortableListPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const items = prop(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'])
      return html.div(
        attr.class('flex flex-col gap-4 max-w-sm'),
        SortableList({
          items,
          onChange: v => items.set(v),
          renderItem: (item, handle) =>
            html.div(
              attr.class('flex items-center gap-2'),
              handle,
              html.span(item)
            ),
          keyOf: item => item,
        }),
        html.p(
          attr.class('text-sm text-gray-500 font-mono'),
          items.map(list => `Order: ${list.join(', ')}`)
        )
      )
    })(),
    sections: [
      Section(
        'Basic',
        () => {
          const items = prop(['Red', 'Green', 'Blue', 'Yellow'])
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            SortableList({
              items,
              onChange: v => items.set(v),
              renderItem: (item, handle) =>
                html.div(
                  attr.class('flex items-center gap-2'),
                  handle,
                  html.span(item)
                ),
              keyOf: item => item,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              items.map(list => list.join(' \u2192 '))
            )
          )
        },
        'Drag items by the grip handle to reorder. You can also use Alt+ArrowUp / Alt+ArrowDown for keyboard reordering.'
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-col gap-8 max-w-sm'),
            ...(['bordered', 'card', 'plain'] as const).map(variant => {
              const items = prop(['Item 1', 'Item 2', 'Item 3'])
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  variant
                ),
                SortableList({
                  items,
                  onChange: v => items.set(v),
                  renderItem: (item, handle) =>
                    html.div(
                      attr.class('flex items-center gap-2'),
                      handle,
                      item
                    ),
                  keyOf: item => item,
                  variant,
                })
              )
            })
          ),
        'The `variant` prop controls item appearance: `bordered` (default) shows a border, `card` adds a shadow with no visible border, and `plain` renders items with no background or border.'
      ),
      Section(
        'Gap',
        () =>
          html.div(
            attr.class('flex flex-col gap-8 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg'] as const).map(gap => {
              const items = prop(['A', 'B', 'C'])
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  `gap="${gap}"`
                ),
                SortableList({
                  items,
                  onChange: v => items.set(v),
                  renderItem: (item, handle) =>
                    html.div(
                      attr.class('flex items-center gap-2'),
                      handle,
                      item
                    ),
                  keyOf: item => item,
                  gap,
                })
              )
            })
          ),
        'The `gap` prop controls spacing between items using the standard size scale (`xs` through `xl`).'
      ),
      Section(
        'Handle Icon',
        () => {
          const items = prop(['Drag me', 'With arrows', 'Custom icon'])
          return html.div(
            attr.class('flex flex-col gap-6 max-w-sm'),
            html.div(
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-1'),
                'lucide:move (default is lucide:grip-vertical)'
              ),
              SortableList({
                items,
                onChange: v => items.set(v),
                renderItem: (item, handle) =>
                  html.div(
                    attr.class('flex items-center gap-2'),
                    handle,
                    item
                  ),
                keyOf: item => item,
                handleIcon: 'lucide:move',
              })
            ),
            html.div(
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-1'),
                'lucide:menu'
              ),
              SortableList({
                items: prop(['Hamburger', 'Menu', 'Style']),
                onChange: () => {},
                renderItem: (item, handle) =>
                  html.div(
                    attr.class('flex items-center gap-2'),
                    handle,
                    item
                  ),
                keyOf: item => item,
                handleIcon: 'lucide:menu',
              })
            )
          )
        },
        'The `handleIcon` prop accepts any Iconify identifier to replace the default grip icon.'
      ),
      Section(
        'Rich Items',
        () => {
          const tasks = prop([
            { id: '1', title: 'Design mockup', priority: 'high' },
            { id: '2', title: 'Write tests', priority: 'medium' },
            { id: '3', title: 'Deploy app', priority: 'low' },
          ])
          return html.div(
            attr.class('max-w-sm'),
            SortableList({
              items: tasks,
              onChange: v => tasks.set(v),
              renderItem: (task, handle) =>
                html.div(
                  attr.class('flex items-center gap-3 flex-1'),
                  handle,
                  html.div(
                    attr.class('flex flex-col'),
                    html.span(attr.class('font-medium'), task.title),
                    html.span(
                      attr.class('text-xs text-gray-500'),
                      task.priority
                    )
                  )
                ),
              keyOf: task => task.id,
              variant: 'card',
            })
          )
        },
        'Use `renderItem` to display complex content. The `handle` TNode is placed wherever you want the grip. Shown here with the `card` variant.'
      ),
      Section(
        'Custom Class',
        () => {
          const items = prop(['Styled', 'With', 'Custom Class'])
          return SortableList({
            items,
            onChange: v => items.set(v),
            renderItem: (item, handle) =>
              html.div(attr.class('flex items-center gap-2'), handle, item),
            keyOf: item => item,
            class: 'max-w-xs rounded-lg p-2 bg-gray-50 dark:bg-gray-900',
          })
        },
        'The `class` prop adds custom CSS classes to the list container for layout or styling overrides.'
      ),
      Section(
        'Disabled',
        () => {
          const items = prop(['A', 'B', 'C'])
          return SortableList({
            items,
            onChange: v => items.set(v),
            renderItem: (item, handle) =>
              html.div(attr.class('flex items-center gap-2'), handle, item),
            keyOf: item => item,
            disabled: true,
          })
        },
        'Disabled state prevents dragging and keyboard reordering.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-6 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const items = prop(['Item 1', 'Item 2'])
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                SortableList({
                  items,
                  onChange: v => items.set(v),
                  renderItem: (item, handle) =>
                    html.div(
                      attr.class('flex items-center gap-2'),
                      handle,
                      item
                    ),
                  keyOf: item => item,
                  size,
                })
              )
            })
          ),
        'Size controls item padding and font size.'
      ),
    ],
  })
}
