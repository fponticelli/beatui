import { TreeView } from '@tempots/beatui'
import { html, attr, prop, Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TreeView',
  category: 'Navigation',
  component: 'TreeView',
  description:
    'Hierarchical tree navigation with expand/collapse, icon support, badges, and both controlled and uncontrolled expansion modes.',
  icon: 'lucide:git-branch',
  order: 7,
}

const sampleTree = [
  {
    id: 'src',
    label: 'src',
    icon: 'lucide:folder',
    children: [
      {
        id: 'components',
        label: 'components',
        icon: 'lucide:folder',
        children: [
          { id: 'button', label: 'button.ts', icon: 'lucide:file-code' },
          { id: 'input', label: 'input.ts', icon: 'lucide:file-code' },
        ],
      },
      {
        id: 'utils',
        label: 'utils',
        icon: 'lucide:folder',
        children: [
          { id: 'helpers', label: 'helpers.ts', icon: 'lucide:file-code' },
          { id: 'types', label: 'types.ts', icon: 'lucide:file-code' },
        ],
      },
      { id: 'index', label: 'index.ts', icon: 'lucide:file-code' },
    ],
  },
  {
    id: 'tests',
    label: 'tests',
    icon: 'lucide:folder',
    children: [
      { id: 'setup', label: 'setup.ts', icon: 'lucide:file-code' },
    ],
  },
  { id: 'readme', label: 'README.md', icon: 'lucide:file-text' },
]

export default function TreeViewPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('TreeView', signals => {
      const selectedId = signals.selectedId as Prop<string | undefined>
      return html.div(
        attr.class('w-72 border border-gray-200 dark:border-gray-700 rounded-lg p-2'),
        TreeView({
          items: sampleTree,
          selectedId,
          onSelect: (id: string) => selectedId.set(id),
          size: signals.size,
        } as never)
      )
    }),
    sections: [
      Section(
        'Basic Tree',
        () => {
          const selectedId = prop<string | undefined>(undefined)
          return html.div(
            attr.class('w-72 border border-gray-200 dark:border-gray-700 rounded-lg p-2'),
            TreeView({
              items: [
                {
                  id: 'docs',
                  label: 'Documents',
                  icon: 'lucide:folder',
                  children: [
                    { id: 'report', label: 'Report.pdf', icon: 'lucide:file' },
                    { id: 'data', label: 'Data.xlsx', icon: 'lucide:file' },
                  ],
                },
                { id: 'image', label: 'Image.png', icon: 'lucide:image' },
              ],
              selectedId,
              onSelect: id => selectedId.set(id),
            })
          )
        },
        'A simple tree with nested folders. Items with children show a toggle chevron.'
      ),
      Section(
        'With Badges',
        () => {
          const selectedId = prop<string | undefined>(undefined)
          return html.div(
            attr.class('w-72 border border-gray-200 dark:border-gray-700 rounded-lg p-2'),
            TreeView({
              items: [
                {
                  id: 'inbox',
                  label: 'Inbox',
                  icon: 'lucide:inbox',
                  badge: '12',
                  children: [
                    {
                      id: 'unread',
                      label: 'Unread',
                      icon: 'lucide:mail',
                      badge: '5',
                    },
                    { id: 'starred', label: 'Starred', icon: 'lucide:star' },
                  ],
                },
                {
                  id: 'sent',
                  label: 'Sent',
                  icon: 'lucide:send',
                },
                {
                  id: 'drafts',
                  label: 'Drafts',
                  icon: 'lucide:file-edit',
                  badge: '3',
                },
              ],
              selectedId,
              onSelect: id => selectedId.set(id),
            })
          )
        },
        'Tree items support an optional badge displayed on the trailing edge.'
      ),
      Section(
        'Controlled Expansion',
        () => {
          const selectedId = prop<string | undefined>(undefined)
          const expandedIds = prop(new Set(['animals']))
          return html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              attr.class('flex gap-2'),
              html.button(
                attr.class('px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'),
                attr.type('button'),
                'Expand All',
              ),
              html.button(
                attr.class('px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'),
                attr.type('button'),
                'Collapse All',
              )
            ),
            html.div(
              attr.class('w-72 border border-gray-200 dark:border-gray-700 rounded-lg p-2'),
              TreeView({
                items: [
                  {
                    id: 'animals',
                    label: 'Animals',
                    icon: 'lucide:paw-print',
                    children: [
                      { id: 'cat', label: 'Cat', icon: 'lucide:cat' },
                      { id: 'dog', label: 'Dog', icon: 'lucide:dog' },
                    ],
                  },
                  {
                    id: 'plants',
                    label: 'Plants',
                    icon: 'lucide:leaf',
                    children: [
                      { id: 'tree-item', label: 'Tree', icon: 'lucide:tree-pine' },
                      { id: 'flower', label: 'Flower', icon: 'lucide:flower' },
                    ],
                  },
                ],
                selectedId,
                onSelect: id => selectedId.set(id),
                expandedIds,
                onToggle: (id, expanded) => {
                  const ids = new Set(expandedIds.get())
                  if (expanded) {
                    ids.add(id)
                  } else {
                    ids.delete(id)
                  }
                  expandedIds.set(ids)
                },
              })
            )
          )
        },
        'Pass expandedIds and onToggle to manage expansion state from outside the component.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            ...(['sm', 'md', 'lg'] as const).map(size =>
              html.div(
                attr.class('flex flex-col gap-1'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400 mb-1'),
                  `size="${size}"`
                ),
                html.div(
                  attr.class('w-48 border border-gray-200 dark:border-gray-700 rounded-lg p-2'),
                  TreeView({
                    items: [
                      {
                        id: `folder-${size}`,
                        label: 'Folder',
                        icon: 'lucide:folder',
                        children: [
                          { id: `file1-${size}`, label: 'File 1', icon: 'lucide:file' },
                          { id: `file2-${size}`, label: 'File 2', icon: 'lucide:file' },
                        ],
                      },
                    ],
                    size,
                  })
                )
              )
            )
          ),
        'TreeView is available in sm, md, and lg sizes.'
      ),
    ],
  })
}
