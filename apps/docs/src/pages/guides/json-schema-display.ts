import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'JSON Schema Display',
  description:
    'Read-only rendering of JSON data annotated by a JSON Schema. Highlights type mismatches, supports custom display widgets, and works without AJV.',
}

const BASIC_USAGE_CODE = `import { JSONSchemaDisplay } from '@tempots/beatui/json-schema-display'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Full Name' },
    age: { type: 'integer', title: 'Age' },
    email: { type: 'string', format: 'email', title: 'Email' },
  },
}

const value = {
  name: 'Jane Doe',
  age: 32,
  email: 'jane@example.com',
}

JSONSchemaDisplay({ schema, value })`

const MISMATCH_CODE = `// Mismatches are detected automatically when the value
// doesn't match the schema (e.g., wrong type, missing required field).

JSONSchemaDisplay({
  schema,
  value: {
    name: 42,           // Expected string, got number
    age: 'not a number', // Expected integer, got string
    email: 'jane@example.com',
  },
  showMismatches: true, // default
})

// Disable mismatch highlighting
JSONSchemaDisplay({ schema, value, showMismatches: false })`

const REACTIVE_CODE = `import { JSONSchemaDisplay } from '@tempots/beatui/json-schema-display'
import { prop } from '@tempots/dom'

const data = prop({ name: 'Jane', age: 32 })

// Display updates reactively when data changes
JSONSchemaDisplay({ schema, value: data })

// Later...
data.set({ name: 'John', age: 28 })`

const HORIZONTAL_CODE = `// Use horizontal layout for field labels
JSONSchemaDisplay({
  schema,
  value,
  horizontal: true, // Labels appear to the left of values
})`

const CUSTOM_WIDGETS_CODE = `import {
  JSONSchemaDisplay,
  forDisplayFormat,
  forDisplayXUI,
  forDisplayTypeAndFormat,
  type DisplayWidgetFactory,
} from '@tempots/beatui/json-schema-display'

// Custom widget for email fields — renders as a clickable link
const emailDisplay: DisplayWidgetFactory = ({ value }) =>
  html.a(
    attr.href(Value.map(value, v => \`mailto:\${v}\`)),
    attr.class('text-primary-600 hover:underline'),
    Value.map(value, String)
  )

// Match by schema format
const emailWidget = forDisplayFormat('email', emailDisplay)

// Match by x:ui widget name in schema
const customWidget = forDisplayXUI('my-custom-display', myFactory)

// Match by type + format combination
const dateWidget = forDisplayTypeAndFormat('string', 'date', dateDisplay)

JSONSchemaDisplay({
  schema,
  value,
  customWidgets: [emailWidget, customWidget, dateWidget],
})`

const SCHEMA_TYPES_CODE = `// Supported schema types and their display renderers:
//
// - object    → Renders properties as labeled key-value pairs
// - array     → Renders items as an indexed list
// - string    → Renders as formatted text (respects format: email, uri, date, etc.)
// - number    → Renders as formatted number
// - integer   → Renders as formatted integer
// - boolean   → Renders as true/false indicator
// - null      → Renders as null placeholder
// - enum      → Renders with the matching enum label
// - const     → Renders the constant value
// - oneOf/anyOf/allOf → Resolves the matching branch and renders accordingly
// - \$ref     → Follows the reference and renders the resolved schema`

export default function JsonSchemaDisplayGuidePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'JSON Schema Display'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'Render JSON data as structured, read-only documentation using a JSON Schema for type annotations, labels, and layout. Import from ',
          html.code(
            attr.class(
              'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
            ),
            '@tempots/beatui/json-schema-display'
          ),
          '. No AJV dependency, no form controllers — pure display.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'Read-only'),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'Mismatch Detection'),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Custom Widgets')
        )
      ),

      // Section 1: Overview
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:eye', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONSchemaDisplay'
            ),
            ' is the read-only counterpart to ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONSchemaForm'
            ),
            '. Given a JSON Schema and a value, it renders the value with labels from schema ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'title'
            ),
            ' annotations, type-appropriate formatting, and optional mismatch highlighting. Useful for API response viewers, data inspectors, schema documentation, and read-only detail views.'
          ),
          Notice(
            { variant: 'info', title: 'No validation dependency' },
            'Unlike JSONSchemaForm, this component does not depend on AJV. Mismatch detection is built-in and lightweight.'
          )
        )
      ),

      // Section 2: Basic Usage
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:play', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Basic Usage')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Pass a JSON Schema and a value. The component renders each property using the schema\'s ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'title'
            ),
            ' as the label, with type-appropriate formatting for strings, numbers, booleans, arrays, and nested objects.'
          ),
          CodeBlock(BASIC_USAGE_CODE, 'typescript')
        )
      ),

      // Section 3: Mismatch Detection
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:alert-triangle', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Mismatch Detection')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'When ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'showMismatches'
            ),
            ' is enabled (default), the component compares each value against the schema and highlights type mismatches, missing required fields, and constraint violations. Mismatches are recomputed reactively whenever the value changes.'
          ),
          CodeBlock(MISMATCH_CODE, 'typescript')
        )
      ),

      // Section 4: Reactive Values
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:zap', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Reactive Values')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'value'
            ),
            ' prop accepts a reactive ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Value<unknown>'
            ),
            ' signal. The display updates automatically when the signal changes — ideal for pairing with a Monaco editor, form output, or API response stream.'
          ),
          CodeBlock(REACTIVE_CODE, 'typescript')
        )
      ),

      // Section 5: Layout
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layout-list', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Layout')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'By default, labels appear above values (vertical layout). Set ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'horizontal: true'
            ),
            ' to render labels to the left of values, which works well for wide containers and detail panels.'
          ),
          CodeBlock(HORIZONTAL_CODE, 'typescript')
        )
      ),

      // Section 6: Supported Schema Types
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layers', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Supported Schema Types')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The display component handles all standard JSON Schema types and composition keywords, rendering each with an appropriate display widget.'
          ),
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'),
                'Primitive Types'
              ),
              html.ul(
                attr.class('space-y-1'),
                ...['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'].map(kw =>
                  html.li(
                    attr.class('flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'),
                    html.span(
                      attr.class('w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0')
                    ),
                    html.code(
                      attr.class(
                        'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                      ),
                      kw
                    )
                  )
                )
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'),
                'Composition & References'
              ),
              html.ul(
                attr.class('space-y-1'),
                ...['enum', 'const', 'oneOf', 'anyOf', 'allOf', '$ref', 'format'].map(kw =>
                  html.li(
                    attr.class('flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'),
                    html.span(
                      attr.class('w-1.5 h-1.5 rounded-full bg-secondary-500 flex-shrink-0')
                    ),
                    html.code(
                      attr.class(
                        'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                      ),
                      kw
                    )
                  )
                )
              )
            )
          ),
          CodeBlock(SCHEMA_TYPES_CODE, 'typescript')
        )
      ),

      // Section 7: Custom Display Widgets
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:puzzle', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Custom Display Widgets')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Override the default display for specific fields using the ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'customWidgets'
            ),
            ' prop. Three factory helpers are provided: ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'forDisplayFormat'
            ),
            ' (match by schema format), ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'forDisplayXUI'
            ),
            ' (match by ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'x:ui'
            ),
            ' widget name), and ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'forDisplayTypeAndFormat'
            ),
            ' (match by type + format).'
          ),
          CodeBlock(CUSTOM_WIDGETS_CODE, 'typescript'),
          Notice(
            { variant: 'warning', title: 'Widget priority' },
            'When multiple widgets match, the one with the highest ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              'priority'
            ),
            ' wins (default: 50). Explicit ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              'x:ui'
            ),
            ' matches get priority 100, format matches get 75.'
          )
        )
      ),
    ),
  })
}
