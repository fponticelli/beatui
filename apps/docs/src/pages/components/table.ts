import { Table } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Table',
  category: 'Tables',
  component: 'Table',
  description:
    'A styled HTML table wrapper with configurable borders, striped rows, hover effects, and sticky headers.',
  icon: 'lucide:table',
  order: 4,
}

const sampleHead = html.thead(
  html.tr(
    html.th('Name'),
    html.th('Role'),
    html.th('Status')
  )
)

function sampleBody() {
  return html.tbody(
    html.tr(
      html.td('Alice Johnson'),
      html.td('Admin'),
      html.td('Active')
    ),
    html.tr(
      html.td('Bob Smith'),
      html.td('Editor'),
      html.td('Active')
    ),
    html.tr(
      html.td('Carol White'),
      html.td('Viewer'),
      html.td('Inactive')
    )
  )
}

export default function TablePage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Table', signals => {
      return Table(
        {
          size: signals.size,
          hoverable: signals.hoverable,
          stickyHeader: signals.stickyHeader,
          withStripedRows: signals.withStripedRows,
          withTableBorder: signals.withTableBorder,
          withColumnBorders: signals.withColumnBorders,
          withRowBorders: signals.withRowBorders,
          borderRadius: signals.borderRadius,
          fullWidth: true,
        },
        html.thead(
          html.tr(
            html.th('Name'),
            html.th('Role'),
            html.th('Status')
          )
        ),
        sampleBody()
      )
    }),
    sections: [
      ...AutoSections('Table', props =>
        Table(
          { ...props, fullWidth: true },
          html.thead(
            html.tr(html.th('Name'), html.th('Role'), html.th('Status'))
          ),
          html.tbody(
            html.tr(html.td('Alice'), html.td('Admin'), html.td('Active')),
            html.tr(html.td('Bob'), html.td('Editor'), html.td('Active'))
          )
        )
      ),
      Section(
        'Striped Rows',
        () =>
          Table(
            { withStripedRows: true, fullWidth: true },
            html.thead(
              html.tr(html.th('Name'), html.th('Role'), html.th('Status'))
            ),
            html.tbody(
              html.tr(
                html.td('Alice Johnson'),
                html.td('Admin'),
                html.td('Active')
              ),
              html.tr(
                html.td('Bob Smith'),
                html.td('Editor'),
                html.td('Active')
              ),
              html.tr(
                html.td('Carol White'),
                html.td('Viewer'),
                html.td('Inactive')
              ),
              html.tr(
                html.td('David Lee'),
                html.td('Viewer'),
                html.td('Active')
              )
            )
          ),
        'Alternate row colors improve readability for dense data tables.'
      ),
      Section(
        'Hoverable',
        () =>
          Table(
            { hoverable: true, fullWidth: true },
            html.thead(
              html.tr(html.th('Name'), html.th('Role'), html.th('Status'))
            ),
            sampleBody()
          ),
        'Hoverable tables highlight the row under the cursor for easier scanning.'
      ),
      Section(
        'Column Borders',
        () =>
          Table(
            { withColumnBorders: true, fullWidth: true },
            html.thead(
              html.tr(html.th('Name'), html.th('Role'), html.th('Status'))
            ),
            sampleBody()
          ),
        'Show vertical separators between columns for a spreadsheet-like appearance.'
      ),
      Section(
        'No Border',
        () =>
          Table(
            { withTableBorder: false, withRowBorders: false, fullWidth: true },
            html.thead(
              html.tr(html.th('Name'), html.th('Role'), html.th('Status'))
            ),
            sampleBody()
          ),
        'Remove outer and row borders for a minimal, borderless layout.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-6'),
            html.p(attr.class('text-sm font-medium'), 'Small (sm)'),
            Table(
              { size: 'sm', fullWidth: true },
              html.thead(
                html.tr(html.th('Name'), html.th('Role'))
              ),
              html.tbody(
                html.tr(html.td('Alice'), html.td('Admin')),
                html.tr(html.td('Bob'), html.td('Editor'))
              )
            ),
            html.p(attr.class('text-sm font-medium'), 'Large (lg)'),
            Table(
              { size: 'lg', fullWidth: true },
              html.thead(
                html.tr(html.th('Name'), html.th('Role'))
              ),
              html.tbody(
                html.tr(html.td('Alice'), html.td('Admin')),
                html.tr(html.td('Bob'), html.td('Editor'))
              )
            )
          ),
        'Cell padding and font size adjust across size variants: xs, sm, md (default), lg, xl.'
      ),
    ],
  })
}
