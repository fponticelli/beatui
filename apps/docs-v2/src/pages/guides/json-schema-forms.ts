import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'JSON Schema Forms',
  description:
    'Auto-generate forms from JSON Schema definitions with AJV validation, custom widgets, and sanitization support.',
}

// ---------------------------------------------------------------------------
// Section 1 — Overview
// ---------------------------------------------------------------------------

const BASIC_USAGE_CODE = `import { JSONSchemaForm } from '@tempots/beatui/json-schema'
import { prop } from '@tempots/dom'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Full Name' },
    age: { type: 'integer', minimum: 0, title: 'Age' },
    email: { type: 'string', format: 'email', title: 'Email' },
  },
  required: ['name', 'email'],
}

const data = prop({})

JSONSchemaForm({ schema, initialValue: data }, ({ Form, controller }) => {
  controller.signal.feedProp(data)
  return Form
})`

// ---------------------------------------------------------------------------
// Section 4 — Sanitization
// ---------------------------------------------------------------------------

const SANITIZATION_CODE = `JSONSchemaForm({
  schema,
  initialValue: data,
  sanitizeAdditional: 'all', // 'all' | 'failing' | false
}, ({ Form }) => Form)`

// ---------------------------------------------------------------------------
// Section 5 — Validation
// ---------------------------------------------------------------------------

const VALIDATION_CODE = `import { JSONSchemaForm } from '@tempots/beatui/json-schema'
import { prop } from '@tempots/dom'

const data = prop({})

JSONSchemaForm({ schema, initialValue: data }, ({ Form, controller }) => {
  // controller.status is a Signal<ControllerValidation>
  // ControllerValidation: { valid: boolean; errors: ValidationError[] }
  controller.status.on(status => {
    if (status.valid) {
      console.log('Form is valid:', controller.signal.value)
    } else {
      console.log('Validation errors:', status.errors)
    }
  })

  return Form
})`

// ---------------------------------------------------------------------------
// Section 6 — Custom Widgets
// ---------------------------------------------------------------------------

const CUSTOM_WIDGETS_CODE = `import { JSONSchemaForm, type WidgetRegistry } from '@tempots/beatui/json-schema'

const widgets: WidgetRegistry = {
  // Override the default widget for a specific field path
  '/bio': MyTextAreaWidget,
  // Override by schema type
  string: MyCustomStringWidget,
}

JSONSchemaForm({ schema, initialValue: data, widgets }, ({ Form }) => Form)`

export default function JsonSchemaFormsGuidePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // ------------------------------------------------------------------ //
      // Page header
      // ------------------------------------------------------------------ //
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'JSON Schema Forms'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'Auto-generate fully reactive forms from standard JSON Schema definitions. Import from ',
          html.code(
            attr.class(
              'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
            ),
            '@tempots/beatui/json-schema'
          ),
          ' and get AJV-powered validation, sanitization, and customizable widgets out of the box.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'AJV Validation'),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'Schema-driven'),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Custom Widgets')
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
            Icon({ icon: 'lucide:file-json', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONSchemaForm'
            ),
            ' reads a standard JSON Schema definition and automatically generates a complete form with labels, validation messages, and appropriate input widgets. It uses ',
            html.a(
              attr.href('https://ajv.js.org'),
              attr.target('_blank'),
              attr.class('text-primary-600 dark:text-primary-400 hover:underline'),
              'AJV'
            ),
            ' under the hood for validation. The generated form integrates seamlessly with BeatUI\'s reactive controller system — you receive a ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'controller'
            ),
            ' and a ready-to-render ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Form'
            ),
            ' node via a render callback.'
          ),
          Notice(
            { variant: 'info', title: 'Supported drafts' },
            'JSON Schema forms support drafts 07, 2019-09, and 2020-12.'
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
            'Pass a JSON Schema and an ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'initialValue'
            ),
            ' prop to ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONSchemaForm'
            ),
            '. The render callback receives ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              '{ Form, controller }'
            ),
            '. Return ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Form'
            ),
            ' to render the auto-generated fields, and use ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'controller.signal.feedProp()'
            ),
            ' to keep an external signal in sync with the form value.'
          ),
          CodeBlock(BASIC_USAGE_CODE, 'typescript')
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 3: Schema Features
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layers', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Schema Features')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The form generator understands a broad set of JSON Schema keywords and maps each one to the most appropriate BeatUI input component and validation rule.'
          ),
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'),
                'Types'
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
                'Keywords'
              ),
              html.ul(
                attr.class('space-y-1'),
                ...[
                  'enum',
                  'oneOf / anyOf / allOf',
                  '$ref',
                  'format',
                  'pattern',
                  'minimum / maximum',
                  'minLength / maxLength',
                  'default values',
                  'if / then / else',
                  'prefixItems (tuple)',
                ].map(kw =>
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
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 4: Sanitization
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:shield', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Sanitization')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'sanitizeAdditional'
            ),
            ' prop controls how additional properties (keys not defined in the schema) are handled in the output value.'
          ),
          html.div(
            attr.class('overflow-x-auto'),
            html.table(
              attr.class('w-full text-sm border-collapse'),
              html.thead(
                html.tr(
                  attr.class('border-b border-gray-200 dark:border-gray-700'),
                  html.th(
                    attr.class('text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap'),
                    'Value'
                  ),
                  html.th(
                    attr.class('text-left py-2 font-semibold text-gray-700 dark:text-gray-300'),
                    'Behavior'
                  )
                )
              ),
              html.tbody(
                html.tr(
                  attr.class('border-b border-gray-100 dark:border-gray-800'),
                  html.td(
                    attr.class('py-2 pr-4 align-top whitespace-nowrap'),
                    html.code(
                      attr.class(
                        'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                      ),
                      "'all'"
                    )
                  ),
                  html.td(
                    attr.class('py-2 text-gray-600 dark:text-gray-400'),
                    'Prune all properties not defined in the schema from the output value.'
                  )
                ),
                html.tr(
                  attr.class('border-b border-gray-100 dark:border-gray-800'),
                  html.td(
                    attr.class('py-2 pr-4 align-top whitespace-nowrap'),
                    html.code(
                      attr.class(
                        'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                      ),
                      "'failing'"
                    )
                  ),
                  html.td(
                    attr.class('py-2 text-gray-600 dark:text-gray-400'),
                    'Prune only properties that fail schema validation, keeping valid extras.'
                  )
                ),
                html.tr(
                  html.td(
                    attr.class('py-2 pr-4 align-top whitespace-nowrap'),
                    html.code(
                      attr.class(
                        'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                      ),
                      'false'
                    )
                  ),
                  html.td(
                    attr.class('py-2 text-gray-600 dark:text-gray-400'),
                    'Keep all properties in the output, regardless of whether they appear in the schema (default).'
                  )
                )
              )
            )
          ),
          CodeBlock(SANITIZATION_CODE, 'typescript')
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 5: Validation
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:check-circle', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Validation')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'controller'
            ),
            ' received in the render callback exposes a reactive ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'status'
            ),
            ' signal of type ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'ControllerValidation'
            ),
            '. Subscribe to it to react to validation changes, gate submissions, or display a custom error summary.'
          ),
          CodeBlock(VALIDATION_CODE, 'typescript'),
          Notice(
            { variant: 'info', title: 'Per-field errors' },
            'Individual field errors are surfaced automatically within each generated input — subscribing to ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'controller.status'
            ),
            ' is only necessary when you need form-level awareness (e.g., disabling a submit button or showing a summary).'
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 6: Custom Widgets
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:puzzle', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Custom Widgets')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The default widget selection can be overridden on a per-field or per-type basis by passing a ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'widgets'
            ),
            ' map to ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'JSONSchemaForm'
            ),
            '. Keys can be a JSON Pointer path (e.g., ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              "'/bio'"
            ),
            ') to target a specific field, or a JSON Schema type name to replace all widgets of that type.'
          ),
          CodeBlock(CUSTOM_WIDGETS_CODE, 'typescript'),
          Notice(
            { variant: 'warning', title: 'Widget contract' },
            'Custom widget functions must accept a ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              'WidgetProps'
            ),
            ' argument that includes the field ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              'controller'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              'schema'
            ),
            ', and ',
            html.code(
              attr.class(
                'font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded'
              ),
              'uiSchema'
            ),
            ' properties and must return a valid TNode.'
          )
        )
      )
    ),
  })
}
