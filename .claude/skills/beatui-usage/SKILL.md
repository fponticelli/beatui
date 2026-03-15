---
name: beatui-usage
description: "Build UIs with the @tempots/beatui component library. Use when writing application code that imports or uses BeatUI components — buttons, forms, overlays, layout, tables, icons, theming, notifications, or routing."
---

## Role

You are an expert at building applications with the `@tempots/beatui` component library and the `@tempots/dom` reactive framework. You know the component APIs, the form system, theming, notifications, icons, and how to compose them into full application UIs.

BeatUI components are plain TypeScript functions — no JSX, no class syntax. They return `TNode` values composed via `@tempots/dom` element factories.

---

## Installation & Setup

### Dependencies

```bash
pnpm add @tempots/beatui @tempots/dom @tempots/ui @tempots/std @tempots/core
```

### App Root

Wrap your app in `BeatUI()` — it sets up theme, locale, routing, i18n, and notifications:

```typescript
import { render } from '@tempots/dom'
import { BeatUI } from '@tempots/beatui'

render(
  BeatUI(
    {
      enableAppearance: true,                // Light/dark mode (default: true)
      defaultAppearance: 'system',           // 'system' | 'light' | 'dark'
      includeNotifications: true,            // Notification system (default: true)
      notificationPosition: 'bottom-end',    // 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
      includeAuthI18n: false,                // Auth translation strings
    },
    MyApp()
  ),
  document.getElementById('app')!
)
```

### CSS Import

**With Tailwind v4 (recommended):**

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'

export default defineConfig({
  plugins: [
    tailwindcss(),
    beatuiTailwindPlugin({
      semanticColors: {
        primary: 'sky',
        secondary: 'cyan',
      },
    }),
  ],
})
```

```css
/* main.css */
@import 'tailwindcss';
@custom-variant dark (&:is(.dark *));
```

**Without Tailwind:**

```typescript
import '@tempots/beatui/css'
```

---

## @tempots/dom Essentials

### Reactivity

```typescript
import { prop, computedOf, Value } from '@tempots/dom'

const count = prop(0)              // Mutable signal
count.set(5)                       // Update
count.update(n => n + 1)           // Update with function
const doubled = count.map(n => n * 2)  // Derived signal

Value.get(count)                   // Read current value (works on static or signal)
Value.on(count, v => console.log(v))   // Subscribe to changes
```

### DOM Construction

```typescript
import { html, attr, style, on, aria } from '@tempots/dom'

html.div(
  attr.class('my-class'),
  attr.id('main'),
  style.color('red'),
  on.click((e, ctx) => console.log('clicked')),
  aria.label('Main content'),
  html.span('Hello'),
  html.p('World')
)
```

### Conditional & Dynamic Rendering

```typescript
import { When, Fragment, Empty, MapSignal } from '@tempots/dom'

// Conditional
When(isVisible, () => html.div('Shown'), () => html.div('Hidden'))

// Dynamic children from signal
MapSignal(items, itemList =>
  html.ul(...itemList.map(item => html.li(item.name)))
)

// Optional nodes
onBlur ? on.blur(handler) : Empty

// Grouping without wrapper
Fragment(child1, child2, child3)
```

### Providers

```typescript
import { Use, Provide } from '@tempots/dom'

// Consume a provider
Use(Theme, ({ appearance, setAppearancePreference }) => {
  return html.div(appearance.map(a => `Current: ${a}`))
})
```

### CRITICAL Rules

1. **NEVER** return `computedOf(...)` as a root `TNode` — use `When()` or `MapSignal()` for conditional/dynamic rendering.
2. **NEVER** use `computedOf(...)` to conditionally return attribute nodes.
3. **DO** use `When(condition, thenFn, elseFn)` for conditional rendering.
4. **DO** use `MapSignal(signal, fn)` for reactive child content.
5. **ALWAYS** wrap `Collapse()` in its own `html.div()` wrapper.

---

## Available Entry Points

| Import | Purpose |
|--------|---------|
| `@tempots/beatui` | Core components (buttons, forms, layout, overlays, data, navigation, typography) |
| `@tempots/beatui/auth` | Authentication UI components |
| `@tempots/beatui/json-schema` | JSON Schema form generation |
| `@tempots/beatui/json-structure` | JSON structure forms |
| `@tempots/beatui/monaco` | Monaco editor integration |
| `@tempots/beatui/markdown` | Markdown rendering |
| `@tempots/beatui/prosemirror` | ProseMirror editor integration |
| `@tempots/beatui/lexical` | Lexical editor integration |
| `@tempots/beatui/codehighlight` | Code syntax highlighting |
| `@tempots/beatui/better-auth` | Better-auth bridge layer |
| `@tempots/beatui/tailwind` | Tailwind preset & Vite plugin |
| `@tempots/beatui/css` | Pre-built CSS stylesheet |

---

## Component Patterns

All components follow: **`ComponentName(options, ...children): TNode`**

Options accept `Value<T>` — pass static values or reactive signals interchangeably.

### Buttons

```typescript
import { Button, CloseButton, ToggleButton, Icon } from '@tempots/beatui'

// Basic
Button({ variant: 'filled', color: 'primary', size: 'md' }, 'Save')

// With icon
Button(
  { variant: 'outline', onClick: () => save() },
  Icon({ icon: 'lucide:save', size: 'sm' }),
  'Save'
)

// Loading state
Button({ loading: true, disabled: true }, 'Saving...')

// All variants: 'filled' | 'light' | 'outline' | 'dashed' | 'default' | 'subtle' | 'text'
// All sizes: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Close button (X icon)
CloseButton({ onClick: () => close(), size: 'sm' })

// Toggle button
const active = prop(false)
ToggleButton({ value: active, onChange: v => active.set(v) }, 'Bold')
```

### Form Inputs

```typescript
import { TextInput, NumberInput, CheckboxInput, Switch, NativeSelect, TextareaInput } from '@tempots/beatui'
import { prop } from '@tempots/dom'

// Text
const name = prop('')
TextInput({
  value: name,
  onInput: v => name.set(v),
  placeholder: 'Enter name',
  size: 'md',
  disabled: false,
  hasError: false,
})

// Number
const age = prop(0)
NumberInput({ value: age, onChange: v => age.set(v), min: 0, max: 120 })

// Checkbox
const agreed = prop(false)
CheckboxInput({ value: agreed, onChange: v => agreed.set(v), label: 'I agree' })

// Switch (toggle)
const enabled = prop(true)
Switch({ value: enabled, onChange: v => enabled.set(v), label: 'Enable feature' })

// Select
const role = prop('editor')
NativeSelect({
  value: role,
  onChange: v => role.set(v),
  options: [
    { value: 'admin', label: 'Administrator' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ],
})

// Textarea
const bio = prop('')
TextareaInput({ value: bio, onInput: v => bio.set(v), rows: 4 })

// Input with icons (before/after slots)
TextInput({
  value: search,
  onInput: v => search.set(v),
  before: Icon({ icon: 'lucide:search', size: 'sm' }),
  after: CloseButton({ onClick: () => search.set(''), size: 'xs' }),
})
```

### Form System (with Validation)

```typescript
import { useForm, Control, TextInput, NumberInput } from '@tempots/beatui'
import { z } from 'zod'

const { controller } = useForm({
  schema: z.object({
    name: z.string().min(1, 'Required'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be 18+'),
  }),
  validationMode: 'eager',       // 'eager' | 'onTouched' | 'onSubmit'
  initialValue: { name: '', email: '', age: 0 },
})

// Each field gets a controller
const nameCtrl = controller.field('name')
const emailCtrl = controller.field('email')
const ageCtrl = controller.field('age')

// Control wraps input + label + error display
html.form(
  Control(TextInput, {
    controller: nameCtrl,
    label: 'Full Name',
    description: 'As shown on your ID',
    layout: 'vertical',           // 'vertical' | 'horizontal' | 'horizontal-fixed'
  }),
  Control(TextInput, {
    controller: emailCtrl,
    label: 'Email',
  }),
  Control(NumberInput, {
    controller: ageCtrl,
    label: 'Age',
  }),
  Button(
    { type: 'submit', disabled: controller.hasError },
    'Submit'
  )
)
```

**Controller API:**
```typescript
ctrl.signal.value          // Current value
ctrl.hasError              // Boolean — has validation error
ctrl.touched               // User has interacted
ctrl.dirty                 // Value differs from initial
ctrl.errorVisible          // Should show error (respects validationMode)
ctrl.disabled              // Is disabled
```

**Array fields:**
```typescript
const tagsCtrl = controller.field('tags').array()
tagsCtrl.push('new-tag')
tagsCtrl.removeAt(0)
tagsCtrl.move(from, to)
tagsCtrl.item(0)           // Controller for specific item
tagsCtrl.length.value      // Reactive length
```

### Overlays

```typescript
import { Modal, Drawer, Tooltip, Popover, Button } from '@tempots/beatui'

// Modal — render function pattern with (open, close) callbacks
Modal(
  { size: 'md', position: 'center', dismissable: true, showCloseButton: true },
  (open, close) =>
    Button(
      {
        onClick: () => open({
          header: html.h2('Confirm Action'),
          body: html.p('Are you sure you want to proceed?'),
          footer: Fragment(
            Button({ variant: 'default', onClick: close }, 'Cancel'),
            Button({ variant: 'filled', color: 'danger', onClick: () => { doIt(); close() } }, 'Delete'),
          ),
        }),
      },
      'Open Modal'
    )
)

// Drawer — slides from edge
Drawer(
  { side: 'right', size: 'md' },
  (open, close) =>
    Button({ onClick: () => open({ body: SettingsPanel() }) }, 'Settings')
)

// Tooltip
Tooltip({ content: 'Helpful info', position: 'top' },
  Button({}, 'Hover me')
)

// Popover
Popover(
  { position: 'bottom', trigger: 'click' },
  (open, close) => Button({ onClick: open }, 'Click me'),
  html.div('Popover content')
)
```

### Layout

```typescript
import { Card, CardHeader, CardBody, CardFooter, Accordion, AccordionItem, Collapse, AppShell } from '@tempots/beatui'

// Card
Card(
  { variant: 'elevated', size: 'md' },
  CardHeader({}, html.h3('Title')),
  CardBody({}, html.p('Content here')),
  CardFooter({}, Button({}, 'Action'))
)

// Accordion
Accordion(
  { multiple: false },
  AccordionItem({ label: 'Section 1' }, html.p('Content 1')),
  AccordionItem({ label: 'Section 2' }, html.p('Content 2')),
)

// Collapse (MUST wrap in own div!)
const isOpen = prop(false)
html.div(
  Collapse({ open: isOpen }, html.div('Collapsible content'))
)
```

### Data Display

```typescript
import { Table, Tabs, Tab, Tree, Badge, Avatar, Pagination } from '@tempots/beatui'

// Table
Table(
  { hoverable: true, withStripedRows: true, fullWidth: true, size: 'md' },
  html.thead(html.tr(html.th('Name'), html.th('Email'))),
  html.tbody(
    html.tr(html.td('Alice'), html.td('alice@example.com')),
    html.tr(html.td('Bob'), html.td('bob@example.com')),
  )
)

// Tabs
const activeTab = prop('tab1')
Tabs(
  { value: activeTab, onChange: v => activeTab.set(v) },
  Tab({ value: 'tab1', label: 'Overview' }, html.p('Overview content')),
  Tab({ value: 'tab2', label: 'Settings' }, html.p('Settings content')),
)

// Badge
Badge({ color: 'success', variant: 'filled' }, 'Active')

// Avatar
Avatar({ src: '/photo.jpg', name: 'Alice', size: 'md' })

// Pagination
const page = prop(1)
Pagination({ value: page, total: 100, pageSize: 10, onChange: v => page.set(v) })
```

### Navigation

```typescript
import { Link, Breadcrumbs, BreadcrumbItem, NavigationProgress } from '@tempots/beatui'

// Client-side link
Link({ href: '/dashboard', color: 'primary' }, 'Dashboard')

// External link
Link({ href: 'https://example.com', target: '_blank' }, 'External')

// Breadcrumbs
Breadcrumbs({},
  BreadcrumbItem({ href: '/' }, 'Home'),
  BreadcrumbItem({ href: '/products' }, 'Products'),
  BreadcrumbItem({}, 'Widget'),
)
```

---

## Icons

```typescript
import { Icon } from '@tempots/beatui'

Icon({
  icon: 'lucide:home',              // Iconify format: 'collection:name'
  size: 'md',                        // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color: 'primary',                 // Theme color name
  tone: 'solid',                     // 'solid' | 'soft'
  title: 'Home',                    // Accessible label
})

// Common icon sets: 'lucide:', 'mdi:', 'heroicons:', 'tabler:'
// Full list at https://icon-sets.iconify.design/
```

---

## Notifications

```typescript
import { NotificationService } from '@tempots/beatui'

// Success
NotificationService.show(
  { title: 'Saved', color: 'success', icon: 'lucide:check', dismissAfter: 3 },
  'Your changes have been saved.'
)

// Error
NotificationService.show(
  { title: 'Error', color: 'danger', icon: 'lucide:alert-circle', showCloseButton: true },
  'Something went wrong.'
)

// Loading (dismiss on promise resolution)
NotificationService.show(
  { title: 'Uploading', loading: true, dismissAfter: uploadPromise },
  'Please wait...'
)

// Clear all
NotificationService.clear()
```

---

## Theme

```typescript
import { Use } from '@tempots/dom'
import { Theme, StandaloneAppearanceSelector } from '@tempots/beatui'

// Theme toggle widget
StandaloneAppearanceSelector({ size: 'sm' })

// Programmatic theme access
Use(Theme, ({ appearance, setAppearancePreference }) => {
  // appearance: Signal<'light' | 'dark'>
  // setAppearancePreference('dark')  // or 'light' or 'system'

  return When(
    appearance.map(a => a === 'dark'),
    () => html.span('Dark mode'),
    () => html.span('Light mode'),
  )
})
```

### Customizing Design Tokens

```typescript
// vite.config.ts
beatuiTailwindPlugin({
  semanticColors: {
    primary: 'emerald',           // Remap primary color palette
    secondary: 'violet',
    // base, success, warning, danger, info also available
  },
})
```

CSS variables available: `--color-primary-50` through `--color-primary-950`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--font-size-*`, `--z-*`, `--motion-*`.

---

## i18n / Locale

```typescript
import { Use } from '@tempots/dom'
import { Locale, LocaleSelector } from '@tempots/beatui'

// Language selector widget
LocaleSelector({ size: 'sm' })

// Programmatic locale access
Use(Locale, ({ setLocale, locale, direction }) => {
  // locale: Signal<string> — e.g., 'en', 'es', 'ar'
  // direction: Signal<'ltr' | 'rtl'>
  // setLocale('es')
  return html.div(locale.map(l => `Current: ${l}`))
})
```

---

## Common Composition Patterns

### Page Layout

```typescript
import { AppShell, Sidebar, Card } from '@tempots/beatui'

AppShell({
  header: { content: MyHeader() },
  menu: { width: 240, content: MySidebar() },
  main: { content: MyContent() },
})
```

### Responsive Values

```typescript
const size = prop<ControlSize>('md')

// All components react to signal changes
Button({ size, variant: 'filled' }, 'Responsive')

// Change size dynamically
size.set('lg')
```

### Loading States

```typescript
import { Skeleton, LoadingOverlay } from '@tempots/beatui'

// Skeleton placeholder
Skeleton({ width: '100%', height: '2rem', animate: true })

// Loading overlay on existing content
LoadingOverlay({ visible: isLoading }, MyContent())
```

### Empty States

```typescript
import { EmptyState } from '@tempots/beatui'

EmptyState({
  icon: 'lucide:inbox',
  title: 'No results',
  description: 'Try adjusting your search criteria.',
  action: Button({ onClick: resetSearch }, 'Clear filters'),
})
```
