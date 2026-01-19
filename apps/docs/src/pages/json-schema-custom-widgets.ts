import { attr, html, prop, style, on, MapSignal } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Group,
  Button,
  Control,
  TextInput,
  type Controller,
} from '@tempots/beatui'
import {
  JSONSchemaForm,
  forXUI,
  forFormat,
  forTypeAndFormat,
  type CustomWidgetRegistration,
  type WidgetFactory,
  type SchemaContext,
} from '@tempots/beatui/json-schema'
import { Validation } from '@tempots/std'
import type { ControllerValidation } from '@tempots/beatui'

/**
 * Example: Custom Email Widget with fancy styling
 * This widget will be matched by explicit x:ui reference
 */
function FancyEmailWidget({
  controller,
}: {
  controller: Controller<string | undefined>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any
  options?: unknown
}) {
  return Control(TextInput, {
    controller,
    label: 'Email Address',
    description: 'Custom fancy email widget',
    before: html.span(
      attr.class('text-primary-500'),
      style.fontSize('1.2rem'),
      '📧'
    ),
    after: html.span(
      attr.class('text-xs text-gray-500'),
      'This is a custom widget!'
    ),
  })
}

/**
 * Example: Custom UUID Widget with validation display
 * Matches by format
 */
function UuidWidget({
  controller,
}: {
  controller: Controller<string | undefined>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any
  options?: unknown
}) {
  const isValid = controller.signal.map(
    v =>
      v != null &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  )

  return Control(TextInput, {
    controller,
    label: 'UUID',
    description: 'Format-based custom widget for UUIDs',
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    before: html.span(
      attr.class('text-purple-500'),
      style.fontSize('1.2rem'),
      '🔑'
    ),
    after: MapSignal(isValid, valid =>
      html.span(
        attr.class(valid ? 'text-green-600' : 'text-orange-600'),
        style.fontSize('0.75rem'),
        valid ? '✓ Valid UUID' : '⚠ Invalid format'
      )
    ),
  })
}

/**
 * Example: Custom Phone Widget with country code
 * Matches by type + format combination
 */
function PhoneWidget({
  controller,
}: {
  controller: Controller<string | undefined>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any
  options?: unknown
}) {
  return Control(TextInput, {
    controller,
    label: 'Phone Number',
    description: 'Type + Format based custom widget',
    placeholder: '+1 (555) 123-4567',
    before: html.span(
      attr.class('text-blue-500'),
      style.fontSize('1.2rem'),
      '📱'
    ),
  })
}

/**
 * Example: Custom Percentage Slider Widget
 * Uses a custom matcher function to match percentage fields
 */
function PercentageWidget({
  controller,
}: {
  controller: Controller<number>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any
  options?: unknown
}) {
  const percentage = controller.signal

  return html.div(
    attr.class('bc-control'),
    html.label(
      attr.class('bc-control__label'),
      'Completion Percentage',
      html.span(
        attr.class('text-primary-600 font-mono ml-2'),
        percentage.map(v => `${v ?? 0}%`)
      )
    ),
    html.input(
      attr.type('range'),
      attr.min('0'),
      attr.max('100'),
      attr.step('1'),
      attr.class('w-full'),
      attr.value(percentage.map(v => String(v ?? 0))),
      on.input(e => {
        const value = Number((e.target as HTMLInputElement).value)
        controller.change(value)
      })
    ),
    html.div(
      attr.class('flex justify-between text-xs text-gray-500 mt-1'),
      html.span('0%'),
      html.span('50%'),
      html.span('100%')
    ),
    html.p(
      attr.class('bc-control__description'),
      'Custom matcher-based widget for percentage fields'
    )
  )
}

// Schema demonstrating different custom widget matching patterns
const customWidgetsSchema = {
  type: 'object',
  title: 'Custom Widgets Demo',
  description:
    'Demonstrates different ways to register and match custom widgets',
  properties: {
    // 1. Explicit x:ui matching
    email: {
      type: 'string',
      format: 'email',
      title: 'Email (Explicit x:ui)',
      description: 'Matches by x:ui widget name using forXUI()',
      'x:ui': 'fancy-email',
    },

    // 2. Format-based matching
    userId: {
      type: 'string',
      format: 'uuid',
      title: 'User ID (Format Match)',
      description: 'Matches all UUID format fields using forFormat()',
    },

    apiKey: {
      type: 'string',
      format: 'uuid',
      title: 'API Key (Format Match)',
      description: 'Another UUID field - also uses the custom UUID widget',
    },

    // 3. Type + Format matching
    phone: {
      type: 'string',
      format: 'phone',
      title: 'Phone (Type + Format)',
      description: 'Matches string + phone format using forTypeAndFormat()',
    },

    // 4. Custom matcher function
    completion: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      title: 'Completion (Custom Matcher)',
      description:
        'Matches via custom function checking min=0, max=100 for percentages',
      default: 50,
    },

    progress: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      title: 'Progress (Custom Matcher)',
      description: 'Another percentage field using same custom matcher',
      default: 75,
    },

    // 5. Standard field (no custom widget)
    notes: {
      type: 'string',
      title: 'Notes (Standard Widget)',
      description: 'Uses default textarea widget - no custom widget applied',
      'x:ui': 'textarea',
    },
  },
  required: ['email', 'userId'],
  additionalProperties: false,
}

const customWidgetsData = {
  email: 'user@example.com',
  userId: '550e8400-e29b-41d4-a716-446655440000',
  apiKey: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  phone: '+1 (555) 123-4567',
  completion: 50,
  progress: 75,
  notes: 'This field uses the standard widget',
}

export default function JSONSchemaCustomWidgetsPage() {
  const data = prop(customWidgetsData)
  const validation = prop<ControllerValidation>(Validation.valid)

  // Define custom widgets with different matching strategies
  const customWidgets: CustomWidgetRegistration[] = [
    // 1. Explicit x:ui matching - highest priority
    forXUI('fancy-email', FancyEmailWidget as WidgetFactory<unknown>, {
      displayName: 'Fancy Email Widget',
      priority: 100,
    }),

    // 2. Format-based matching - matches ALL uuid format fields
    forFormat('uuid', UuidWidget as WidgetFactory<unknown>, {
      displayName: 'UUID Widget',
      priority: 75,
    }),

    // 3. Type + Format matching
    forTypeAndFormat('string', 'phone', PhoneWidget as WidgetFactory<unknown>, {
      displayName: 'Phone Widget',
      priority: 80,
    }),

    // 4. Custom matcher function - most flexible
    {
      factory: PercentageWidget as WidgetFactory<unknown>,
      displayName: 'Percentage Slider',
      description: 'Custom slider for percentage values (0-100)',
      priority: 85,
      matcher: (ctx: SchemaContext) => {
        const schema = ctx.definition
        return (
          typeof schema === 'object' &&
          schema.type === 'number' &&
          schema.minimum === 0 &&
          schema.maximum === 100
        )
      },
    },
  ]

  return ScrollablePanel({
    body: Group(
      attr.class('items-start gap-4 p-4 h-full overflow-hidden'),

      // Left: Documentation
      ScrollablePanel(
        {
          header: html.h3(
            attr.class('text-lg font-semibold'),
            'Custom Widgets Documentation'
          ),
          body: Stack(
            attr.class('gap-4 text-sm'),

            html.section(
              html.h4(
                attr.class('font-semibold text-base mb-2'),
                '📚 Custom Widget Matching'
              ),
              html.p(
                attr.class('mb-2'),
                'BeatUI supports four ways to match custom widgets to schema fields:'
              ),

              html.ol(
                attr.class('list-decimal pl-5 space-y-2'),

                html.li(
                  html.strong('Explicit x:ui matching'),
                  ' - Use ',
                  html.code(
                    attr.class('bg-gray-100 px-1 rounded'),
                    "forXUI('widget-name', factory)"
                  ),
                  html.br(),
                  html.span(
                    attr.class('text-xs text-gray-600'),
                    'Matches schema fields with x:ui property'
                  )
                ),

                html.li(
                  html.strong('Format-based matching'),
                  ' - Use ',
                  html.code(
                    attr.class('bg-gray-100 px-1 rounded'),
                    "forFormat('uuid', factory)"
                  ),
                  html.br(),
                  html.span(
                    attr.class('text-xs text-gray-600'),
                    'Matches ALL fields with specific format'
                  )
                ),

                html.li(
                  html.strong('Type + Format matching'),
                  ' - Use ',
                  html.code(
                    attr.class('bg-gray-100 px-1 rounded'),
                    "forTypeAndFormat('string', 'phone', factory)"
                  ),
                  html.br(),
                  html.span(
                    attr.class('text-xs text-gray-600'),
                    'Matches specific type + format combinations'
                  )
                ),

                html.li(
                  html.strong('Custom matcher function'),
                  ' - Full ',
                  html.code(
                    attr.class('bg-gray-100 px-1 rounded'),
                    'matcher: (ctx) => boolean'
                  ),
                  html.br(),
                  html.span(
                    attr.class('text-xs text-gray-600'),
                    'Most flexible - inspect SchemaContext and decide'
                  )
                )
              )
            ),

            html.section(
              html.h4(
                attr.class('font-semibold text-base mb-2'),
                '🎯 Widget Resolution Precedence'
              ),
              html.ol(
                attr.class('list-decimal pl-5 space-y-1 text-xs'),
                html.li('Explicit x:ui in custom registry (highest)'),
                html.li('Explicit x:ui in global registry'),
                html.li('Custom widgets with matcher functions (by priority)'),
                html.li('Global registry matchers'),
                html.li('Built-in format mappings and defaults (lowest)')
              )
            ),

            html.section(
              html.h4(attr.class('font-semibold text-base mb-2'), '💡 Example'),
              html.pre(
                attr.class('bg-gray-50 p-3 rounded text-xs overflow-x-auto'),
                html.code(
                  `import { JSONSchemaForm, forXUI, forFormat } from '@tempots/beatui/json-schema'

JSONSchemaForm({
  schema,
  initialValue: data,
  customWidgets: [
    // Match by x:ui
    forXUI('fancy-email', MyEmailWidget),

    // Match ALL uuid fields
    forFormat('uuid', MyUuidWidget),

    // Match specific type+format
    forTypeAndFormat('string', 'phone', MyPhoneWidget),

    // Custom matcher
    {
      name: 'percentage',
      factory: MySliderWidget,
      matcher: (ctx) => {
        const schema = ctx.definition
        return schema.type === 'number' &&
               schema.minimum === 0 &&
               schema.maximum === 100
      }
    }
  ]
}, ({ Form }) => Form)`
                )
              )
            )
          ),
        },
        style.width('40%'),
        style.minWidth('20rem')
      ),

      // Right: Live Form
      Stack(
        attr.class('gap-2 h-full overflow-hidden'),
        style.width('60%'),

        ScrollablePanel({
          header: html.h3(
            attr.class('text-lg font-semibold'),
            'Live Demo with Custom Widgets'
          ),
          body: JSONSchemaForm(
            {
              schema: customWidgetsSchema,
              initialValue: data,
              customWidgets,
            },
            ({ Form, controller }) => {
              controller.signal.feedProp(data)
              controller.status.feedProp(validation)
              return Form
            }
          ),
        }),

        ScrollablePanel(
          {
            header: Group(
              attr.class('gap-2 items-center justify-between'),
              html.h3(attr.class('text-base font-semibold'), 'Form Data'),
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  roundedness: 'md',
                  onClick: () => data.set(customWidgetsData),
                },
                'Reset'
              )
            ),
            body: html.pre(
              attr.class('whitespace-pre-wrap text-sm'),
              data.map(v => JSON.stringify(v, null, 2))
            ),
          },
          style.height('40%')
        )
      )
    ),
  })
}
