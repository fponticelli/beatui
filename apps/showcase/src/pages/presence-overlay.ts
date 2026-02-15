import { html, attr } from '@tempots/dom'
import {
  PresenceCursor,
  PresenceHighlight,
  PresenceSelectionMark,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionStack } from '../views/section'

export default function PresenceOverlayPage() {
  return WidgetPage({
    id: 'presence-overlay',
    title: 'Presence Overlay',
    description:
      'Collaborative editing presence indicators - cursors and selections.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      // Cursors only
      SectionStack(
        'Cursors',
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.style(
              'font-size: 16px; line-height: 1.8; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            'The quick brown fox ',
            PresenceCursor({ author: 'Alice', color: '#2563EB' }),
            ' jumps over the lazy ',
            PresenceCursor({ author: 'Bob', color: '#DC2626' }),
            ' dog.'
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Standalone cursors show where collaborators are editing.'
          )
        )
      ),

      // Highlights only
      SectionStack(
        'Highlights',
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.style(
              'font-size: 16px; line-height: 1.8; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            'The ',
            PresenceHighlight({ color: '#2563EB' }, 'quick brown'),
            ' fox jumps over the ',
            PresenceHighlight({ color: '#DC2626' }, 'lazy dog'),
            '.'
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Highlights show selected text with 12% color opacity.'
          )
        )
      ),

      // Selections (highlights + cursors)
      SectionStack(
        'Selections',
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.style(
              'font-size: 16px; line-height: 1.8; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            'The ',
            PresenceSelectionMark(
              { author: 'Alice', color: '#2563EB' },
              'quick brown fox'
            ),
            ' jumps over the ',
            PresenceSelectionMark(
              { author: 'Bob', color: '#DC2626' },
              'lazy dog'
            ),
            '.'
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Combined selection shows highlight + cursor with author name tag.'
          )
        )
      ),

      // Multiple collaborators
      SectionStack(
        'Multiple Collaborators',
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.style(
              'font-size: 16px; line-height: 1.8; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            PresenceSelectionMark(
              { author: 'Alice', color: '#2563EB' },
              'Lorem ipsum dolor'
            ),
            ' sit amet, ',
            PresenceSelectionMark(
              { author: 'Bob', color: '#DC2626' },
              'consectetur adipiscing'
            ),
            ' elit. Sed do eiusmod tempor ',
            PresenceSelectionMark(
              { author: 'Charlie', color: '#059669' },
              'incididunt ut labore'
            ),
            ' et dolore magna aliqua. Ut enim ad minim ',
            PresenceSelectionMark(
              { author: 'Diana', color: '#D97706' },
              'veniam'
            ),
            ', quis nostrud exercitation ullamco laboris.'
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Multiple users can be shown simultaneously with different colors.'
          )
        )
      ),

      // Different text styles
      SectionStack(
        'Text Styles',
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.style(
              'font-size: 14px; line-height: 1.6; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            html.strong(
              'Small text: The ',
              PresenceSelectionMark(
                { author: 'Alice', color: '#2563EB' },
                'quick brown'
              ),
              ' fox'
            )
          ),
          html.div(
            attr.style(
              'font-size: 20px; font-weight: 600; line-height: 1.6; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            'Large heading: The ',
            PresenceSelectionMark(
              { author: 'Bob', color: '#DC2626' },
              'quick brown'
            ),
            ' fox'
          ),
          html.div(
            attr.style(
              'font-family: monospace; font-size: 14px; line-height: 1.8; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            'const text = "',
            PresenceSelectionMark(
              { author: 'Charlie', color: '#059669' },
              'Hello World'
            ),
            '";'
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Presence indicators adapt to different font sizes and styles.'
          )
        )
      ),

      // Color palette
      SectionStack(
        'Color Palette',
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.style(
              'font-size: 16px; line-height: 1.8; padding: 16px; background: var(--bg-base); border-radius: 8px; border: 1px solid var(--color-border-default);'
            ),
            PresenceSelectionMark({ author: 'Blue', color: '#2563EB' }, 'Blue'),
            ' ',
            PresenceSelectionMark({ author: 'Red', color: '#DC2626' }, 'Red'),
            ' ',
            PresenceSelectionMark(
              { author: 'Green', color: '#059669' },
              'Green'
            ),
            ' ',
            PresenceSelectionMark(
              { author: 'Orange', color: '#D97706' },
              'Orange'
            ),
            ' ',
            PresenceSelectionMark(
              { author: 'Purple', color: '#7C3AED' },
              'Purple'
            ),
            ' ',
            PresenceSelectionMark({ author: 'Pink', color: '#DB2777' }, 'Pink'),
            ' ',
            PresenceSelectionMark({ author: 'Teal', color: '#0891B2' }, 'Teal'),
            ' ',
            PresenceSelectionMark(
              { author: 'Indigo', color: '#4F46E5' },
              'Indigo'
            )
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Common color palette for collaborative presence.'
          )
        )
      ),

      // Usage note
      SectionStack(
        'Usage',
        html.div(
          attr.class('space-y-2 p-4 bg-gray-50 beatui-dark:bg-gray-900 rounded-lg'),
          html.p(
            attr.class('text-sm'),
            html.strong('Note: '),
            'This is a CSS-based visual component for displaying collaborative editing presence.'
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Use PresenceCursor for cursor-only indicators, PresenceHighlight for selection highlights, or PresenceSelectionMark for combined cursor + highlight.'
          ),
          html.p(
            attr.class('text-sm text-gray-600 beatui-dark:text-gray-400'),
            'Integration with actual collaborative editors (like Yjs, Lexical, ProseMirror) requires mapping document positions to DOM ranges.'
          )
        )
      )
    ),
  })
}
