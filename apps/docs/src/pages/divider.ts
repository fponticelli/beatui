import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Divider } from '@tempots/beatui'

export default function DividerPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic horizontal dividers
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Divider – Basic'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Simple horizontal dividers for separating content sections.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.p('Content above'),
            Divider(),
            html.p('Content below')
          )
        )
      ),

      // Variants
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Variants'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Different line styles: solid, dashed, and dotted.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Solid'),
              Divider({ variant: 'solid' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Dashed'),
              Divider({ variant: 'dashed' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Dotted'),
              Divider({ variant: 'dotted' })
            )
          )
        )
      ),

      // Tones
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Tones'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Control the visual prominence with subtle, default, or strong tones.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Subtle'),
              Divider({ tone: 'subtle' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Default'),
              Divider({ tone: 'default' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Strong'),
              Divider({ tone: 'strong' })
            )
          )
        )
      ),

      // With labels
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Labels'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Dividers can include text labels with different alignments.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Center (default)'),
              Divider({ label: 'OR' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Left aligned'),
              Divider({ label: 'Section 1', labelAlign: 'left' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Right aligned'),
              Divider({ label: 'End', labelAlign: 'right' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Dashed with label'),
              Divider({ label: 'Continue', variant: 'dashed' })
            )
          )
        )
      ),

      // Vertical dividers
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Vertical Dividers'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Use vertical dividers to separate inline content.'
          ),
          html.div(
            attr.class('flex items-center gap-4 h-16'),
            html.span('Left'),
            Divider({ orientation: 'vertical' }),
            html.span('Center'),
            Divider({ orientation: 'vertical', variant: 'dashed' }),
            html.span('Right')
          )
        )
      ),

      // Vertical dividers with labels
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-lg font-semibold'),
            'Vertical Dividers with Labels'
          ),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Vertical dividers can include text labels with different alignments.'
          ),
          html.div(
            attr.class('flex items-stretch gap-6 h-48'),
            html.div(
              attr.class(
                'flex-1 flex items-center justify-center bg-gray-50 beatui-dark:bg-gray-800 rounded'
              ),
              html.span('Left Panel')
            ),
            Divider({
              orientation: 'vertical',
              label: 'OR',
              labelAlign: 'center',
            }),
            html.div(
              attr.class(
                'flex-1 flex items-center justify-center bg-gray-50 beatui-dark:bg-gray-800 rounded'
              ),
              html.span('Center Panel')
            ),
            Divider({
              orientation: 'vertical',
              label: 'AND',
              labelAlign: 'left',
            }),
            html.div(
              attr.class(
                'flex-1 flex items-center justify-center bg-gray-50 beatui-dark:bg-gray-800 rounded'
              ),
              html.span('Right Panel')
            )
          ),
          html.div(
            attr.class('flex items-stretch gap-6 h-48 mt-4'),
            html.div(
              attr.class(
                'flex-1 flex items-center justify-center bg-gray-50 beatui-dark:bg-gray-800 rounded'
              ),
              html.span('Section A')
            ),
            Divider({
              orientation: 'vertical',
              label: 'vs',
              variant: 'dashed',
            }),
            html.div(
              attr.class(
                'flex-1 flex items-center justify-center bg-gray-50 beatui-dark:bg-gray-800 rounded'
              ),
              html.span('Section B')
            ),
            Divider({
              orientation: 'vertical',
              label: 'or',
              variant: 'dotted',
              tone: 'strong',
            }),
            html.div(
              attr.class(
                'flex-1 flex items-center justify-center bg-gray-50 beatui-dark:bg-gray-800 rounded'
              ),
              html.span('Section C')
            )
          )
        )
      )
    ),
  })
}
