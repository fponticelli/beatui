import { html, attr } from '@tempots/dom'
import { ScrollablePanel } from '@tempots/beatui'

export function JSONSchemaXUIGuidePage() {
  return ScrollablePanel({
    header: html.h1(
      attr.class('bu-text-3xl bu-font-bold bu-mb-4'),
      'JSON Schema x:ui Guide'
    ),
    body: html.div(
      attr.class('bu-space-y-8 bu-p-6'),

      // Introduction
      html.section(
        html.p(
          attr.class('bu-text-lg bu-text-gray-600 bu-mb-6'),
          'Learn how to customize JSON Schema forms using the powerful x:ui extension system.'
        )
      ),

      // x:ui Precedence System
      html.section(
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-mb-4'),
          'x:ui Precedence System'
        ),
        html.p(
          attr.class('bu-mb-4'),
          'The x:ui system uses a 7-level precedence hierarchy to determine which widget to render:'
        ),
        html.ol(
          attr.class('bu-list-decimal bu-list-inside bu-space-y-2 bu-mb-6'),
          html.li('Explicit x:ui.widget'),
          html.li('Explicit x:ui.format (or x:ui as string)'),
          html.li('Schema format property'),
          html.li('Schema contentMediaType/contentEncoding'),
          html.li('Schema constraints (enum, const, ranges)'),
          html.li('Heuristics (property names, length bounds)'),
          html.li('Type fallback')
        ),

        html.pre(
          attr.class(
            'bu-bg-gray-100 bu-p-4 bu-rounded bu-overflow-x-auto bu-text-sm bu-whitespace-pre'
          ),
          `// Example: Different ways to specify widgets
const schema = {
  type: 'object',
  properties: {
    // 1. Explicit widget (highest precedence)
    name: {
      type: 'string',
      'x:ui': { widget: 'rich-text' }
    },
    
    // 2. Format shorthand
    description: {
      type: 'string',
      'x:ui': 'textarea'
    },
    
    // 3. Schema format
    email: {
      type: 'string',
      format: 'email' // Uses email input
    }
  }
}`
        )
      ),

      // Container Layouts
      html.section(
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-mb-4'),
          'Container Layouts'
        ),
        html.p(
          attr.class('bu-mb-4'),
          'Organize form fields using container layouts at the object level:'
        ),

        html.h3(
          attr.class('bu-text-xl bu-font-medium bu-mb-3'),
          'Available Layouts'
        ),
        html.ul(
          attr.class('bu-list-disc bu-list-inside bu-space-y-1 bu-mb-6'),
          html.li('fieldset - Traditional fieldset with legend'),
          html.li('tabs - Tabbed interface'),
          html.li('accordion - Collapsible sections'),
          html.li('group - Simple grouping'),
          html.li('grid - Responsive grid layout')
        )
      ),

      // Field Visibility
      html.section(
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-mb-4'),
          'Field Visibility'
        ),
        html.p(
          attr.class('bu-mb-4'),
          'Control field visibility based on form state using visibleIf conditions.'
        )
      ),

      // Discriminator Support
      html.section(
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-mb-4'),
          'Discriminator Support'
        ),
        html.p(
          attr.class('bu-mb-4'),
          'Use discriminators for intelligent oneOf branch selection.'
        )
      ),

      // Best Practices
      html.section(
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-mb-4'),
          'Best Practices'
        ),
        html.div(
          attr.class('bu-space-y-4'),
          html.div(
            html.h3(
              attr.class('bu-text-lg bu-font-medium bu-mb-2'),
              '1. Use Semantic Widget Names'
            ),
            html.p(
              'Choose descriptive widget names that reflect their purpose, not just their appearance.'
            )
          ),
          html.div(
            html.h3(
              attr.class('bu-text-lg bu-font-medium bu-mb-2'),
              '2. Leverage Schema Constraints'
            ),
            html.p(
              'Let the system auto-select widgets based on schema constraints when possible.'
            )
          ),
          html.div(
            html.h3(
              attr.class('bu-text-lg bu-font-medium bu-mb-2'),
              '3. Group Related Fields'
            ),
            html.p(
              'Use container layouts to organize related fields logically.'
            )
          )
        )
      )
    ),
  })
}
