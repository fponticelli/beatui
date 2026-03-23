import { TransferList } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TransferList',
  category: 'Inputs',
  component: 'TransferList',
  description:
    'A dual-list component for transferring items between "available" and "selected" pools. Generic in T with custom rendering.',
  icon: 'lucide:arrow-left-right',
  order: 24,
}

export default function TransferListPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const available = prop([
        'Apple',
        'Banana',
        'Cherry',
        'Date',
        'Elderberry',
        'Fig',
        'Grape',
      ])
      const selected = prop<string[]>([])
      return html.div(
        attr.class('flex flex-col gap-4'),
        TransferList({
          available,
          selected,
          onChange: v => selected.set(v),
          renderItem: item => html.span(item),
          keyOf: item => item,
          searchable: true,
        }),
        html.p(
          attr.class('text-sm text-gray-500 font-mono'),
          selected.map(s => `Selected: ${s.length ? s.join(', ') : '(none)'}`)
        )
      )
    })(),
    sections: [
      Section(
        'Basic',
        () => {
          const available = prop(['React', 'Vue', 'Angular', 'Svelte', 'Solid'])
          const selected = prop<string[]>([])
          return html.div(
            attr.class('flex flex-col gap-3'),
            TransferList({
              available,
              selected,
              onChange: v => selected.set(v),
              renderItem: item => html.span(item),
              keyOf: item => item,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              selected.map(s =>
                s.length ? `Selected: ${s.join(', ')}` : 'None selected'
              )
            )
          )
        },
        'Click items to check them, then use the arrow buttons to transfer.'
      ),
      Section(
        'Searchable',
        () => {
          const fruits = [
            'Apple',
            'Apricot',
            'Avocado',
            'Banana',
            'Blueberry',
            'Cherry',
            'Cranberry',
            'Date',
            'Fig',
            'Grape',
            'Kiwi',
            'Lemon',
            'Lime',
            'Mango',
            'Orange',
          ]
          const available = prop(fruits)
          const selected = prop<string[]>([])
          return TransferList({
            available,
            selected,
            onChange: v => selected.set(v),
            renderItem: item => html.span(item),
            keyOf: item => item,
            searchable: true,
          })
        },
        'Enable search to filter items in each panel.'
      ),
      Section(
        'Rich Items',
        () => {
          type User = { id: string; name: string; role: string }
          const users: User[] = [
            { id: '1', name: 'Alice', role: 'Admin' },
            { id: '2', name: 'Bob', role: 'Editor' },
            { id: '3', name: 'Charlie', role: 'Viewer' },
            { id: '4', name: 'Diana', role: 'Editor' },
          ]
          const available = prop(users)
          const selected = prop<User[]>([])
          return TransferList({
            available,
            selected,
            onChange: v => selected.set(v),
            renderItem: user =>
              html.div(
                attr.class('flex flex-col'),
                html.span(attr.class('font-medium'), user.name),
                html.span(attr.class('text-xs text-gray-500'), user.role)
              ),
            keyOf: user => user.id,
          })
        },
        'Use renderItem to display complex objects. keyOf extracts identity.'
      ),
      Section(
        'Disabled',
        () =>
          TransferList({
            available: ['A', 'B', 'C'],
            selected: ['D'],
            onChange: () => {},
            renderItem: item => html.span(item),
            keyOf: item => item,
            disabled: true,
          }),
        'Disabled state prevents all interaction.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-6'),
            ...(['sm', 'md', 'lg'] as const).map(size => {
              const available = prop(['X', 'Y', 'Z'])
              const selected = prop<string[]>([])
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                TransferList({
                  available,
                  selected,
                  onChange: v => selected.set(v),
                  renderItem: item => html.span(item),
                  keyOf: item => item,
                  size,
                })
              )
            })
          ),
        'Size controls item padding and panel dimensions.'
      ),
    ],
  })
}
