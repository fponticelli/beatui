# Better-Auth Integration Gaps — Design Spec

Addresses 6 gaps identified during integration of `@tempots/beatui@1.5.0` better-auth components into a downstream app. All file paths are relative to `packages/beatui/`.

**Versioning**: These changes include breaking API changes (Gap 2) and require a **minor version bump** (pre-1.0 semver — breaking changes are expected). No deprecation adapters needed since the user confirmed breaking backward compatibility is acceptable.

## Gap 1: Auto-provide AuthI18n in BetterAuthContainer

**Problem**: `BetterAuthContainer` crashes with `Provider not found: AuthI18n` unless the app is wrapped in `BeatUI({ includeAuthI18n: true })`.

**Solution**: `BetterAuthContainer` will lazily import and provide `AuthI18n` itself, making it self-contained. The `AuthContainer` must be constructed inside the `Task` callback so that `Use(AuthI18n)` calls resolve against the newly provided context.

**File**: `src/better-auth/components/better-auth-container.ts`

```ts
import { TNode, Task, Provide } from '@tempots/dom'
import { AuthContainer, AuthContainerOptions } from '../../components/auth'
import { BetterAuthBridge } from '../types'

export function BetterAuthContainer(
  auth: BetterAuthBridge,
  overrides?: Partial<AuthContainerOptions>,
  ...children: TNode[]
) {
  return Task(
    () => import('../../auth-i18n/translations'),
    ({ AuthI18n }) => Provide(AuthI18n, {}, () =>
      AuthContainer({ ...auth.containerOptions, ...overrides }, ...children)
    )
  )
}
```

Unconditionally wrapping in `Provide(AuthI18n)` is safe — if already provided higher in the tree, the inner provider shadows with identical defaults.

## Gap 2: Loading fallback in Authenticated/Unauthenticated

**Problem**: Neither component handles `bridge.isPending`, leaving a blank screen during initial session fetch.

**Solution**: Add options bag with optional `loading` parameter. `Unauthenticated` defaults to rendering children while pending (showing the sign-in form during loading is a reasonable default).

**Tradeoff**: The default `Unauthenticated` behavior causes a brief flash of unauthenticated content if the user is actually authenticated but the session fetch hasn't completed. Consumers who want to avoid this flash should provide a `loading` fallback.

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

Before (actual code from provider.ts):
```ts
Provide(BetterAuth, { client: authClient, socialProviders: ['google'] },
  Use(BetterAuth, (bridge) =>
    AuthContainer(bridge.containerOptions)
  )
)
```

After:
```ts
Provide(BetterAuth, { client: authClient, socialProviders: ['google'] }, () =>
  Use(BetterAuth, (bridge) =>
    AuthContainer(bridge.containerOptions)
  )
)
```

## Gap 5: Post-auth navigation hook

**Problem**: No callback to trigger navigation after successful sign-in/sign-up.

**Solution**: Add `onAuthSuccess` callback to `BetterAuthBridgeOptions`. Wire into sign-in and sign-up callbacks.

**File**: `src/better-auth/types.ts` — add to `BetterAuthBridgeOptions`:

```ts
onAuthSuccess?: (user: BetterAuthUser) => void
```

**File**: `src/better-auth/callbacks.ts` — `createSignInCallback` and `createSignUpCallback` accept `onAuthSuccess` as a parameter. After `refreshSession()` succeeds, call `client.getSession()` to obtain the user and invoke `onAuthSuccess(user)`. The callback is only invoked when sign-in/sign-up succeeds (no error from `handleResult`).

```ts
export function createSignInCallback(
  client: BetterAuthClient,
  opts: BetterAuthBridgeOptions,
  onSuccess: () => Promise<void>,
  onAuthSuccess?: (user: BetterAuthUser) => void
): (data: SignInData) => Promise<string | null> {
  return async (data: SignInData) => {
    const result = await client.signIn.email({ ... })
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
```

**File**: `src/better-auth/bridge.ts` — pass `options.onAuthSuccess` to `createSignInCallback` and `createSignUpCallback`.

## Gap 6: Structured signup errors

**Problem**: Signup rejection errors are generic strings with no field-level targeting.

**Solution**: Support structured error objects alongside string errors.

**File**: `src/better-auth/types.ts` — new types:

```ts
export interface AuthFieldError {
  field: string
  message: string
}

export type AuthError = string | AuthFieldError[]
```

Note: `AuthError` is `string | AuthFieldError[]` (no singular `AuthFieldError` — a single field error is always wrapped in an array to simplify consumer code).

**Cascading type changes**:
- `handleResult` return type: `string | null` → `AuthError | null`
- `createSignInCallback` return type: `(data) => Promise<string | null>` → `(data) => Promise<AuthError | null>`
- `createSignUpCallback` return type: same change
- `SignInFormOptions.onSignIn` type: same change
- `SignUpFormOptions.onSignUp` type: same change
- `requestToControllerValidation` task parameter: `(value: T) => Promise<string | null>` → `(value: T) => Promise<AuthError | null>`

**File**: `src/better-auth/callbacks.ts` — `handleResult` inspects the error response. If the error body contains field-level details (e.g., `{ fieldErrors: { email: "..." } }`), returns `AuthFieldError[]`. Otherwise returns the error message string.

**File**: `src/components/auth/utils.ts` — `requestToControllerValidation` checks the task result type:
- `string` → current behavior (`Validation.invalid({ message })` at `['root']` path)
- `AuthFieldError[]` → maps each to `Validation.invalid({ message })` at `[field]` path, enabling per-field highlighting

## Files Changed Summary

| File | Change |
|------|--------|
| `src/better-auth/components/better-auth-container.ts` | Auto-provide AuthI18n via lazy import |
| `src/better-auth/components/authenticated.ts` | Options bag with loading fallback, export `AuthGuardOptions` |
| `src/components/auth/auth-email-prop.ts` | `isBrowser()` guard for SSR safety |
| `src/better-auth/provider.ts` | Fix TSDoc examples |
| `src/better-auth/types.ts` | Fix TSDoc, add `onAuthSuccess`, add `AuthFieldError`/`AuthError` |
| `src/better-auth/callbacks.ts` | Wire `onAuthSuccess`, structured errors in `handleResult` |
| `src/better-auth/bridge.ts` | Pass `onAuthSuccess` to callback factories |
| `src/components/auth/utils.ts` | Handle `AuthError` union in `requestToControllerValidation` |
| `src/components/auth/types.ts` | Update `onSignIn`/`onSignUp` return types to `AuthError \| null` |

## Testing Strategy

- Unit tests for `Authenticated`/`Unauthenticated` with pending → resolved state transitions
- Unit tests verifying `Authenticated` renders nothing (Empty) during pending by default
- Unit tests verifying `Unauthenticated` renders children during pending by default
- Unit tests verifying custom `loading` fallback renders during pending for both components
- Unit test for `useAuthEmailProp` SSR behavior (mock `window` as undefined)
- Unit tests for `handleResult` with plain string errors and structured field error responses
- Unit tests for `onAuthSuccess` callback — invoked on success, NOT invoked on failure
- Unit tests for `requestToControllerValidation` handling both `string` and `AuthFieldError[]`
- Integration test for `BetterAuthContainer` providing AuthI18n automatically (no crash without BeatUI root wrapper)
