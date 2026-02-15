import { html, attr, prop, Value } from '@tempots/dom'
import { Pagination } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

export default function PaginationPage() {
  return WidgetPage({
    id: 'pagination',
    title: 'Pagination',
    description: 'Page navigation controls.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Basic',
        (() => {
          const page = prop(1)
          return html.div(
            attr.class('space-y-2'),
            Pagination({
              currentPage: page,
              totalPages: prop(10),
              onPageChange: page.set,
            }),
            html.p(
              attr.class(
                'text-sm text-gray-500 dark:text-gray-400 text-center'
              ),
              'Page ',
              html.span(
                attr.class('font-medium'),
                Value.map(page, p => String(p))
              ),
              ' of 10'
            )
          )
        })()
      ),

      SectionBlock(
        'With First/Last',
        (() => {
          const page = prop(5)
          return html.div(
            attr.class('space-y-2'),
            Pagination({
              currentPage: page,
              totalPages: prop(20),
              onPageChange: page.set,
              showFirstLast: true,
            }),
            html.p(
              attr.class(
                'text-sm text-gray-500 dark:text-gray-400 text-center'
              ),
              'Page ',
              html.span(
                attr.class('font-medium'),
                Value.map(page, p => String(p))
              ),
              ' of 20'
            )
          )
        })()
      ),

      SectionBlock(
        'Sizes',
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Small'),
            Pagination({
              currentPage: prop(3),
              totalPages: prop(10),
              onPageChange: () => {},
              size: 'sm',
            })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Medium'),
            Pagination({
              currentPage: prop(3),
              totalPages: prop(10),
              onPageChange: () => {},
              size: 'md',
            })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Large'),
            Pagination({
              currentPage: prop(3),
              totalPages: prop(10),
              onPageChange: () => {},
              size: 'lg',
            })
          )
        )
      ),

      SectionBlock(
        'Justified',
        (() => {
          const page = prop(5)
          return html.div(
            attr.class('space-y-2'),
            Pagination({
              currentPage: page,
              totalPages: prop(15),
              onPageChange: page.set,
              showFirstLast: true,
              justify: true,
            }),
            html.p(
              attr.class(
                'text-sm text-gray-500 dark:text-gray-400 text-center'
              ),
              'Page ',
              html.span(
                attr.class('font-medium'),
                Value.map(page, p => String(p))
              ),
              ' of 15'
            )
          )
        })()
      ),

      SectionBlock(
        'Responsive',
        (() => {
          const page = prop(5)
          return html.div(
            attr.class('space-y-2'),
            html.p(
              attr.class('text-sm text-base-600 dark:text-base-400'),
              'Dynamically adjusts visible page numbers to fit available space. Resize the browser to see the effect.'
            ),
            Pagination({
              currentPage: page,
              totalPages: prop(50),
              onPageChange: page.set,
              responsive: true,
            }),
            html.p(
              attr.class(
                'text-sm text-gray-500 dark:text-gray-400 text-center'
              ),
              'Page ',
              html.span(
                attr.class('font-medium'),
                Value.map(page, p => String(p))
              ),
              ' of 50'
            )
          )
        })()
      ),

      SectionBlock(
        'Scenarios',
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Few pages (5)'),
            Pagination({
              currentPage: prop(2),
              totalPages: prop(5),
              onPageChange: () => {},
            })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Beginning'),
            Pagination({
              currentPage: prop(1),
              totalPages: prop(15),
              onPageChange: () => {},
              siblings: prop(1),
            })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Middle'),
            Pagination({
              currentPage: prop(8),
              totalPages: prop(15),
              onPageChange: () => {},
              siblings: prop(1),
            })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'End'),
            Pagination({
              currentPage: prop(15),
              totalPages: prop(15),
              onPageChange: () => {},
              siblings: prop(1),
            })
          )
        )
      )
    ),
  })
}
