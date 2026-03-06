import { Pagination } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Pagination',
  category: 'Navigation',
  component: 'Pagination',
  description:
    'Page navigation control for moving through multi-page content, with configurable sibling pages, first/last buttons, and responsive layout.',
  icon: 'lucide:chevrons-left-right',
  order: 5,
}

export default function PaginationPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Pagination', signals => {
      const currentPage = prop(1)
      return Pagination({
        size: signals.size,
        siblings: signals.siblings,
        showPrevNext: signals.showPrevNext,
        showFirstLast: signals.showFirstLast,
        justify: signals.justify,
        responsive: signals.responsive,
        currentPage,
        totalPages: 10,
        onPageChange: (page: number) => currentPage.set(page),
      } as never)
    }),
    sections: [
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const page = prop(3)
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                Pagination({
                  currentPage: page,
                  totalPages: 10,
                  onPageChange: p => page.set(p),
                  size,
                })
              )
            })
          ),
        'Pagination comes in five sizes.'
      ),
      Section(
        'With First and Last Buttons',
        () => {
          const page = prop(5)
          return Pagination({
            currentPage: page,
            totalPages: 20,
            onPageChange: p => page.set(p),
            showFirstLast: true,
          })
        },
        'Enable jump-to-first and jump-to-last buttons with showFirstLast.'
      ),
      Section(
        'More Sibling Pages',
        () => {
          const page = prop(5)
          return Pagination({
            currentPage: page,
            totalPages: 20,
            onPageChange: p => page.set(p),
            siblings: 2,
          })
        },
        'Control how many page numbers appear around the current page with siblings.'
      ),
      Section(
        'Justified Layout',
        () => {
          const page = prop(3)
          return html.div(
            attr.class('w-full'),
            Pagination({
              currentPage: page,
              totalPages: 10,
              onPageChange: p => page.set(p),
              justify: true,
            })
          )
        },
        'The justify option distributes pagination items evenly across the full width.'
      ),
    ],
  })
}
