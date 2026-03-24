# Better-Auth Integration Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 gaps in the better-auth integration: auto-provide AuthI18n, loading fallbacks, SSR localStorage guard, TSDoc fixes, post-auth navigation hook, and structured signup errors.

**Architecture:** All changes are in `packages/beatui/`. Types flow from `src/better-auth/types.ts` through callbacks → bridge → components. The `AuthError` union type replaces `string | null` in callback return types. Auth guard components get an options bag API with pending state handling.

**Tech Stack:** TypeScript, `@tempots/dom` (reactive primitives: `Signal`, `When`, `Unless`, `Empty`, `Task`, `Provide`), Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-better-auth-gaps-design.md`

---

### Task 1: Add AuthFieldError type and AuthError union

**Files:**
- Modify: `packages/beatui/src/better-auth/types.ts:184-219`
- Modify: `packages/beatui/src/better-auth/index.ts`

- [ ] **Step 1: Add types to `types.ts`**

Add after `BetterAuthSession` interface (after line 232):

```ts
/**
 * Describes an error associated with a specific form field.
 */
export interface AuthFieldError {
  /** The form field name this error applies to (e.g., 'email', 'password'). */
  field: string
  /** The human-readable error message. */
  message: string
}

/**
 * Error returned by auth callbacks.
 *
 * - `string` — a generic error message displayed at the form root
 * - `AuthFieldError[]` — field-specific errors for per-field highlighting
 */
export type AuthError = string | AuthFieldError[]
```

- [ ] **Step 2: Add `onAuthSuccess` to `BetterAuthBridgeOptions`**

Add to `BetterAuthBridgeOptions` interface (after `labels` field, line 218):

```ts
  /**
   * Callback invoked after successful sign-in or sign-up.
   * Use this to trigger navigation (e.g., redirect to dashboard).
   * @param user - The authenticated user.
   */
  onAuthSuccess?: (user: BetterAuthUser) => void
```

- [ ] **Step 3: Export new types from index.ts**

In `packages/beatui/src/better-auth/index.ts`, update the type export block:

```ts
export type {
  BetterAuthClient,
  BetterAuthResult,
  BetterAuthUser,
  BetterAuthSession,
  BetterAuthBridge,
  BetterAuthBridgeOptions,
  TwoFactorClient,
  PasskeyClient,
  PasskeyInfo,
  AuthFieldError,
  AuthError,
} from './types'
```

- [ ] **Step 4: Verify typecheck passes**

Run: `pnpm --filter @tempots/beatui typecheck`
Expected: PASS (new types are additive, no consumers yet)

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/better-auth/types.ts packages/beatui/src/better-auth/index.ts
git commit -m "feat(better-auth): add AuthFieldError, AuthError types and onAuthSuccess option"
```

---

### Task 2: SSR localStorage guard for auth-email-prop

**Files:**
- Modify: `packages/beatui/src/components/auth/auth-email-prop.ts`
- Create: `packages/beatui/tests/unit/auth/auth-email-prop.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/beatui/tests/unit/auth/auth-email-prop.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('useAuthEmailProp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a localStorage-backed prop in browser environment', async () => {
    const { useAuthEmailProp } = await import(
      '../../../src/components/auth/auth-email-prop'
    )
    const emailProp = useAuthEmailProp()
    // In jsdom, window and document exist, so it should use localStorageProp
    expect(emailProp.value).toBeNull()
    emailProp.value = 'test@example.com'
    expect(emailProp.value).toBe('test@example.com')
  })

  it('returns a plain prop in SSR environment', async () => {
    // Mock isBrowser to return false
    vi.doMock('../../../src/components/auth/utils', () => ({
      isBrowser: () => false,
      // Re-export other utils to avoid missing exports
      defaultPasswordRules: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
      },
    }))

    const { useAuthEmailProp } = await import(
      '../../../src/components/auth/auth-email-prop'
    )
    const emailProp = useAuthEmailProp()
    expect(emailProp.value).toBeNull()
    // Should work as a plain prop without localStorage
    emailProp.value = 'ssr@example.com'
    expect(emailProp.value).toBe('ssr@example.com')

    vi.doUnmock('../../../src/components/auth/utils')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/auth/auth-email-prop.test.ts`
Expected: First test passes (jsdom has window), second test fails (no `isBrowser` import in current code, or `localStorageProp` still called)

- [ ] **Step 3: Implement the SSR guard**

Replace contents of `packages/beatui/src/components/auth/auth-email-prop.ts`:

```ts
/**
 * Auth Email Persistence
 *
 * Provides a reactive property backed by `localStorage` that persists the
 * user's email address across sessions. Used by the "remember me" checkbox
 * in sign-in and reset password forms.
 *
 * SSR-safe: returns a plain in-memory prop when `window` is not available.
 *
 * @module auth/auth-email-prop
 */

import { localStorageProp, prop } from '@tempots/dom'
import { isBrowser } from './utils'

/**
 * Creates a reactive property for persisting the user's email.
 *
 * In browser environments, backed by `localStorage` (key `'bui_auth_email'`).
 * In SSR environments, returns a plain in-memory `Prop<string | null>`.
 *
 * @returns A reactive `Prop<string | null>`.
 */
export const useAuthEmailProp = () =>
  isBrowser()
    ? localStorageProp<string | null>({
        key: 'bui_auth_email',
        defaultValue: null,
      })
    : prop<string | null>(null)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/auth/auth-email-prop.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/components/auth/auth-email-prop.ts packages/beatui/tests/unit/auth/auth-email-prop.test.ts
git commit -m "fix(auth): guard useAuthEmailProp with isBrowser() for SSR safety"
```

---

### Task 3: Loading fallback in Authenticated/Unauthenticated

**Files:**
- Modify: `packages/beatui/src/better-auth/components/authenticated.ts`
- Create: `packages/beatui/tests/unit/better-auth/authenticated.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/beatui/tests/unit/better-auth/authenticated.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { prop } from '@tempots/dom'
import type { BetterAuthBridge } from '../../../src/better-auth/types'

function createMockBridge(overrides: {
  isPending?: boolean
  isAuthenticated?: boolean
} = {}): BetterAuthBridge {
  return {
    session: prop(null),
    isPending: prop(overrides.isPending ?? false),
    user: prop(null),
    isAuthenticated: prop(overrides.isAuthenticated ?? false),
    containerOptions: {} as any,
    signInOptions: {} as any,
    signUpOptions: {} as any,
    resetOptions: {} as any,
    socialProviders: [],
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    dispose: vi.fn(),
  }
}

describe('Authenticated', () => {
  let Authenticated: typeof import('../../../src/better-auth/components/authenticated').Authenticated

  beforeEach(async () => {
    const mod = await import('../../../src/better-auth/components/authenticated')
    Authenticated = mod.Authenticated
  })

  it('accepts options bag with children', () => {
    const bridge = createMockBridge({ isAuthenticated: true })
    // Should not throw — options bag accepted
    const result = Authenticated(bridge, {
      children: () => 'authenticated content',
    })
    expect(result).toBeDefined()
  })

  it('accepts options bag with loading', () => {
    const bridge = createMockBridge({ isPending: true })
    const result = Authenticated(bridge, {
      children: () => 'authenticated content',
      loading: () => 'loading...',
    })
    expect(result).toBeDefined()
  })
})

describe('Unauthenticated', () => {
  let Unauthenticated: typeof import('../../../src/better-auth/components/authenticated').Unauthenticated

  beforeEach(async () => {
    const mod = await import('../../../src/better-auth/components/authenticated')
    Unauthenticated = mod.Unauthenticated
  })

  it('accepts options bag with children', () => {
    const bridge = createMockBridge({ isAuthenticated: false })
    const result = Unauthenticated(bridge, {
      children: () => 'sign-in form',
    })
    expect(result).toBeDefined()
  })

  it('accepts options bag with loading', () => {
    const bridge = createMockBridge({ isPending: true })
    const result = Unauthenticated(bridge, {
      children: () => 'sign-in form',
      loading: () => 'loading...',
    })
    expect(result).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/better-auth/authenticated.test.ts`
Expected: FAIL — current signature is `(bridge, () => TNode)`, not `(bridge, AuthGuardOptions)`

- [ ] **Step 3: Implement the options bag API with pending state**

Replace `packages/beatui/src/better-auth/components/authenticated.ts`:

```ts
import { TNode, When, Unless, Empty } from '@tempots/dom'
import { BetterAuthBridge } from '../types'

/**
 * Options for {@link Authenticated} and {@link Unauthenticated} guard components.
 */
export interface AuthGuardOptions {
  /** Content to render when the guard condition is met. */
  children: () => TNode
  /** Content to render while the initial session fetch is in progress. */
  loading?: () => TNode
}

/**
 * Renders children only when the user is authenticated.
 *
 * While the session is pending (initial fetch), renders the `loading` fallback
 * or nothing (`Empty`) by default.
 */
export function Authenticated(auth: BetterAuthBridge, options: AuthGuardOptions) {
  return When(
    auth.isPending,
    options.loading ?? (() => Empty),
    () => When(auth.isAuthenticated, options.children)
  )
}

/**
 * Renders children only when the user is NOT authenticated.
 *
 * While the session is pending, renders children by default (showing the
 * sign-in form during loading is a reasonable default). Provide a `loading`
 * fallback to show a spinner instead.
 *
 * Note: The default behavior causes a brief flash of unauthenticated content
 * if the user is actually authenticated. Use `loading` to avoid this.
 */
export function Unauthenticated(auth: BetterAuthBridge, options: AuthGuardOptions) {
  return When(
    auth.isPending,
    options.loading ?? options.children,
    () => Unless(auth.isAuthenticated, options.children)
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/better-auth/authenticated.test.ts`
Expected: PASS

- [ ] **Step 5: Run full test suite to check for breakage**

Run: `pnpm --filter @tempots/beatui test`
Expected: PASS (no other tests import `Authenticated`/`Unauthenticated` directly)

- [ ] **Step 6: Export `AuthGuardOptions` from index.ts**

In `packages/beatui/src/better-auth/index.ts`, update the `authenticated.ts` re-export:

```ts
export { Authenticated, Unauthenticated } from './components/authenticated'
export type { AuthGuardOptions } from './components/authenticated'
```

- [ ] **Step 7: Commit**

```bash
git add packages/beatui/src/better-auth/components/authenticated.ts packages/beatui/src/better-auth/index.ts packages/beatui/tests/unit/better-auth/authenticated.test.ts
git commit -m "feat(better-auth): add loading fallback to Authenticated/Unauthenticated"
```

---

### Task 4: Update auth form types and wire callbacks with onAuthSuccess + structured errors

This task combines the callback changes with the form type updates so that the codebase stays type-consistent throughout. The `AuthContainerOptions.onSignIn`/`onSignUp` types must match the callback return types.

**Files:**
- Modify: `packages/beatui/src/better-auth/callbacks.ts`
- Modify: `packages/beatui/src/components/auth/types.ts`
- Modify: `packages/beatui/src/components/auth/utils.ts`
- Modify: `packages/beatui/tests/unit/better-auth/callbacks.test.ts`

**Important:** This task also updates auth form types (`onSignIn`/`onSignUp` return types in `AuthContainerOptions`, `SignInFormOptions`, `SignUpFormOptions`) so that the callback return type (`AuthError | null`) matches the container option types. See Task 6 for the full type update details — execute Task 6 Steps 1-2 **before** Step 4 of this task if doing tasks in order, or do them together.

- [ ] **Step 1: Write failing tests for `onAuthSuccess`**

Add to `packages/beatui/tests/unit/better-auth/callbacks.test.ts`, inside the `createSignInCallback` describe block:

```ts
  it('calls onAuthSuccess with user after successful sign-in', async () => {
    const client = createMockBetterAuthClient()
    const onSuccess = vi.fn()
    const onAuthSuccess = vi.fn()
    const callback = createSignInCallback(client, {}, onSuccess, onAuthSuccess)

    await callback({ email: 'test@example.com', password: 'password123' })

    expect(onAuthSuccess).toHaveBeenCalledWith({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })
  })

  it('does not call onAuthSuccess on failure', async () => {
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi.fn().mockResolvedValue(failure('Invalid credentials')),
        social: vi.fn(),
      },
    })
    const onAuthSuccess = vi.fn()
    const callback = createSignInCallback(client, {}, vi.fn(), onAuthSuccess)

    await callback({ email: 'test@example.com', password: 'wrong' })

    expect(onAuthSuccess).not.toHaveBeenCalled()
  })
```

Add inside the `createSignUpCallback` describe block:

```ts
  it('calls onAuthSuccess with user after successful sign-up', async () => {
    const client = createMockBetterAuthClient()
    const onSuccess = vi.fn()
    const onAuthSuccess = vi.fn()
    const callback = createSignUpCallback(client, {}, onSuccess, onAuthSuccess)

    await callback({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      acceptTerms: true,
    })

    expect(onAuthSuccess).toHaveBeenCalledWith({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/better-auth/callbacks.test.ts`
Expected: FAIL — `createSignInCallback` doesn't accept 4th argument

- [ ] **Step 3: Write failing tests for structured errors**

Add a new describe block to `callbacks.test.ts`:

```ts
describe('handleResult with structured errors', () => {
  it('returns AuthFieldError array when error contains fieldErrors', async () => {
    const client = createMockBetterAuthClient({
      signUp: {
        email: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'Validation failed',
            status: 422,
            statusText: 'Unprocessable Entity',
            fieldErrors: { email: 'Domain not allowed' },
          },
        }),
      },
    })
    const callback = createSignUpCallback(client, {}, vi.fn())

    const result = await callback({
      email: 'user@blocked.com',
      password: 'password123',
      acceptTerms: true,
    })

    expect(result).toEqual([{ field: 'email', message: 'Domain not allowed' }])
  })

  it('returns plain string for non-structured errors', async () => {
    const client = createMockBetterAuthClient({
      signIn: {
        email: vi.fn().mockResolvedValue(failure('Invalid credentials')),
        social: vi.fn(),
      },
    })
    const callback = createSignInCallback(client, {}, vi.fn())

    const result = await callback({
      email: 'test@example.com',
      password: 'wrong',
    })

    expect(result).toBe('Invalid credentials')
  })
})
```

- [ ] **Step 4: Implement updated callbacks**

Replace `packages/beatui/src/better-auth/callbacks.ts`:

```ts
import { SignInData, SignUpData, ResetPasswordData } from '../components/auth'
import {
  BetterAuthClient,
  BetterAuthBridgeOptions,
  BetterAuthResult,
  BetterAuthUser,
  AuthError,
  AuthFieldError,
} from './types'

function handleResult(
  result: BetterAuthResult<unknown>,
  opts: BetterAuthBridgeOptions
): AuthError | null {
  if (result.error) {
    opts.onError?.({
      message: result.error.message,
      status: result.error.status,
    })

    // Check for structured field errors
    const err = result.error as Record<string, unknown>
    if (err.fieldErrors && typeof err.fieldErrors === 'object') {
      const fieldErrors: AuthFieldError[] = []
      for (const [field, message] of Object.entries(
        err.fieldErrors as Record<string, string>
      )) {
        if (typeof message === 'string') {
          fieldErrors.push({ field, message })
        }
      }
      if (fieldErrors.length > 0) {
        return fieldErrors
      }
    }

    return result.error.message
  }
  return null
}

export function createSignInCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions,
  onSuccess: () => Promise<void>,
  onAuthSuccess?: (user: BetterAuthUser) => void
): (data: SignInData) => Promise<AuthError | null> {
  return async (data: SignInData) => {
    const result = await client.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: opts.callbackURL,
    })
    const error = handleResult(result, opts)
    if (error) return error
    await onSuccess()
    if (onAuthSuccess) {
      const sessionResult = await client.getSession()
      if (sessionResult.data?.user) {
        onAuthSuccess(sessionResult.data.user)
      }
    }
    return null
  }
}

export function createSignUpCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions,
  onSuccess: () => Promise<void>,
  onAuthSuccess?: (user: BetterAuthUser) => void
): (data: SignUpData) => Promise<AuthError | null> {
  return async (data: SignUpData) => {
    const result = await client.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      callbackURL: opts.callbackURL,
    })
    const error = handleResult(result, opts)
    if (error) return error
    await onSuccess()
    if (onAuthSuccess) {
      const sessionResult = await client.getSession()
      if (sessionResult.data?.user) {
        onAuthSuccess(sessionResult.data.user)
      }
    }
    return null
  }
}

export function createResetPasswordCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions
): (data: ResetPasswordData) => Promise<AuthError | null> {
  return async (data: ResetPasswordData) => {
    const result = await client.requestPasswordReset({
      email: data.email,
      redirectTo: opts.callbackURL,
    })
    return handleResult(result, opts)
  }
}

export function createSocialLoginHandler(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions
): (provider: string) => Promise<void> {
  return async (provider: string) => {
    const result = await client.signIn.social({
      provider,
      callbackURL: opts.callbackURL,
      errorCallbackURL: opts.errorCallbackURL,
    })
    handleResult(result, opts)
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/better-auth/callbacks.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/beatui/src/better-auth/callbacks.ts packages/beatui/tests/unit/better-auth/callbacks.test.ts
git commit -m "feat(better-auth): add onAuthSuccess callback and structured field errors"
```

---

### Task 5: Wire onAuthSuccess through bridge

**Files:**
- Modify: `packages/beatui/src/better-auth/bridge.ts`
- Modify: `packages/beatui/tests/unit/better-auth/bridge.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/beatui/tests/unit/better-auth/bridge.test.ts`:

```ts
  it('calls onAuthSuccess after successful sign-in', async () => {
    const client = createMockBetterAuthClient()
    const onAuthSuccess = vi.fn()
    const bridge = createBetterAuthBridge(client, { onAuthSuccess })
    await vi.runAllTimersAsync()

    await bridge.containerOptions.onSignIn!({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(onAuthSuccess).toHaveBeenCalledWith({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })

    bridge.dispose()
  })

  it('calls onAuthSuccess after successful sign-up', async () => {
    const client = createMockBetterAuthClient()
    const onAuthSuccess = vi.fn()
    const bridge = createBetterAuthBridge(client, { onAuthSuccess })
    await vi.runAllTimersAsync()

    await bridge.containerOptions.onSignUp!({
      email: 'new@example.com',
      password: 'password123',
      acceptTerms: true,
    })

    expect(onAuthSuccess).toHaveBeenCalledWith({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    })

    bridge.dispose()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/better-auth/bridge.test.ts`
Expected: FAIL — `onAuthSuccess` not called (not wired through)

- [ ] **Step 3: Update bridge to pass onAuthSuccess**

In `packages/beatui/src/better-auth/bridge.ts`, change the callback wiring (lines 27-28):

```ts
  const onSignIn = createSignInCallback(client, options, refreshSession, options.onAuthSuccess)
  const onSignUp = createSignUpCallback(client, options, refreshSession, options.onAuthSuccess)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/unit/better-auth/bridge.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/better-auth/bridge.ts packages/beatui/tests/unit/better-auth/bridge.test.ts
git commit -m "feat(better-auth): wire onAuthSuccess through bridge to callbacks"
```

---

### Task 6: Update auth form types and requestToControllerValidation for AuthError

**Files:**
- Modify: `packages/beatui/src/components/auth/types.ts:252-282, 349-401`
- Modify: `packages/beatui/src/components/auth/utils.ts:446-473`

The form callback types (`onSignIn`, `onSignUp`) currently return `Promise<string | null>`. Update them to accept `Promise<AuthError | null>` and update `requestToControllerValidation` to handle the union using `ControllerValidation.invalidFields()`.

- [ ] **Step 1: Update auth types**

In `packages/beatui/src/components/auth/types.ts`, add import at top:

```ts
import type { AuthError } from '../../better-auth/types'
```

Then update these 4 callback signatures:
- `SignInFormOptions.onSignIn`: `(data: SignInData) => Promise<AuthError | null>`
- `SignUpFormOptions.onSignUp`: `(data: SignUpData) => Promise<AuthError | null>`
- `AuthContainerOptions.onSignIn`: `(data: SignInData) => Promise<AuthError | null>`
- `AuthContainerOptions.onSignUp`: `(data: SignUpData) => Promise<AuthError | null>`

- [ ] **Step 2: Update `requestToControllerValidation` to handle AuthError**

In `packages/beatui/src/components/auth/utils.ts`, add imports:

```ts
import type { AuthError, AuthFieldError } from '../../better-auth/types'
import { ControllerValidation } from '../form'
```

Then update the function:

```ts
export function requestToControllerValidation<T>({
  task,
  message,
  onStart,
  onEnd,
}: {
  task: undefined | ((value: T) => Promise<AuthError | null>)
  message: string
  onStart?: () => void
  onEnd?: () => void
}) {
  return async (value: T) => {
    onStart?.()
    const result = await taskToValidation({
      task: task != null ? () => task(value) : async () => null,
      errorMessage: message,
      errorPath: ['root'],
      validation: result => {
        if (result == null) {
          return Validation.valid
        }
        if (typeof result === 'string') {
          return Validation.invalid({ message: result })
        }
        // AuthFieldError[] — map to field-level validation errors
        const fields: Record<string, string> = {}
        for (const err of result as AuthFieldError[]) {
          fields[err.field] = err.message
        }
        return ControllerValidation.invalidFields(fields)
      },
    })
    onEnd?.()
    return result
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @tempots/beatui typecheck`
Expected: PASS

- [ ] **Step 4: Run existing tests**

Run: `pnpm --filter @tempots/beatui test`
Expected: PASS (existing tests pass `string | null` which is a subtype of `AuthError | null`)

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/components/auth/types.ts packages/beatui/src/components/auth/utils.ts
git commit -m "feat(auth): update form callback types to support AuthError with field errors"
```

---

### Task 7: Auto-provide AuthI18n in BetterAuthContainer

**Files:**
- Modify: `packages/beatui/src/better-auth/components/better-auth-container.ts`

- [ ] **Step 1: Update BetterAuthContainer to auto-provide AuthI18n**

Replace `packages/beatui/src/better-auth/components/better-auth-container.ts`:

```ts
import { TNode, Task, Provide } from '@tempots/dom'
import { AuthContainer, AuthContainerOptions } from '../../components/auth'
import { BetterAuthBridge } from '../types'

/**
 * Better-auth wrapper around {@link AuthContainer}.
 *
 * Automatically provides the `AuthI18n` context via lazy import,
 * so consumers don't need to wrap in `BeatUI({ includeAuthI18n: true })`.
 */
export function BetterAuthContainer(
  auth: BetterAuthBridge,
  overrides?: Partial<AuthContainerOptions>,
  ...children: TNode[]
) {
  return Task(
    () => import('../../auth-i18n/translations'),
    ({ AuthI18n }) =>
      Provide(AuthI18n, {}, () =>
        AuthContainer(
          { ...auth.containerOptions, ...overrides },
          ...children
        )
      )
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @tempots/beatui typecheck`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `pnpm --filter @tempots/beatui test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/beatui/src/better-auth/components/better-auth-container.ts
git commit -m "feat(better-auth): auto-provide AuthI18n in BetterAuthContainer"
```

---

### Task 8: Fix TSDoc examples in provider and types

**Files:**
- Modify: `packages/beatui/src/better-auth/provider.ts:35-45`
- Modify: `packages/beatui/src/better-auth/types.ts:240-249`

- [ ] **Step 1: Fix provider.ts TSDoc**

In `packages/beatui/src/better-auth/provider.ts`, replace the example block (lines 36-44):

```ts
 * @example
 * ```ts
 * import { Provide, Use } from '@tempots/dom'
 * import { BetterAuth } from '@tempots/beatui/auth'
 *
 * Provide(BetterAuth, { client: authClient, socialProviders: ['google'] }, () =>
 *   Use(BetterAuth, (bridge) =>
 *     AuthContainer(bridge.containerOptions)
 *   )
 * )
 * ```
```

- [ ] **Step 2: Fix types.ts TSDoc**

In `packages/beatui/src/better-auth/types.ts`, check the `BetterAuthBridge` example block and update if it shows `Provide` without `() =>`. The current example on lines 240-249 uses `When` and `AuthContainer` directly (no `Provide`), so it's correct. No change needed here.

- [ ] **Step 3: Commit**

```bash
git add packages/beatui/src/better-auth/provider.ts
git commit -m "docs(better-auth): fix Provide() TSDoc examples to use () => wrapper"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full test suite**

Run: `pnpm --filter @tempots/beatui test`
Expected: ALL PASS

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @tempots/beatui typecheck`
Expected: PASS

- [ ] **Step 3: Run lint**

Run: `pnpm --filter @tempots/beatui lint`
Expected: PASS (or only pre-existing warnings)

- [ ] **Step 4: Build**

Run: `pnpm --filter @tempots/beatui build`
Expected: BUILD SUCCESS
