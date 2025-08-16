# Tempo TS – Engineer’s Usage Guide

## Overview of Tempo and Its Packages

**Tempo** is a lightweight UI framework for building reactive web interfaces in TypeScript. It takes a **functional approach** to UI, using simple TypeScript functions instead of complex class hierarchies or templates. Tempo has **zero external dependencies** and provides **predictable, direct DOM updates** without a virtual DOM, resulting in high performance. It includes a built-in **reactive state system (Signals)** for automatic UI updates, and the entire API is fully **type-safe** with TypeScript for a better developer experience.

Tempo is divided into three core packages:

- **`@tempots/dom`** – The core UI framework. Provides the foundation for building applications, including renderable UI elements, reactive Signals, direct DOM manipulation, and event handling.
- **`@tempots/std`** – A standard utility library for TypeScript. Offers commonly needed utilities for arrays, strings, objects, async operations, validation, timing, and more.
- **`@tempots/ui`** – A collection of reusable UI **components** and higher-level utilities built on top of the core. Includes ready-made UI patterns, routing helpers, form controls, layout components, etc.

## Installation and Setup

Tempo is available via npm. Install the core library as follows:

```bash
# Install core Tempo DOM library
npm install @tempots/dom

# Or with yarn
yarn add @tempots/dom

# Or with pnpm
pnpm add @tempots/dom
```

If you plan to use the UI components package, you need to include all three packages, as `@tempots/ui` has peer dependencies on the core `dom` and `std` libraries:

```bash
# Install Tempo core + standard lib + UI components
npm install @tempots/dom @tempots/std @tempots/ui

# yarn
yarn add @tempots/dom @tempots/std @tempots/ui

# pnpm
pnpm add @tempots/dom @tempots/std @tempots/ui
```

_Note:_ The core `@tempots/dom` package itself has no external dependencies. Using Tempo with TypeScript is recommended (for full type checking and autocompletion), but you can also use it with plain JavaScript if needed.

## Quick Start Example

Once installed, you can start building a UI immediately. Here’s a quick example of a simple counter app using Tempo:

```typescript
import { html, render, prop, on } from '@tempots/dom'

function Counter() {
  const count = prop(0)
  return html.div(
    html.h1('Counter Example'),
    html.div('Count: ', count.map(String)),
    html.button(
      on.click(() => count.value--),
      'Decrement'
    ),
    html.button(
      on.click(() => count.value++),
      'Increment'
    )
  )
}

render(Counter(), document.body)
```

In this code, `prop(0)` creates a reactive signal with initial value 0. The JSX-like structure is built using `html` helpers: e.g. `html.div(...)` creates a `<div>` element. The text `'Count: '` is followed by `count.map(String)` – this means the content will automatically update whenever `count.value` changes. Two buttons are defined with `on.click` event handlers that decrement or increment the count. Finally, `render(Counter(), document.body)` attaches the UI to the actual DOM (in this case, to the page’s `<body>` element). Whenever `count.value` changes (via the button clicks), the displayed count updates automatically thanks to Tempo’s reactivity.

## @tempots/dom – Core DOM Library

### Renderables and the `html` Helper

In Tempo, a **Renderable** is essentially a function that creates and manages part of the UI. You usually create renderables using the `html` helper, which has properties for every standard HTML tag (e.g. `html.div`, `html.button`, etc.). Calling these will produce a renderable element.

```typescript
import { html, render } from '@tempots/dom'

const helloMsg = html.h1('Hello World')

render(helloMsg, document.body)
```

### Signals (Reactive State)

**Signals** represent reactive state values. You create a signal with `prop(initialValue)`, which returns an object whose `.value` property holds the value. When you update `.value`, any UI that used that signal will update automatically.

```typescript
import { html, prop, render, on } from '@tempots/dom'

const count = prop(0)
const counterDisplay = html.div('Count: ', count.map(String))
const incButton = html.button(
  on.click(() => count.value++),
  'Increment'
)

render(html.div(counterDisplay, incButton), document.body)
```

### Attributes and Events

```typescript
import { html, attr, on } from '@tempots/dom'

const actionButton = html.button(
  attr.class('primary-button'),
  attr.disabled(false),
  on.click(() => console.log('Clicked')),
  'Click Me'
)
```

### Conditional Rendering

```typescript
import { html, When, prop } from '@tempots/dom'

const isLoggedIn = prop(false)

const greeting = html.div(
  When(
    isLoggedIn,
    () => html.span('Welcome back!'),
    () => html.span('Please log in')
  )
)

render(greeting, document.body)
```

### Lists and Iteration

```typescript
import { html, ForEach, prop } from '@tempots/dom'

const items = prop(['Apple', 'Banana', 'Cherry'])
const list = html.ul(ForEach(items, item => html.li(item)))

render(list, document.body)
```

## @tempots/ui – Reusable Components and Utilities

### Focus and Viewport Utilities

```typescript
import { html, render } from '@tempots/dom'
import { AutoFocus, AutoSelect, InViewport } from '@tempots/ui'

const focusedInput = html.input(AutoFocus(), AutoSelect())

const lazyLoadedContent = InViewport({}, isVisible =>
  isVisible.value
    ? html.div('📖 Content is now visible!')
    : html.div('Loading...')
)

render(html.div(focusedInput, lazyLoadedContent), document.body)
```

### Routing (Single-Page Application Navigation)

```typescript
import { render } from '@tempots/dom'
import { Router, Location } from '@tempots/ui'

const AppRouter = Router({
  '/': () => html.div('Home Page'),
  '/about': () => html.div('About Page'),
  '/users/:id': info => {
    const userId = info.$.params.$.id
    return html.div('User Profile: ', userId)
  },
  '*': () => html.div('404 - Not Found'),
})

render(AppRouter, document.body)
Location.navigate('/about')
```

### Async Resource Loading

```typescript
import { html, render } from '@tempots/dom'
import { Resource } from '@tempots/ui'

const userResource = Resource({
  load: () => fetch('/api/user').then(res => res.json()),
  loading: () => html.div('Loading user...'),
  error: err => html.div('Error loading user: ', err.message),
  success: user => html.div(html.h2(user.name), html.p(user.email)),
})

render(userResource, document.body)
```

### Popovers and Tooltips

```typescript
import { html, prop, on, attr, style } from '@tempots/dom'
import { PopOver } from '@tempots/ui'

function TooltipExample() {
  const showTooltip = prop(false)
  return html.div(
    html.button(
      on.mouseenter(() => (showTooltip.value = true)),
      on.mouseleave(() => (showTooltip.value = false)),
      'Hover me',
      PopOver({
        open: showTooltip,
        placement: 'top',
        content: () =>
          html.div(
            style.padding('8px'),
            style.background('white'),
            style.borderRadius('4px'),
            style.boxShadow('0 2px 8px rgba(0,0,0,0.1)'),
            'This is a tooltip with an arrow!'
          ),
        arrow: {
          padding: 4,
          content: html.div(
            attr.class('tooltip-arrow'),
            attr.style(
              'background: white; border: 1px solid #ccc; transform: rotate(45deg); width: 8px; height: 8px;'
            )
          ),
        },
      })
    )
  )
}

render(TooltipExample(), document.body)
```

### Form Helpers

```typescript
import { html, render, prop, on, attr } from '@tempots/dom'
import { SelectOnFocus, AutoFocus } from '@tempots/ui'

function LoginForm() {
  const username = prop('')
  const password = prop('')

  return html.form(
    html.div(
      html.label('Username'),
      html.input(
        AutoFocus(),
        SelectOnFocus(),
        attr.value(username),
        on.input(e => username.set(e.target.value))
      )
    ),
    html.div(
      html.label('Password'),
      html.input(
        attr.type('password'),
        attr.value(password),
        on.input(e => password.set(e.target.value))
      )
    ),
    html.button('Login')
  )
}

render(LoginForm(), document.body)
```

## @tempots/std – Standard Utilities Library

### Array Utilities

```typescript
import { filterArray, mapArray, uniquePrimitives } from '@tempots/std'

const numbers = [1, 2, 3, 4, 5]
const evenNumbers = filterArray(numbers, n => n % 2 === 0)
const doubled = mapArray(numbers, n => n * 2)
const unique = uniquePrimitives([1, 2, 2, 3, 3, 3])
```

### String Utilities

```typescript
import { capitalizeWords, ellipsis } from '@tempots/std'

const capitalized = capitalizeWords('hello world') // "Hello World"
const truncated = ellipsis('This is a very long text', 10) // "This is a..."
```

### Async Utilities (Deferred Promises)

```typescript
import { deferred } from '@tempots/std'

const { promise, resolve, reject } = deferred<number>()

promise.then(value => console.log('Resolved with', value))

setTimeout(() => resolve(42), 1000)
```

### Timing Utilities

```typescript
import { delayed, interval } from '@tempots/std'

const cancelDelay = delayed(() => {
  console.log('Executed after 1 second')
}, 1000)

const cancelInterval = interval(() => {
  console.log('Executed every 2 seconds')
}, 2000)

cancelDelay()
cancelInterval()
```

### Result Type and Validation

```typescript
import { Result, success, failure } from '@tempots/std'

const successResult: Result<number, string> = success(42)
const failureResult: Result<number, string> = failure('Something went wrong')

successResult.match({
  success: value => console.log(`Success: ${value}`),
  failure: error => console.error(`Error: ${error}`),
})
```

## Conclusion

Tempo’s three libraries (`dom`, `ui`, and `std`) work together to provide a robust yet lightweight toolkit for building web applications in a reactive, TypeScript-first way. Install the needed packages, use **`@tempots/dom`** to create reactive UI elements with signals, enhance functionality with **`@tempots/ui`** components (routing, focus, popovers, etc.), and utilize **`@tempots/std`** for all sorts of utilities. These tools let you build dynamic interfaces without a heavy framework, with full control over the DOM and state updates. Happy coding!
