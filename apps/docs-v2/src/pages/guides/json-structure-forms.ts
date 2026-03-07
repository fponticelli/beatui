import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'JSON Structure Forms',
  description:
    'Form generation from a custom JSON Structure schema format with layout control and widget customization.',
}

// ---------------------------------------------------------------------------
// Section 2 — Basic Usage
// ---------------------------------------------------------------------------

const BASIC_USAGE_CODE = `import { JSONStructureForm, type JSONStructureSchema } from '@tempots/beatui/json-structure'
import { prop } from '@tempots/dom'

const schema: JSONStructureSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', label: 'Full Name' },
    age: { type: 'number', label: 'Age', min: 0 },
    bio: { type: 'string', label: 'Biography', widget: 'textarea' },
  },
  required: ['name'],
}

const data = prop({})

JSONStructureForm({ schema, initialValue: data }, ({ Form, controller }) => {
  controller.signal.feedProp(data)
  return Form
})`

// ---------------------------------------------------------------------------
// Section 4 — Widget Selection
// ---------------------------------------------------------------------------

const WIDGET_SELECTION_CODE = `import { JSONStructureForm, type JSONStructureSchema } from '@tempots/beatui/json-structure'

const schema: JSONStructureSchema = {
  type: 'object',
  properties: {
    // Default widget for string is a single-line text input
    title: { type: 'string', label: 'Title' },

    // Override to a multiline textarea
    description: { type: 'string', label: 'Description', widget: 'textarea' },

    // Enum with explicit options renders as a select/dropdown
    status: {
      type: 'string',
      label: 'Status',
      widget: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' },
      ],
    },

    // Boolean defaults to a checkbox; switch is an alternative
    active: { type: 'boolean', label: 'Active', widget: 'switch' },

    // Number with a slider widget
    priority: { type: 'number', label: 'Priority', min: 1, max: 10, widget: 'slider' },
  },
}`

// ---------------------------------------------------------------------------
// Section 3 — Schema Format
// ---------------------------------------------------------------------------

const SCHEMA_FORMAT_CODE = `import { type JSONStructureSchema } from '@tempots/beatui/json-structure'

const schema: JSONStructureSchema = {
  type: 'object',
  label: 'User Profile',          // Top-level form title
  description: 'Edit your info', // Optional section description
  properties: {
    // String field with optional constraints
    username: {
      type: 'string',
      label: 'Username',
      description: 'Must be lowercase with no spaces',
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-z0-9_]+$',
    },

    // Number field with bounds
    score: {
      type: 'number',
      label: 'Score',
      min: 0,
      max: 100,
    },

    // Boolean field
    newsletter: {
      type: 'boolean',
      label: 'Subscribe to newsletter',
    },

    // Nested object
    address: {
      type: 'object',
      label: 'Address',
      properties: {
        street: { type: 'string', label: 'Street' },
        city:   { type: 'string', label: 'City' },
      },
    },

    // Array of items
    tags: {
      type: 'array',
      label: 'Tags',
      items: { type: 'string', label: 'Tag' },
    },
  },
  required: ['username'],
}`

export default function JsonStructureFormsGuidePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // ------------------------------------------------------------------ //
      // Page header
      // ------------------------------------------------------------------ //
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'JSON Structure Forms'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'Generate forms from BeatUI\'s custom JSON Structure schema format. Import from ',
          html.code(
            attr.class(
              'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
            ),
            '@tempots/beatui/json-structure'
          ),
          ' for a schema format designed with form layout and widget selection as first-class concerns.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'Layout Control'),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'Widget Selection'),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'BeatUI-native')
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 1: Overview
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:blocks', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'JSON Structure is an alternative to JSON Schema for form generation. While JSON Schema is a validation standard with form generation as a secondary concern, JSON Structure is a BeatUI-specific format designed from the ground up for form building. It gives you direct control over field labels, descriptions, widget types, and layout without needing to reach for custom UI schema extensions.'
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Like ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONSchemaForm'
            ),
            ', the component uses a render callback pattern, returning both a pre-built ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Form'
            ),
            ' node and a reactive ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'controller'
            ),
            ' for programmatic access to form state and validation.'
          ),
          Notice(
            { variant: 'info', title: 'BeatUI-specific format' },
            'JSON Structure is BeatUI\'s custom schema format that gives you more control over form layout and widget selection than standard JSON Schema.'
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 2: Basic Usage
      // ------------------------------------------------------------------ //
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
            'Define a ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONStructureSchema'
            ),
            ' object, create a reactive prop for the form data, then pass both to ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONStructureForm'
            ),
            '. The render callback receives ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              '{ Form, controller }'
            ),
            ' — return ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Form'
            ),
            ' to render the fields.'
          ),
          CodeBlock(BASIC_USAGE_CODE, 'typescript')
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 3: Schema Format
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:file-code', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Schema Format')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONStructureSchema'
            ),
            ' type supports ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'object'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'array'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'string'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'number'
            ),
            ', and ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'boolean'
            ),
            ' field types. Every field accepts additional layout properties such as ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'label'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'description'
            ),
            ', and ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'widget'
            ),
            ' directly in the schema — no separate UI schema object is required.'
          ),
          CodeBlock(SCHEMA_FORMAT_CODE, 'typescript')
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 4: Widget Selection
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layout-grid', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Widget Selection')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Set the ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'widget'
            ),
            ' property directly on any field definition to override the default component chosen for that type. Each type has a sensible default, but common overrides are available for every built-in type.'
          ),
          html.div(
            attr.class('overflow-x-auto'),
            html.table(
              attr.class('w-full text-sm border-collapse'),
              html.thead(
                html.tr(
                  attr.class('border-b border-gray-200 dark:border-gray-700'),
                  html.th(
                    attr.class('text-left py-2 pr-6 font-semibold text-gray-700 dark:text-gray-300'),
                    'Type'
                  ),
                  html.th(
                    attr.class('text-left py-2 pr-6 font-semibold text-gray-700 dark:text-gray-300'),
                    'Default widget'
                  ),
                  html.th(
                    attr.class('text-left py-2 font-semibold text-gray-700 dark:text-gray-300'),
                    'Available overrides'
                  )
                )
              ),
              html.tbody(
                ...[
                  { type: 'string',  defaultWidget: 'text',     overrides: 'textarea, select, combobox' },
                  { type: 'number',  defaultWidget: 'number',   overrides: 'slider' },
                  { type: 'boolean', defaultWidget: 'checkbox', overrides: 'switch, radio' },
                  { type: 'array',   defaultWidget: 'list',     overrides: 'tags-input' },
                  { type: 'object',  defaultWidget: 'group',    overrides: '—' },
                ].map(row =>
                  html.tr(
                    attr.class('border-b border-gray-100 dark:border-gray-800'),
                    html.td(
                      attr.class('py-2 pr-6'),
                      html.code(
                        attr.class(
                          'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                        ),
                        row.type
                      )
                    ),
                    html.td(
                      attr.class('py-2 pr-6'),
                      html.code(
                        attr.class(
                          'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                        ),
                        row.defaultWidget
                      )
                    ),
                    html.td(
                      attr.class('py-2 text-gray-600 dark:text-gray-400 text-xs'),
                      row.overrides
                    )
                  )
                )
              )
            )
          ),
          CodeBlock(WIDGET_SELECTION_CODE, 'typescript')
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 5: Comparison with JSON Schema
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:git-compare', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Comparison with JSON Schema')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Both approaches generate reactive BeatUI forms, but they target different use cases. Choose based on where your schema comes from and how much layout control you need.'
          ),
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'),

            // JSON Schema column
            html.div(
              attr.class('space-y-3'),
              html.div(
                attr.class('flex items-center gap-2'),
                html.span(
                  attr.class(
                    'text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  ),
                  'JSON Schema'
                )
              ),
              html.ul(
                attr.class('space-y-2'),
                ...[
                  'Standard, interoperable format (IETF)',
                  'Validation-focused with rich constraint support',
                  'Works with existing schemas from APIs and OpenAPI specs',
                  'Supports $ref, allOf, oneOf, anyOf, if/then/else',
                  'Requires UI schema extension for fine-grained layout',
                  'AJV-powered — draft 07, 2019-09, 2020-12',
                ].map(point =>
                  html.li(
                    attr.class('flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400'),
                    html.span(
                      attr.class('mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0')
                    ),
                    point
                  )
                )
              )
            ),

            // JSON Structure column
            html.div(
              attr.class('space-y-3'),
              html.div(
                attr.class('flex items-center gap-2'),
                html.span(
                  attr.class(
                    'text-xs font-semibold px-2 py-0.5 rounded bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300'
                  ),
                  'JSON Structure'
                )
              ),
              html.ul(
                attr.class('space-y-2'),
                ...[
                  'BeatUI-specific format optimized for form authoring',
                  'Layout-focused: labels, descriptions, and widgets inline',
                  'Simpler syntax — no need for a separate UI schema',
                  'Widget overrides as a first-class schema property',
                  'Best for forms defined alongside your TypeScript code',
                  'No external validator dependency',
                ].map(point =>
                  html.li(
                    attr.class('flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400'),
                    html.span(
                      attr.class('mt-1 w-1.5 h-1.5 rounded-full bg-secondary-500 flex-shrink-0')
                    ),
                    point
                  )
                )
              )
            )
          ),
          Notice(
            { variant: 'info', title: 'Which should I use?' },
            'If you already have a JSON Schema (e.g., from an OpenAPI spec or a shared validation library), use ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'JSONSchemaForm'
            ),
            '. If you are defining the schema specifically for a form inside your TypeScript codebase and want maximum layout control with minimal boilerplate, use ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'JSONStructureForm'
            ),
            '.'
          )
        )
      )
    ),
  })
}
