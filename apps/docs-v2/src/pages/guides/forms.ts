import {
  ScrollablePanel,
  Stack,
  Card,
  Icon,
  Group,
  useController,
  Control,
  TextInput,
  NumberInput,
  CheckboxInput,
  DropdownControl,
  NativeSelectControl,
  ListControl,
  Option,
} from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { Validation } from '@tempots/std'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Forms',
  description:
    'Build type-safe forms with Zod schemas, reactive controllers, and the Control wrapper for validation display.',
}

// ---------------------------------------------------------------------------
// Section 1 — useForm + Zod schema
// ---------------------------------------------------------------------------

const USE_FORM_CODE = `import { useForm, Control, TextInput, NumberInput } from '@tempots/beatui'
import { z } from 'zod'

const { controller } = useForm({
  schema: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    age: z.number().min(18, 'Must be at least 18'),
  }),
  validationMode: 'eager',
  initialValue: { name: '', email: '', age: 0 },
})`

// ---------------------------------------------------------------------------
// Section 2 — Control component
// ---------------------------------------------------------------------------

const CONTROL_CODE = `Control(TextInput, {
  controller: controller.field('name'),
  label: 'Full Name',
  description: 'Enter your legal name',
  layout: 'vertical', // or 'horizontal', 'horizontal-label-right', 'horizontal-fixed'
})`

// ---------------------------------------------------------------------------
// Section 3 — Layout options
// ---------------------------------------------------------------------------

const LAYOUT_CODE = `// vertical (default) — label above input
Control(TextInput, {
  controller: controller.field('name'),
  label: 'Name',
  layout: 'vertical',
})

// horizontal — label left, input right
Control(TextInput, {
  controller: controller.field('name'),
  label: 'Name',
  layout: 'horizontal',
})

// horizontal-label-right — input left, label right
Control(TextInput, {
  controller: controller.field('name'),
  label: 'Name',
  layout: 'horizontal-label-right',
})

// horizontal-fixed — label left with fixed CSS width
Control(TextInput, {
  controller: controller.field('name'),
  label: 'Name',
  layout: 'horizontal-fixed',
  labelWidth: '10rem',
})`

// ---------------------------------------------------------------------------
// Section 4 — Dropdown & Select
// ---------------------------------------------------------------------------

const DROPDOWN_CODE = `import { DropdownControl, Option, Icon } from '@tempots/beatui'

DropdownControl({
  controller: controller.field('role'),
  label: 'Role',
  description: 'Select the user role',
  options: [
    Option.value('admin', 'Administrator', {
      before: Icon({ icon: 'lucide:shield', size: 'xs' }),
    }),
    Option.value('editor', 'Editor', {
      before: Icon({ icon: 'lucide:pencil', size: 'xs' }),
    }),
    Option.break,
    Option.value('viewer', 'Viewer (read-only)', {
      before: Icon({ icon: 'lucide:eye', size: 'xs' }),
      after: Badge({ variant: 'light', color: 'success', size: 'xs' }, 'Free'),
    }),
  ],
})`

const NATIVE_SELECT_CODE = `import { NativeSelectControl, Option } from '@tempots/beatui'

// Simpler native <select> — better for long lists or mobile UX
NativeSelectControl({
  controller: controller.field('country'),
  label: 'Country',
  options: [
    Option.value('us', 'United States'),
    Option.value('gb', 'United Kingdom'),
    Option.value('ca', 'Canada'),
    Option.value('au', 'Australia'),
  ],
})`

// ---------------------------------------------------------------------------
// Section 5 — List controls
// ---------------------------------------------------------------------------

const LIST_CODE = `import { useForm, ListControl, Control, TextInput } from '@tempots/beatui'
import { z } from 'zod'

const { controller } = useForm({
  schema: z.object({
    experience: z.array(
      z.object({
        company: z.string().min(1, 'Company name is required'),
        role: z.string().min(1, 'Role is required'),
      })
    ),
  }),
  initialValue: { experience: [] },
})

// Access the ArrayController for the 'experience' field
const list = controller.field('experience').array()

ListControl({
  controller: list,
  label: 'Work Experience',
  description: 'Add your previous positions',
  createItem: () => ({ company: '', role: '' }),
  element: ({ item }) => {
    const entry = item.object()
    return Stack(
      attr.class('gap-2'),
      Control(TextInput, {
        controller: entry.field('company'),
        label: 'Company',
        placeholder: 'Acme Corp',
      }),
      Control(TextInput, {
        controller: entry.field('role'),
        label: 'Role',
        placeholder: 'Software Engineer',
      }),
    )
  },
})`

// ---------------------------------------------------------------------------
// Section 6 — Union types / transform
// ---------------------------------------------------------------------------

const UNION_CODE = `import { useForm, Control, TextInput, NumberInput, DropdownControl, Option } from '@tempots/beatui'
import { z } from 'zod'

const { controller } = useForm({
  schema: z.object({
    delaySetting: z.union([
      z.literal('none'),
      z.literal('short'),
      z.object({ delay: z.number().min(1) }),
    ]),
  }),
  initialValue: { delaySetting: 'none' as 'none' | 'short' | { delay: number } },
})

const delaySetting = controller.field('delaySetting')

// Transform the union field to a string discriminator for a dropdown
const delayChoices = delaySetting.transform(
  v => (typeof v === 'string' ? v : 'custom'),
  v => (v === 'custom' ? { delay: 100 } : v)
)

// Render a dropdown bound to the transformed string controller
DropdownControl({
  controller: delayChoices,
  label: 'Delay Setting',
  options: [
    Option.value('none', 'No delay'),
    Option.value('short', 'Short (system default)'),
    Option.value('custom', 'Custom delay\u2026'),
  ],
})`

// ---------------------------------------------------------------------------
// Live demos — useController with custom validate functions (no zod needed)
// ---------------------------------------------------------------------------

type DemoFormValue = {
  name: string
  email: string
  age: number
  accept: boolean
}

function validateDemoForm(v: DemoFormValue) {
  const errors: Record<string, { message: string }> = {}
  if (!v.name || v.name.trim().length === 0) errors['name'] = { message: 'Name is required' }
  if (!v.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    errors['email'] = { message: 'Enter a valid email' }
  if (typeof v.age !== 'number' || v.age < 18)
    errors['age'] = { message: 'Must be at least 18' }
  if (!v.accept) errors['accept'] = { message: 'You must accept the terms' }

  if (Object.keys(errors).length === 0) return Validation.valid
  return Validation.invalid({ dependencies: errors })
}

// Valid-state demo form
const validForm = useController<DemoFormValue>({
  validate: v => validateDemoForm(v),
  validationMode: 'eager',
  initialValue: {
    name: 'Taylor Otwell',
    email: 'taylor@example.com',
    age: 32,
    accept: true,
  },
})
const validCtrl = validForm.controller.object()

// Trigger eager validation so the valid state is visible immediately
validCtrl.change(validCtrl.signal.value)

// Error-state demo form — pre-filled with invalid data
const errorForm = useController<DemoFormValue>({
  validate: v => validateDemoForm(v),
  validationMode: 'eager',
  initialValue: {
    name: '',
    email: 'not-an-email',
    age: 12,
    accept: false,
  },
})
const errorCtrl = errorForm.controller.object()

// Trigger validation to surface errors immediately on render
errorCtrl.change(errorCtrl.signal.value)

// Layout demo — standalone controller, no validation needed
const layoutCtrl = useController<{ name: string }>({
  validationMode: 'eager',
  initialValue: { name: 'Jane Doe' },
}).controller.object()

export default function FormsGuidePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // ------------------------------------------------------------------ //
      // Page header
      // ------------------------------------------------------------------ //
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Forms'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI ships a fully type-safe form system built on reactive controllers. Define your schema once with Zod, connect inputs with ',
          html.code(
            attr.class(
              'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
            ),
            'Control()'
          ),
          ', and get label, description, and live validation display for free — no boilerplate.'
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 1: useForm + Zod Schema
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:file-check', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'useForm + Zod Schema')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'useForm()'
            ),
            ' creates a reactive form controller from any ',
            html.a(
              attr.href('https://standardschema.dev'),
              attr.target('_blank'),
              attr.class(
                'text-primary-600 dark:text-primary-400 hover:underline'
              ),
              'Standard Schema v1'
            ),
            ' validator, including Zod. Pass a ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'validationMode'
            ),
            ' of ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              "'eager'"
            ),
            ' to validate as the user types, ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              "'onTouched'"
            ),
            ' to validate after blur, or ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              "'onSubmit'"
            ),
            ' (default) to only validate on form submission.'
          ),
          CodeBlock(USE_FORM_CODE, 'typescript'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The returned ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'controller'
            ),
            ' is an ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'ObjectController<T>'
            ),
            ' that exposes per-field controllers via ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              '.field(key)'
            ),
            '. Each field controller carries its own reactive value, error, touched, and disabled signals.'
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 2: The Control Component
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layout-grid', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'The Control Component'
            )
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Control(InputComponent, options)'
            ),
            ' wraps any BeatUI input with an ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'InputWrapper'
            ),
            ' that provides label, description, and reactive validation error display. It automatically wires the ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'controller'
            ),
            "'s value, disabled, and error signals to the underlying input — no manual binding required."
          ),
          CodeBlock(CONTROL_CODE, 'typescript'),

          // Live demo — valid vs error side by side
          html.div(
            attr.class('space-y-2'),
            html.p(
              attr.class(
                'text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide'
              ),
              'Live demo — valid state vs. error state'
            ),
            Group(
              attr.class('items-start gap-4 flex-wrap'),

              // Valid state card
              Card(
                {},
                html.div(
                  attr.class('space-y-1 mb-3'),
                  html.p(
                    attr.class('text-sm font-medium text-green-600 dark:text-green-400'),
                    'Valid state'
                  ),
                  html.p(
                    attr.class('text-xs text-gray-500 dark:text-gray-400'),
                    'Pre-filled with valid data, eager validation active'
                  )
                ),
                Stack(
                  attr.class('gap-3 min-w-64'),
                  Control(TextInput, {
                    controller: validCtrl.field('name'),
                    label: 'Full Name',
                    description: 'Enter your legal name',
                    triggerOn: 'input',
                  }),
                  Control(TextInput, {
                    controller: validCtrl.field('email'),
                    label: 'Email Address',
                    triggerOn: 'input',
                  }),
                  Control(NumberInput, {
                    controller: validCtrl.field('age'),
                    label: 'Age',
                    triggerOn: 'input',
                  }),
                  Control(CheckboxInput, {
                    controller: validCtrl.field('accept'),
                    label: 'Accept terms and conditions',
                  })
                )
              ),

              // Error state card
              Card(
                {},
                html.div(
                  attr.class('space-y-1 mb-3'),
                  html.p(
                    attr.class('text-sm font-medium text-red-600 dark:text-red-400'),
                    'Error state'
                  ),
                  html.p(
                    attr.class('text-xs text-gray-500 dark:text-gray-400'),
                    'Pre-filled with invalid data, errors shown immediately'
                  )
                ),
                Stack(
                  attr.class('gap-3 min-w-64'),
                  Control(TextInput, {
                    controller: errorCtrl.field('name'),
                    label: 'Full Name',
                    description: 'Enter your legal name',
                    triggerOn: 'input',
                  }),
                  Control(TextInput, {
                    controller: errorCtrl.field('email'),
                    label: 'Email Address',
                    triggerOn: 'input',
                  }),
                  Control(NumberInput, {
                    controller: errorCtrl.field('age'),
                    label: 'Age',
                    triggerOn: 'input',
                  }),
                  Control(CheckboxInput, {
                    controller: errorCtrl.field('accept'),
                    label: 'Accept terms and conditions',
                  })
                )
              )
            )
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 3: Layout Options
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:sliders-horizontal', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Layout Options')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'layout'
            ),
            ' option controls how the label is positioned relative to the input. Four modes are available.'
          ),
          CodeBlock(LAYOUT_CODE, 'typescript'),
          html.div(
            attr.class('space-y-2'),
            html.p(
              attr.class(
                'text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide'
              ),
              'Live demo'
            ),
            Stack(
              attr.class('gap-4'),
              html.div(
                attr.class('space-y-1'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  html.code(
                    attr.class('font-mono'),
                    "layout: 'vertical'"
                  ),
                  ' — label above (default)'
                ),
                html.div(
                  attr.class('max-w-xs'),
                  Control(TextInput, {
                    controller: layoutCtrl.field('name'),
                    label: 'Full Name',
                    layout: 'vertical',
                    triggerOn: 'input',
                  })
                )
              ),
              html.div(
                attr.class('space-y-1'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  html.code(
                    attr.class('font-mono'),
                    "layout: 'horizontal'"
                  ),
                  ' — label left'
                ),
                Control(TextInput, {
                  controller: layoutCtrl.field('name'),
                  label: 'Full Name',
                  layout: 'horizontal',
                  triggerOn: 'input',
                })
              ),
              html.div(
                attr.class('space-y-1'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  html.code(
                    attr.class('font-mono'),
                    "layout: 'horizontal-label-right'"
                  ),
                  ' — label right'
                ),
                Control(TextInput, {
                  controller: layoutCtrl.field('name'),
                  label: 'Full Name',
                  layout: 'horizontal-label-right',
                  triggerOn: 'input',
                })
              ),
              html.div(
                attr.class('space-y-1'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  html.code(
                    attr.class('font-mono'),
                    "layout: 'horizontal-fixed'"
                  ),
                  ' — fixed-width label (10rem)'
                ),
                Control(TextInput, {
                  controller: layoutCtrl.field('name'),
                  label: 'Full Name',
                  layout: 'horizontal-fixed',
                  labelWidth: '10rem',
                  triggerOn: 'input',
                })
              )
            )
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 4: Dropdown & Select Controls
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:toggle-left', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Dropdown & Select Controls'
            )
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'DropdownControl'
            ),
            ' is the recommended choice for short option lists — it renders a custom-styled popover with full keyboard support, icon slots, grouping, and separators. Use ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Option.value()'
            ),
            ' to build type-safe options with optional ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'before'
            ),
            ' / ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'after'
            ),
            ' slots.'
          ),
          CodeBlock(DROPDOWN_CODE, 'typescript'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'NativeSelectControl'
            ),
            ' renders a native ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              '<select>'
            ),
            ' element. It is a good fit for long lists, mobile UX, or cases where native browser behaviour is preferred.'
          ),
          CodeBlock(NATIVE_SELECT_CODE, 'typescript'),

          // Live demo for dropdown and native select
          html.div(
            attr.class('space-y-2'),
            html.p(
              attr.class(
                'text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide'
              ),
              'Live demo'
            ),
            Group(
              attr.class('items-start gap-6 flex-wrap'),
              html.div(
                attr.class('space-y-1'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  'DropdownControl'
                ),
                html.div(
                  attr.class('min-w-52'),
                  DropdownControl({
                    controller: useController<string>({
                      initialValue: 'editor',
                    }).controller,
                    label: 'Role',
                    description: 'Select the user role',
                    options: [
                      Option.value('admin', 'Administrator'),
                      Option.value('editor', 'Editor'),
                      Option.break,
                      Option.value('viewer', 'Viewer (read-only)'),
                    ],
                  })
                )
              ),
              html.div(
                attr.class('space-y-1'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  'NativeSelectControl'
                ),
                html.div(
                  attr.class('min-w-52'),
                  NativeSelectControl({
                    controller: useController<string>({
                      initialValue: 'us',
                    }).controller,
                    label: 'Country',
                    options: [
                      Option.value('us', 'United States'),
                      Option.value('gb', 'United Kingdom'),
                      Option.value('ca', 'Canada'),
                      Option.value('au', 'Australia'),
                    ],
                  })
                )
              )
            )
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 5: List Controls
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:list', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'List Controls')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'ListControl'
            ),
            ' manages a dynamic array of sub-forms. Call ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              ".field('items').array()"
            ),
            ' on an ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'ObjectController'
            ),
            ' to get an ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'ArrayController'
            ),
            ', then pass it along with an ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'element'
            ),
            ' render function and a ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'createItem'
            ),
            ' factory. BeatUI handles add, remove, and reorder buttons automatically.'
          ),
          CodeBlock(LIST_CODE, 'typescript'),

          // Live demo
          html.div(
            attr.class('space-y-2'),
            html.p(
              attr.class(
                'text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide'
              ),
              'Live demo'
            ),
            html.div(
              attr.class('max-w-lg'),
              (() => {
                const listDemoCtrl = useController<string[]>({
                  validationMode: 'eager',
                  initialValue: ['BeatUI', 'TypeScript'],
                })
                const list = listDemoCtrl.controller.array()
                return ListControl({
                  controller: list,
                  label: 'Tags',
                  description: 'Add tags to categorize this item',
                  createItem: () => '',
                  element: ({ item }) =>
                    Control(TextInput, {
                      controller: item,
                      label: '',
                      placeholder: 'Enter a tag',
                      triggerOn: 'input',
                    }),
                })
              })()
            )
          )
        )
      ),

      // ------------------------------------------------------------------ //
      // Section 6: Union Types
      // ------------------------------------------------------------------ //
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:git-branch', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Union Types')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'When a field holds a discriminated union (e.g., ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              "'none' | 'short' | { delay: number }"
            ),
            '), use ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'controller.field(key).transform(toInput, fromInput)'
            ),
            ' to project the union onto a simpler type for the dropdown, then map selections back to the union value. This keeps your schema honest while keeping the UI simple.'
          ),
          CodeBlock(UNION_CODE, 'typescript'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'transform()'
            ),
            ' method is available on any ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'Controller<T>'
            ),
            ' and creates a derived controller whose changes are automatically propagated back through the ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
              ),
              'fromInput'
            ),
            ' function to the parent controller — no manual wiring needed.'
          )
        )
      )
    ),
  })
}
