import { html, attr, prop, Value } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Pagination } from '@tempots/beatui'

export default function PaginationPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic pagination
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Pagination – Basic'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Navigate through multiple pages of content with page numbers and controls.'
          ),
          (() => {
            const currentPage = prop(1)
            return html.div(
              attr.class('space-y-3'),
              Pagination({
                currentPage,
                totalPages: prop(10),
                onPageChange: page => {
                  currentPage.set(page)
                  console.log('Page changed to:', page)
                },
              }),
              html.p(
                attr.class('text-sm text-gray-600 dark:text-gray-400 text-center'),
                'Current page: ',
                html.span(
                  attr.class('font-medium'),
                  Value.map(currentPage, p => String(p))
                ),
                ' of 10'
              )
            )
          })()
        )
      ),

      // With first/last buttons
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-lg font-semibold'),
            'With First/Last Buttons'
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Add first and last page buttons for quick navigation.'
          ),
          (() => {
            const currentPage = prop(5)
            return html.div(
              attr.class('space-y-3'),
              Pagination({
                currentPage,
                totalPages: prop(20),
                onPageChange: currentPage.set,
                showFirstLast: true,
              }),
              html.p(
                attr.class('text-sm text-gray-600 dark:text-gray-400 text-center'),
                'Page ',
                html.span(
                  attr.class('font-medium'),
                  Value.map(currentPage, p => String(p))
                ),
                ' of 20'
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
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Pagination controls in different sizes.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Small'),
              Pagination({
                currentPage: prop(3),
                totalPages: prop(10),
                onPageChange: () => {},
                size: 'sm',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Medium (default)'),
              Pagination({
                currentPage: prop(3),
                totalPages: prop(10),
                onPageChange: () => {},
                size: 'md',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Large'),
              Pagination({
                currentPage: prop(3),
                totalPages: prop(10),
                onPageChange: () => {},
                size: 'lg',
              })
            )
          )
        )
      ),

      // Justified layout
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Justified Layout'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Distribute pagination items across the full available width.'
          ),
          (() => {
            const currentPage = prop(5)
            return html.div(
              attr.class('space-y-3'),
              Pagination({
                currentPage,
                totalPages: prop(15),
                onPageChange: currentPage.set,
                showFirstLast: true,
                justify: true,
              }),
              html.p(
                attr.class('text-sm text-gray-600 dark:text-gray-400 text-center'),
                'Page ',
                html.span(
                  attr.class('font-medium'),
                  Value.map(currentPage, p => String(p))
                ),
                ' of 15'
              )
            )
          })()
        )
      ),

      // Different scenarios
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Different Scenarios'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Pagination behavior with different page counts and positions.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Few pages (5 total)'),
              Pagination({
                currentPage: prop(2),
                totalPages: prop(5),
                onPageChange: () => {},
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'At the beginning (page 1 of 15)'
              ),
              Pagination({
                currentPage: prop(1),
                totalPages: prop(15),
                onPageChange: () => {},
                siblings: prop(1),
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'In the middle (page 8 of 15)'
              ),
              Pagination({
                currentPage: prop(8),
                totalPages: prop(15),
                onPageChange: () => {},
                siblings: prop(1),
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'At the end (page 15 of 15)'
              ),
              Pagination({
                currentPage: prop(15),
                totalPages: prop(15),
                onPageChange: () => {},
                siblings: prop(1),
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'More siblings (2)'),
              Pagination({
                currentPage: prop(10),
                totalPages: prop(20),
                onPageChange: () => {},
                siblings: prop(2),
              })
            )
          )
        )
      )
    ),
  })
}
