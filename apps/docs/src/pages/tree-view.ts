import { html, attr, prop, Value } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, TreeView } from '@tempots/beatui'

export default function TreeViewPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic tree view
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'TreeView – Basic'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Display hierarchical data with expandable/collapsible items.'
          ),
          (() => {
            const selectedId = prop<string | undefined>(undefined)
            return html.div(
              attr.class('space-y-3'),
              TreeView({
                items: [
                  {
                    id: 'folder1',
                    label: 'Documents',
                    children: [
                      { id: 'file1', label: 'Report.pdf' },
                      { id: 'file2', label: 'Presentation.pptx' },
                    ],
                  },
                  {
                    id: 'folder2',
                    label: 'Images',
                    children: [
                      { id: 'img1', label: 'Photo1.jpg' },
                      { id: 'img2', label: 'Photo2.png' },
                    ],
                  },
                  { id: 'file3', label: 'Notes.txt' },
                ],
                selectedId,
                onSelect: selectedId.set,
              }),
              html.p(
                attr.class('text-sm text-gray-600'),
                'Selected: ',
                html.span(
                  attr.class('font-medium'),
                  Value.map(selectedId, id => id ?? 'none')
                )
              )
            )
          })()
        )
      ),

      // With icons and badges
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Icons & Badges'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Add icons and badges to tree items for better visual context.'
          ),
          TreeView({
            items: [
              {
                id: 'projects',
                label: 'Projects',
                icon: 'mdi:folder',
                badge: '3',
                children: [
                  {
                    id: 'project1',
                    label: 'Website Redesign',
                    icon: 'mdi:web',
                    badge: '12',
                  },
                  {
                    id: 'project2',
                    label: 'Mobile App',
                    icon: 'mdi:cellphone',
                    badge: '8',
                  },
                  {
                    id: 'project3',
                    label: 'API Development',
                    icon: 'mdi:api',
                    badge: '5',
                  },
                ],
              },
              {
                id: 'archive',
                label: 'Archive',
                icon: 'mdi:archive',
                children: [
                  {
                    id: 'old1',
                    label: 'Legacy System',
                    icon: 'mdi:database',
                  },
                ],
              },
            ],
          })
        )
      ),

      // Controlled expansion
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Controlled Expansion'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Control which items are expanded externally.'
          ),
          (() => {
            const expandedIds = prop(new Set(['src']))
            const selectedId = prop<string | undefined>(undefined)

            return html.div(
              attr.class('space-y-3'),
              TreeView({
                items: [
                  {
                    id: 'src',
                    label: 'src',
                    icon: 'mdi:folder',
                    children: [
                      {
                        id: 'components',
                        label: 'components',
                        icon: 'mdi:folder',
                        children: [
                          {
                            id: 'button.ts',
                            label: 'button.ts',
                            icon: 'mdi:language-typescript',
                          },
                          {
                            id: 'card.ts',
                            label: 'card.ts',
                            icon: 'mdi:language-typescript',
                          },
                        ],
                      },
                      {
                        id: 'utils',
                        label: 'utils',
                        icon: 'mdi:folder',
                        children: [
                          {
                            id: 'helpers.ts',
                            label: 'helpers.ts',
                            icon: 'mdi:language-typescript',
                          },
                        ],
                      },
                      {
                        id: 'index.ts',
                        label: 'index.ts',
                        icon: 'mdi:language-typescript',
                      },
                    ],
                  },
                  {
                    id: 'package.json',
                    label: 'package.json',
                    icon: 'mdi:nodejs',
                  },
                  {
                    id: 'readme.md',
                    label: 'README.md',
                    icon: 'mdi:file-document',
                  },
                ],
                selectedId,
                expandedIds,
                onSelect: selectedId.set,
                onToggle: (id, expanded) => {
                  const ids = new Set(expandedIds.value)
                  if (expanded) {
                    ids.add(id)
                  } else {
                    ids.delete(id)
                  }
                  expandedIds.set(ids)
                },
              }),
              html.div(
                attr.class('text-sm text-gray-600 space-y-1'),
                html.p(
                  'Selected: ',
                  html.span(
                    attr.class('font-medium'),
                    Value.map(selectedId, id => id ?? 'none')
                  )
                ),
                html.p(
                  'Expanded: ',
                  html.span(
                    attr.class('font-medium'),
                    Value.map(
                      expandedIds,
                      ids => Array.from(ids).join(', ') || 'none'
                    )
                  )
                )
              )
            )
          })()
        )
      ),

      // Sizes
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Sizes'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Tree views in different sizes.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Small'),
              TreeView({
                items: [
                  {
                    id: 'parent',
                    label: 'Parent',
                    icon: 'mdi:folder',
                    children: [
                      { id: 'child1', label: 'Child 1', icon: 'mdi:file' },
                      { id: 'child2', label: 'Child 2', icon: 'mdi:file' },
                    ],
                  },
                ],
                size: 'sm',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Large'),
              TreeView({
                items: [
                  {
                    id: 'parent',
                    label: 'Parent',
                    icon: 'mdi:folder',
                    children: [
                      { id: 'child1', label: 'Child 1', icon: 'mdi:file' },
                      { id: 'child2', label: 'Child 2', icon: 'mdi:file' },
                    ],
                  },
                ],
                size: 'lg',
              })
            )
          )
        )
      )
    ),
  })
}
