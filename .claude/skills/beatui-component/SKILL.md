---
name: beatui-component
description: "Implement BeatUI components following library patterns, styling conventions, and Tempo best practices. Use when creating new UI components, form inputs, overlays, layout elements, or any component for the @tempots/beatui library."
---

## Role

You are a BeatUI component implementor. You deeply understand the @tempots/dom reactive framework, BeatUI's layered CSS architecture, accessibility best practices, and the library's component conventions. You will implement components that are consistent with the rest of the library.

When given a component to implement, first read existing similar components in the codebase to match patterns exactly.

---

## @tempots/dom Reactive Primitives

### Core Types & Functions

- **`Value<T>`** = `Signal<T> | T` — All component props MUST accept this type so consumers can pass static values or reactive signals.
- **`prop<T>(initialValue)`** — Create a mutable signal with `.set()` and `.update()` methods.
- **`computedOf(...values)(fn, equals?)`** — Derive a computed signal from multiple `Value<T>` dependencies. Accepts mix of signals and static values.
- **`Value.get(v)`** — Extract current value from `Value<T>` (works for both static and signal).
- **`Value.on(v, listener)`** — Subscribe to changes on a `Value<T>`.
- **`Value.toSignal(v)`** — Convert a `Value<T>` to a `Signal<T>`.
- **`Value.map(v, fn)`** — Map a `Value<T>` through a transform function.

### DOM Construction

- **`html.*`** — Element factories: `html.div(...)`, `html.button(...)`, `html.input(...)`, etc.
- **`attr.*`** — Attribute bindings: `attr.class(value)`, `attr.id(value)`, `attr.type(value)`, `attr.disabled(value)`, `attr.style(value)`, etc. All accept `Value<T>`.
- **`style.*`** — Individual style bindings: `style.width(value)`, `style.height(value)`, etc.
- **`on.*`** — Event handlers: `on.click((e, ctx) => ...)`, `on.input(...)`, `on.keydown(...)`, etc.
- **`aria.*`** — ARIA attributes: `aria.label(value)`, `aria.role(value)`, `aria.valuenow(value)`, etc.
- **`dataAttr(name, value)`** — Data attributes.

### Event Helpers

- **`emitValue(fn)`** — Extract `event.target.value` as string and pass to callback.
- **`emitValueAsNumber(fn)`** — Extract as number.
- **`emitChecked(fn)`** — Extract checkbox/radio checked state.
- **`emitTarget(fn)`** — Pass the target element.

### Structural & Conditional

- **`When(condition, thenFn, elseFn?)`** — Conditional rendering with proper disposal of unused branches.
- **`Fragment(...children)`** — Group multiple `TNode` children without a wrapper element.
- **`Empty`** — Renders nothing. Use for conditional exclusion: `onBlur ? on.blur(handler) : Empty`.
- **`MapSignal(signal, fn)`** — Reactively map a signal to a `TNode`. Use when child content depends on signal value.
- **`WithElement(fn: (el: Element) => TNode)`** — Direct DOM element access for imperative operations.
- **`Portal(selector, ...children)`** — Render children into an arbitrary DOM target.
- **`OnDispose(cleanupFn)`** — Register cleanup callback for lifecycle management.

### Provider Pattern (Dependency Injection)

- **`makeProviderMark<T>(name)`** — Create a unique provider symbol.
- **`Provide(Provider, options, ...children)`** — Provide context to children.
- **`Use(Provider, fn: (value) => TNode)`** — Consume a provider value.

### CRITICAL Rules

1. **NEVER** return `computedOf(...)` as a root `TNode` or use it to conditionally return `TNode` children — the reactive region doesn't mount DOM elements properly.
2. **NEVER** use `computedOf(...)` to conditionally return attribute/style `TNode`s (e.g., `computedOf(x)(v => v ? aria.valuenow(n) : undefined)`).
3. **DO** use `When(condition, () => trueNode, () => falseNode)` for conditional rendering.
4. **DO** use `MapSignal(signal, value => TNode)` for reactive child rendering inside elements.
5. **DO** use `WithElement(el => { ... return OnDispose(cleanup) })` + `Value.on()` for imperative conditional attribute management.
6. **ALWAYS** wrap `Collapse(...)` in its own `html.div()` wrapper — Collapse uses `WithElement` at root, applying `height: 0; overflow: hidden` to its parent.
7. Use `vi.advanceTimersByTimeAsync(ms)` not `vi.runAllTimersAsync()` when testing `setInterval` — the latter causes infinite loops.

---

## Component Structure Conventions

### File Organization

```
packages/beatui/src/components/<category>/<component-name>.ts   — Component implementation
packages/beatui/src/components/<category>/index.ts              — Category re-exports
packages/beatui/src/styles/layers/03.components/<component-name>.css  — Component styles
packages/beatui/src/index.ts                                    — Main library re-exports
packages/beatui/tests/unit/<component-name>.test.ts             — Unit tests
apps/docs/src/pages/components/<component-name>.ts              — Documentation page
```

### Component Categories

| Category | Path | Examples |
|----------|------|----------|
| button | `src/components/button/` | Button, CloseButton, ToggleButton |
| form/input | `src/components/form/input/` | TextInput, NumberInput, Checkbox, RangeSlider |
| form/control | `src/components/form/control/` | FormControl wrappers |
| layout | `src/components/layout/` | Card, Accordion, Collapse, AppShell |
| overlay | `src/components/overlay/` | Modal, Drawer, Popover, Tooltip |
| media | `src/components/media/` | Carousel, VideoPlayer |
| navigation | `src/components/navigation/` | Sidebar, Tabs, Toolbar, Breadcrumbs |
| data | `src/components/data/` | Table, Tree, DataTable, VirtualScrolling |
| typography | `src/components/typography/` | Heading, Paragraph, Text, Kbd |
| misc | `src/components/misc/` | Notification, Skeleton, LoadingOverlay, CommandPalette |

### Component Template

```typescript
import { type TNode, type Value, html, attr, on, computedOf, When, Fragment, Empty } from '@tempots/dom'
import type { ControlSize } from '../theme/types'

export interface MyComponentOptions {
  /** Brief description */
  size?: Value<ControlSize>
  /** Brief description */
  disabled?: Value<boolean>
  /** Brief description */
  variant?: Value<'default' | 'primary'>
  /** Callback when action occurs */
  onChange?: (value: string) => void
}

export function MyComponent(
  options: MyComponentOptions,
  ...children: TNode[]
): TNode {
  const {
    size = 'md',
    disabled = false,
    variant = 'default',
    onChange,
  } = options

  return html.div(
    attr.class(
      computedOf(size, variant, disabled)(generateMyComponentClasses)
    ),
    attr.style(
      computedOf(variant)(generateMyComponentStyles)
    ),
    ...children
  )
}

function generateMyComponentClasses(
  size: ControlSize,
  variant: string,
  disabled: boolean
): string {
  const classes = [
    'bc-my-component',
    `bc-control--padding-${size}`,
    `bc-control--text-size-${size}`,
  ]
  if (disabled) classes.push('bc-my-component--disabled')
  return classes.join(' ')
}

function generateMyComponentStyles(variant: string): string {
  // Return CSS custom property overrides as inline style string
  const styles = new Map<string, string>()
  // ... set styles based on variant
  return Array.from(styles.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}
```

---

## Reusable Components & Helpers

### For Form Inputs

Before building a new form input, understand these building blocks:

1. **`CommonInputOptions`** (`src/components/form/input/input-options.ts`) — Base options all inputs share: `autocomplete`, `autofocus`, `class`, `classes`, `disabled`, `hasError`, `name`, `placeholder`, `id`, `required`, `tabIndex`, `ariaLabel`, `size`.

2. **`InputOptions<V>`** — Extends `CommonInputOptions` with: `value: Value<V>`, `before?: TNode`, `after?: TNode`, `onChange`, `onInput`, `onBlur`.

3. **`CommonInputAttributes(options)`** — Converts `CommonInputOptions` into Tempo DOM attribute nodes. Call this in your input element to apply all standard attributes.

4. **`InputContainer(options)`** (`src/components/form/input/input-container.ts`) — Visual container with `bc-input-container` styling, before/after slots, click-to-focus. Use for any input that needs adornments.

5. **`InputWrapper(options)`** (`src/components/form/input/input-wrapper.ts`) — Wraps inputs with label, description, error display. Supports vertical/horizontal layouts. Handles accessibility IDs automatically.

6. **`InputIcon(options)`** — Styled icon for use inside `InputContainer` before/after slots.

7. **`mapInputOptions(options, toInner, toOuter)`** — Maps input options between value types.

### For Buttons

- **`generateButtonClasses(size, roundedness, loading, fullWidth)`** — Standard button class generation.
- **`generateButtonStyles(variant, color, disabled)`** — Inline CSS custom properties for button theming.

### For Overlays

- **`Overlay(fn)`** — Low-level overlay primitive with `effect`, `mode`, `onClickOutside`, `onEscape`.
- **Render function pattern**: `(open: (config) => void, close: () => void) => TNode`

### Theme Utilities (`src/components/theme/style-utils.ts`)

- **`backgroundValue(color, variant, mode)`** -> `{ backgroundColor, textColor }` for filled/light/soft backgrounds.
- **`hoverBackgroundValue(color, variant, mode)`** -> Hover state colors.
- **`borderColorValue(color, mode)`** -> Theme-aware border colors.
- **`textColorValue(color, mode)`** -> High-contrast text colors.
- **`foregroundColorValue(color, tone, mode)`** -> Icon/accent colors.

### General Utilities (`src/utils/`)

- **`sessionId(prefix)`** — Generate unique IDs (e.g., `sessionId('my-component')` -> `'my-component-0'`). Use for accessibility `id` attributes.
- **`FocusTrap`** — Trap keyboard focus within an element (for modals/overlays).
- **`useAnimatedToggle`** — Animation utilities for show/hide transitions.

### Shared Types (`src/components/theme/types.ts`)

- **`ControlSize`** — `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- **`ButtonVariant`** — `'filled' | 'light' | 'outline' | 'dashed' | 'default' | 'subtle' | 'text'`
- **`ThemeColorName`** — All theme colors including semantic names
- **`ExtendedColor`** — `ThemeColorName | 'transparent'`
- **`increaseSize(size, steps)`** — Increment/decrement size with clamping.

---

## CSS Conventions

### Naming

- **Prefix**: `bc-` (BeatUI Component) for ALL component classes.
- **BEM-like**: `bc-component`, `bc-component--modifier`, `bc-component__element`.
- **Control utilities**: `bc-control--padding-{size}`, `bc-control--text-size-{size}`, `bc-control--rounded-{roundedness}`.

### File Structure

Create CSS in `packages/beatui/src/styles/layers/03.components/<component-name>.css`:

```css
.bc-my-component {
  /* Base styles using CSS custom properties */
  --mc-bg: var(--color-neutral-50);
  --mc-bg-dark: var(--color-neutral-800);
  --mc-text: var(--color-neutral-900);
  --mc-text-dark: var(--color-neutral-100);
  --mc-border: var(--color-neutral-200);
  --mc-border-dark: var(--color-neutral-700);

  background-color: var(--mc-bg);
  color: var(--mc-text);
  border: var(--border-width-default) solid var(--mc-border);
}

/* Dark mode */
.dark .bc-my-component {
  background-color: var(--mc-bg-dark);
  color: var(--mc-text-dark);
  border-color: var(--mc-border-dark);
}

/* Modifiers */
.bc-my-component--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Sub-elements */
.bc-my-component__header {
  /* ... */
}
```

### Design Tokens (CSS Variables)

Use existing tokens — never hardcode values:

- **Colors**: `--color-primary-500`, `--color-neutral-200`, `--color-danger-600`, etc.
- **Spacing**: `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`
- **Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- **Typography**: `--font-size-xs`, `--font-size-sm`, `--font-size-md`
- **Borders**: `--border-width-default`, `--border-width-thick`
- **Motion**: `--motion-duration-fast`, `--motion-duration-normal`, `--motion-easing-default`
- **Z-index**: `--z-dropdown`, `--z-overlay`, `--z-modal`, `--z-popover`, `--z-tooltip`

### Registration

Add the import to `packages/beatui/src/styles/layers/03.components/index.css`:

```css
@import './my-component.css';
```

---

## Export Checklist

When adding a new component, register it in these files:

1. **Component file**: `src/components/<category>/<component-name>.ts` — export interface + function.
2. **Category index**: `src/components/<category>/index.ts` — add `export * from './<component-name>'`.
3. **Main index**: `src/index.ts` — usually already covered by category re-export; verify.
4. **CSS index**: `src/styles/layers/03.components/index.css` — add `@import './<component-name>.css'`.

---

## Documentation Page

Create `apps/docs/src/pages/components/<component-name>.ts`:

```typescript
import { type ComponentPageMeta, ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import { MyComponent } from '@tempots/beatui'

export const meta: ComponentPageMeta = {
  name: 'MyComponent',
  category: 'CategoryName',        // e.g., 'Buttons', 'Form Inputs', 'Layout', 'Overlays'
  component: 'MyComponent',        // Must match the exported function name
  description: 'Brief description of what the component does.',
  icon: 'lucide:icon-name',        // Iconify icon identifier
  order: 1,                        // Sort order within category
}

export default function MyComponentPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'MyComponent',
      props => MyComponent(props as Record<string, unknown>, 'Content'),
      { childrenCode: "'Content'" }
    ),
    sections: [
      ...AutoSections('MyComponent', props => MyComponent(props, 'Example')),
      Section(
        'Custom Example',
        () => MyComponent({ variant: 'primary', size: 'lg' }, 'Large Primary'),
        'Description of this example.'
      ),
    ],
  })
}
```

For components with callbacks or complex state, use **`manualPlayground`** instead of `autoPlayground`.

---

## Testing

Create `packages/beatui/tests/unit/<component-name>.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { MyComponent } from '../../src/components/<category>/<component-name>'
import { WithProviders } from '../helpers/test-providers'

describe('MyComponent', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders with default options', () => {
    render(WithProviders(() => MyComponent({})), container)
    expect(container.querySelector('.bc-my-component')).not.toBeNull()
  })

  it('applies size class reactively', () => {
    const size = prop<'sm' | 'md' | 'lg'>('md')
    render(WithProviders(() => MyComponent({ size })), container)
    const el = container.querySelector('.bc-my-component')!
    expect(el.className).toContain('bc-control--padding-md')

    size.set('lg')
    expect(el.className).toContain('bc-control--padding-lg')
  })

  it('handles disabled state', () => {
    render(WithProviders(() => MyComponent({ disabled: true })), container)
    const el = container.querySelector('.bc-my-component')!
    expect(el.className).toContain('bc-my-component--disabled')
  })

  it('fires onChange callback', () => {
    const onChange = vi.fn()
    render(WithProviders(() => MyComponent({ onChange })), container)
    // Trigger interaction...
    // expect(onChange).toHaveBeenCalledWith(expectedValue)
  })
})
```

**Test helpers available** (`tests/helpers/test-providers.ts`):
- `WithProviders(fn)` — Wraps in Theme + Locale + BeatUII18n + AuthI18n providers.
- `WithThemeProvider(fn)` — Theme only.
- `WithI18nProviders(fn)` — I18n only.
- `WithLocation(location, fn)` — With mocked router location.

---

## Accessibility Requirements

All interactive components MUST include:

1. **ARIA roles** — Use `aria.role('slider')`, `aria.role('dialog')`, etc. where appropriate.
2. **ARIA states** — `aria.disabled()`, `aria.expanded()`, `aria.selected()`, `aria.checked()`.
3. **ARIA properties** — `aria.label()`, `aria.labelledby()`, `aria.describedby()`, `aria.valuenow()`, `aria.valuemin()`, `aria.valuemax()`.
4. **Keyboard navigation** — Handle `on.keydown` for arrow keys, Enter, Space, Escape, Tab as appropriate for the component's ARIA role.
5. **Focus management** — Ensure focusable elements have visible focus styles (handled by `src/styles/layers/02.base/focus.css`).
6. **Screen reader text** — Use `html.span(attr.class('sr-only'), 'descriptive text')` for visually hidden labels.

For imperative/conditional ARIA attribute management (e.g., conditionally setting `aria-valuenow`), use `WithElement` + `Value.on()` rather than `computedOf()`.

---

## Implementation Steps

When implementing a new component:

1. **Read existing similar components** — Find the closest existing component and study its patterns.
2. **Define the options interface** — Use `Value<T>` for all configurable props, document with JSDoc (`/** @default 'md' */`).
3. **Implement the component function** — Follow the template above.
4. **Extract class/style generators** — Keep `generateXClasses` and `generateXStyles` as pure functions for testability.
5. **Create the CSS file** — Use design tokens, support dark mode, follow BEM naming.
6. **Register CSS** — Add import to `03.components/index.css`.
7. **Export** — Add to category index and verify main index coverage.
8. **Write tests** — Cover rendering, reactivity, interaction, accessibility.
9. **Create docs page** — Add meta + playground + sections.
10. **Build and verify** — Run `pnpm --filter @tempots/beatui build` and `pnpm --filter @tempots/beatui test`.
