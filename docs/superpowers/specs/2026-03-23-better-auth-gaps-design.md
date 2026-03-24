# Better-Auth Integration Gaps — Design Spec

Addresses 6 gaps identified during integration of `@tempots/beatui@1.5.0` better-auth components into a downstream app.

## Gap 1: Auto-provide AuthI18n in BetterAuthContainer

**Problem**: `BetterAuthContainer` crashes with `Provider not found: AuthI18n` unless the app is wrapped in `BeatUI({ includeAuthI18n: true })`.

**Solution**: `BetterAuthContainer` will lazily import and provide `AuthI18n` itself, making it self-contained.

**File**: `src/better-auth/components/better-auth-container.ts`

```ts
import { TNode } from '@tempots/dom'
import { Task } from '@tempots/dom'
import { Provide } from '@tempots/dom'
import { AuthContainer, AuthContainerOptions } from '../../components/auth'
import { BetterAuthBridge } from '../types'

export function BetterAuthContainer(
  auth: BetterAuthBridge,
  overrides?: Partial<AuthContainerOptions>,
  ...children: TNode[]
) {
  const content = AuthContainer({ ...auth.containerOptions, ...overrides }, ...children)

  return Task(
    () => import('../../auth-i18n/translations'),
    ({ AuthI18n }) => Provide(AuthI18n, {}, () => content)
  )
}
```

Unconditionally wrapping in `Provide(AuthI18n)` is safe — if already provided higher in the tree, the inner provider shadows with identical defaults.

## Gap 2: Loading fallback in Authenticated/Unauthenticated

**Problem**: Neither component handles `bridge.isPending`, leaving a blank screen during initial session fetch.

**Solution**: Add options bag with optional `loading` parameter. `Unauthenticated` defaults to rendering children while pending.

**File**: `src/better-auth/components/authenticated.ts`

```ts
import { TNode, When, Unless, Empty } from '@tempots/dom'
import { BetterAuthBridge } from '../types'

export interface AuthGuardOptions {
  children: () => TNode
  loading?: () => TNode
}

export function Authenticated(auth: BetterAuthBridge, options: AuthGuardOptions) {
  return When(auth.isPending,
    options.loading ?? (() => Empty),
    () => When(auth.isAuthenticated, options.children)
  )
}

export function Unauthenticated(auth: BetterAuthBridge, options: AuthGuardOptions) {
  return When(auth.isPending,
    options.loading ?? options.children,
    () => Unless(auth.isAuthenticated, options.children)
  )
}
```

**Breaking change**: Signature changes from `(bridge, () => TNode)` to `(bridge, AuthGuardOptions)`.

## Gap 3: SSR localStorage guard

**Problem**: `useAuthEmailProp()` calls `localStorageProp()` unconditionally, crashing during SSR.

**Solution**: Gate behind `isBrowser()`, returning a plain `prop()` on the server.

**File**: `src/components/auth/auth-email-prop.ts`

```ts
import { localStorageProp, prop } from '@tempots/dom'
import { isBrowser } from './utils'

export const useAuthEmailProp = () =>
  isBrowser()
    ? localStorageProp<string | null>({ key: 'bui_auth_email', defaultValue: null })
    : prop<string | null>(null)
```

No changes to `createBetterAuthBridge` for baseURL — that is the consumer's responsibility when constructing the better-auth client.

## Gap 4: Fix Provide() examples in TSDoc

**Problem**: TSDoc examples on `BetterAuth` provider show `Provide(BetterAuth, opts, Use(...))` but the third argument must be `() => TNode`.

**Solution**: Update all TSDoc examples in `src/better-auth/provider.ts` and `src/better-auth/types.ts` to use the `() =>` wrapper.

**Files**: `src/better-auth/provider.ts`, `src/better-auth/types.ts`

Before:
```ts
Provide(BetterAuth, { client }, Use(BetterAuth, bridge => ...))
```

After:
```ts
Provide(BetterAuth, { client }, () => Use(BetterAuth, bridge => ...))
```

## Gap 5: Post-auth navigation hook

**Problem**: No callback to trigger navigation after successful sign-in/sign-up.

**Solution**: Add `onAuthSuccess` callback to `BetterAuthBridgeOptions`. Wire into sign-in and sign-up callbacks.

**File**: `src/better-auth/types.ts` — add to `BetterAuthBridgeOptions`:

```ts
onAuthSuccess?: (user: BetterAuthUser) => void
```

**File**: `src/better-auth/callbacks.ts` — after successful session refresh in `createSignInCallback` and `createSignUpCallback`, resolve the user from the session and call `onAuthSuccess`.

**File**: `src/better-auth/bridge.ts` — pass `options.onAuthSuccess` through to the callback factories.

## Gap 6: Structured signup errors

**Problem**: Signup rejection errors are generic strings with no field-level targeting.

**Solution**: Support structured error objects alongside string errors.

**File**: `src/better-auth/types.ts` — new types:

```ts
export interface AuthFieldError {
  field: string
  message: string
}

export type AuthError = string | AuthFieldError | AuthFieldError[]
```

**File**: `src/better-auth/callbacks.ts` — `handleResult` attempts to extract structured field errors from the better-auth response error object. If the error body contains field-level details, returns `AuthFieldError[]` instead of a plain string.

**File**: `src/components/auth/utils.ts` — `requestToControllerValidation` maps `AuthFieldError` objects to path-based `Validation.invalid()` entries, enabling per-field highlighting in forms. Falls back to root-level error for plain strings (current behavior).

## Files Changed Summary

| File | Change |
|------|--------|
| `src/better-auth/components/better-auth-container.ts` | Auto-provide AuthI18n |
| `src/better-auth/components/authenticated.ts` | Options bag with loading fallback |
| `src/components/auth/auth-email-prop.ts` | isBrowser() guard |
| `src/better-auth/provider.ts` | Fix TSDoc examples |
| `src/better-auth/types.ts` | Fix TSDoc, add `onAuthSuccess`, add `AuthFieldError` |
| `src/better-auth/callbacks.ts` | Wire `onAuthSuccess`, structured errors |
| `src/better-auth/bridge.ts` | Pass `onAuthSuccess` to callbacks |
| `src/components/auth/utils.ts` | Map `AuthFieldError` to validation paths |

## Testing Strategy

- Unit tests for `Authenticated`/`Unauthenticated` with pending/resolved states
- Unit test for `useAuthEmailProp` SSR behavior (mock `window` as undefined)
- Unit tests for `handleResult` with structured error responses
- Unit tests for `onAuthSuccess` callback invocation in sign-in/sign-up flows
- Integration test for `BetterAuthContainer` providing AuthI18n automatically
