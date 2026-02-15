import { html, attr } from '@tempots/dom'
import { Divider } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

export default function DividersPage() {
  return WidgetPage({
    id: 'dividers',
    title: 'Dividers',
    description: 'Horizontal and vertical dividers with labels.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Basic',
        html.div(
          attr.style(
            'padding: 16px; border: 1px solid var(--color-base-200); border-radius: 5px'
          ),
          html.p('Content above'),
          Divider(),
          html.p('Content below')
        )
      ),

      SectionBlock(
        'Variants',
        html.div(
          attr.style(
            'padding: 16px; border: 1px solid var(--color-base-200); border-radius: 5px'
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Solid'),
            Divider({ variant: 'solid' })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Dashed'),
            Divider({ variant: 'dashed' })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Dotted'),
            Divider({ variant: 'dotted' })
          )
        )
      ),

      SectionBlock(
        'Tones',
        html.div(
          attr.style(
            'padding: 16px; border: 1px solid var(--color-base-200); border-radius: 5px'
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Subtle'),
            Divider({ tone: 'subtle' })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Default'),
            Divider({ tone: 'default' })
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Strong'),
            Divider({ tone: 'strong' })
          )
        )
      ),

      SectionBlock(
        'Spacing Scale',
        html.div(
          attr.style(
            'padding: 16px; border: 1px solid var(--color-base-200); border-radius: 5px'
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Small spacing'),
            html.div(attr.style('margin: 8px 0'), Divider())
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Medium spacing'),
            html.div(attr.style('margin: 16px 0'), Divider())
          ),
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm'), 'Large spacing'),
            html.div(attr.style('margin: 24px 0'), Divider())
          )
        )
      ),

      SectionBlock(
        'With Labels',
        Divider({ label: 'OR' }),
        Divider({ label: 'Section 1', labelAlign: 'left' }),
        Divider({ label: 'End', labelAlign: 'right' }),
        Divider({ label: 'Continue', variant: 'dashed' })
      ),

      SectionBlock(
        'Vertical',
        html.div(
          attr.class('flex items-center gap-4 h-16'),
          html.span('Left'),
          Divider({ orientation: 'vertical' }),
          html.span('Center'),
          Divider({ orientation: 'vertical', variant: 'dashed' }),
          html.span('Right')
        )
      ),

      SectionBlock(
        'Vertical with Labels',
        html.div(
          attr.class('flex items-stretch gap-6 h-40'),
          html.div(
            attr.class(
              'flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded'
            ),
            'Panel A'
          ),
          Divider({ orientation: 'vertical', label: 'OR' }),
          html.div(
            attr.class(
              'flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded'
            ),
            'Panel B'
          )
        )
      )
    ),
  })
}
