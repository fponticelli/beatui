# Form Validation, Touched, and Dirty — Implementation Plan

This plan introduces per-field touched state, dirty tracking, and a configurable validation strategy across the form system. It is sequenced for incremental delivery and safe integration. Each phase includes concrete tasks, file pointers, and required tests so a junior engineer can execute confidently.

## Goals

- Validation modes:
  - onSubmit: validate only on submit; show all errors then.
  - continuous: validate on every change; show errors immediately.
  - touchedOrSubmit (default): validate on change; show errors only when field is touched or after submit.
- Add touched: per-field `touched` with `markTouched`, `resetTouched`, container `touchedDeep`, and `markAllTouched`.
- Add dirty: per-field `dirty` with `markPristine`, `reset` (revert to baseline), container `dirtyDeep`.
- Make error visibility consistent via a single `errorVisible` signal on `Controller` that respects the chosen validation mode.


## Prerequisites

- Run tests locally:
  - `pnpm --filter @tempots/beatui test`
  - Or from repo root: `pnpm test`
- Familiarize with these files:
  - `packages/beatui/src/components/form/controller/controller.ts`
  - `packages/beatui/src/components/form/controller/controller-validation.ts`
  - `packages/beatui/src/components/form/controller/union-controller.ts`
  - `packages/beatui/src/components/form/use-form.ts`
  - `packages/beatui/src/components/form/control/control-factory.ts`
  - `packages/beatui/src/components/json-schema/json-schema-form.ts`


## Phase 1 — Core: Touched and Error Visibility

Outcome: A `Controller` exposes `touched` and `errorVisible` so UIs can gate error display without changing validation logic.

Tasks:
1. In `controller.ts`, add to `Controller<T>`:
   - Private local: `#local.touched = prop(false)`.
   - Public API:
     - `touched: Signal<boolean> = this.#local.touched` (or `this.#local.touched.map(v => v)` if you want to harden against external sets).
     - `markTouched(): void` — sets `#local.touched` to `true`.
     - `resetTouched(): void` — sets `#local.touched` to `false`.
   - Add disposal for `#local.touched` in the constructor’s `onDispose` block.
2. Validation mode plumbing (read-only at this phase):
   - Extend the `parent` arg in `Controller`’s constructor to also accept `validationMode: Signal<'onSubmit' | 'continuous' | 'touchedOrSubmit'>` with default `'touchedOrSubmit'`.
   - Save `this.parent = parent` unchanged; you will pass `validationMode` in Phase 5 from `useController`.
3. Compute error visibility:
   - Add `errorVisible: Signal<boolean> = computedOf(this.hasError, parent.validationMode ?? constSignal('touchedOrSubmit'), this.#local.touched)((has, mode, touched) => { if (mode === 'continuous') return has; return touched && has; })`.
   - Dispose `errorVisible` alongside others.

Required tests:
- New test file: `packages/beatui/tests/unit/controller-touched.test.ts`:
  - `touched` defaults to false; `markTouched()` -> true; `resetTouched()` -> false.
  - `errorVisible` remains false if `hasError` true but `touched` false (mode default `touchedOrSubmit`).
  - `errorVisible` true when both `hasError` true and `touched` true.


## Phase 2 — Wire onBlur and Switch Wrappers to Error Visibility

Outcome: Inputs mark themselves touched on blur; wrappers display `errorVisible` by default.

Tasks:
1. In `control-factory.ts`:
   - Update `makeOnBlurHandler` to call `controller.markTouched()` before delegating to `onBlur`.
   - Change `hasError: controller.hasError` to `hasError: controller.errorVisible` inside `BaseControl` so all controls gate errors by default.
2. Optionally, update low-level connectors in `use-form.ts` (`connectStringInput`, `connectNumberInput`) to add `on.blur(() => value.markTouched())`. This is redundant if all UI flows through the factory; do it only if these helpers are used standalone in docs/tests.

Required tests:
- Update or add: `packages/beatui/tests/unit/control-factory-blur.test.ts`:
  - Creating a control with a controller that has a validation error does not show error until `blur` triggers `markTouched()`.
  - After blur, error is visible.


## Phase 3 — Container Touched Aggregation and markAllTouched

Outcome: Objects/arrays report deep touched, and can mark all children touched.

Tasks:
1. In `ObjectController`:
   - Add `touchedDeep: Signal<boolean>` as `computedOf( this.touched, ...child.touched )`.
   - Implementation approach: maintain a `Map<key, boolean>` of child touched; recompute an internal `prop(false)` aggregate when children change; expose as a mapped signal. Subscribe when creating child controllers in `field()`, and unsubscribe in the disposal block (on controller disposal and when controllers are replaced or removed).
   - Add `markAllTouched()` to call `this.markTouched()` and iterate `#controllers.values()` to call `markTouched()` on each child.
2. In `ArrayController`:
   - Same as object: add `touchedDeep`, maintain child subscriptions in `item()` and in the existing `arr.on` length watcher to remove subscriptions when elements are trimmed.
   - `markAllTouched()` should call `markTouched()` and then for `i in 0..length-1` call `this.item(i).markTouched()` (this will lazily create missing controllers as needed).

Required tests:
- New file: `packages/beatui/tests/unit/controller-touched-deep.test.ts`:
  - `touchedDeep` is true when any child is touched.
  - `markAllTouched()` sets `touched` and child `touched` to true for nested structures (object of array and array of objects).


## Phase 4 — Dirty Baseline, Equals, markPristine, reset

Outcome: Per-controller dirty computed against a baseline, with ability to mark pristine and reset.

Tasks:
1. In `Controller<T>`:
   - Store a private `#baseline: T` initialized from the current `value.value` at construction time.
   - Add a private `#equals: (a: T, b: T) => boolean` with default `strictEqual`.
   - Add `dirty: Signal<boolean> = this.value.map(v => !this.#equals(v, this.#baseline))`.
   - Add `markPristine(): void` to set `#baseline = this.value.value`.
   - Add `reset(): void` to call `this.change(this.#baseline)`.
   - Dispose `dirty` in `onDispose`.
   - Update the `Controller` constructor signature to accept an optional `equals` (default `strictEqual`), and thread it through when constructing sub-controllers.
2. In `ObjectController` and `ArrayController`:
   - Update `super(...)` calls to pass the provided `equals` they already accept.
   - Add `dirtyDeep: Signal<boolean>` aggregating children’s `dirty` OR structure changes (for arrays: length changes or item reorders). A simple approach is to compute `!equals(value.value, #baseline)` to include structure; if performance is a concern, fallback to child aggregation + length comparison.
   - Override `markPristine()` to set own baseline and cascade to children; override `reset()` to revert own value to baseline (which also resets children values).
3. In `transform()` / `asyncTransform()`:
   - Accept `equals` for `Out` as already present. Pass it to the subcontroller constructor so `dirty` works in the transformed space.
   - Initialize subcontroller’s baseline as `transform(parent.#baseline)` and keep that in sync on `markPristine()` of the parent. Easiest is to rely on the subcontroller’s own `markPristine()` being called when parent’s is called (document and implement cascade in containers; for raw transform, this may not cascade automatically — you can either document it or add a small internal hook to tie them together).
4. In `useController`:
   - Allow passing `equals?: (a: T, b: T) => boolean` in options (default `strictEqual`), and pass it into the root `Controller` constructor.

Required tests:
- New: `packages/beatui/tests/unit/controller-dirty.test.ts`:
  - Baseline equals initial value; `dirty` false initially; after `change`, `dirty` true.
  - `markPristine()` flips `dirty` to false with current value.
  - `reset()` restores baseline value and flips `dirty` to false.
  - For `object()` with a deep-equals predicate, nested property change sets `dirty` true.
- New: `packages/beatui/tests/unit/controller-dirty-deep.test.ts`:
  - `dirtyDeep` true when any child dirty or array length changes.
  - `markPristine()` cascades and sets `dirtyDeep` false.


## Phase 5 — Validation Mode and Debounce in useController/useForm

Outcome: Mode controls when validation runs and when errors are visible. Optional debounce for continuous validation.

Tasks:
1. Types:
   - Add `export type ValidationMode = 'onSubmit' | 'continuous' | 'touchedOrSubmit'` in `use-form.ts` (or a new file exported via `form/index.ts`).
2. `useController`:
   - Extend options with `validationMode?: ValidationMode` and `validateDebounceMs?: number`.
   - Create `const validationModeSignal = prop(validationMode ?? 'touchedOrSubmit')` and pass it to `new Controller(..., { disabled: disabledSignal, validationMode: validationModeSignal })`.
   - Change `change(v)` logic to call `validate(v)` only when:
     - mode === 'continuous' -> always validate on change (with optional debounce).
     - mode === 'touchedOrSubmit' -> validate on change (no debounce initially; optionally behind `validateDebounceMs`).
     - mode === 'onSubmit' -> do NOT validate on change.
   - Debounce: If `validateDebounceMs` is set, wrap the `validate(v)` call in a timeout; cancel pending timer on new changes.
3. `useForm`:
   - Accept and forward `validationMode` and `validateDebounceMs` to `useController`.
   - On submit: always `controller.markAllTouched()`; for `onSubmit` mode, run validation once here and `setStatus` with the result.
4. Expose mode via `Controller` already (Phase 1) so `errorVisible` respects the mode. No extra UI changes needed because `BaseControl` uses `errorVisible`.

Required tests:
- New: `packages/beatui/tests/unit/validation-modes.test.ts`:
  - onSubmit: editing does not change `status`; submit triggers validation; errors visible after submit only.
  - continuous: `status` updates on every change; error visible immediately without blur.
  - touchedOrSubmit: `status` updates on change; error visible only after blur (or after submit via `markAllTouched`).
  - Debounce: with `validateDebounceMs`, quick consecutive changes result in a single validation (use fake timers in Vitest).


## Phase 6 — JSONSchemaForm: Honor Validation Mode

Outcome: JSON Schema forms integrate with modes without changing existing sanitization behavior.

Tasks:
1. In `json-schema-form.ts`:
   - Extend `JSONSchemaFormProps<T>` to include `validationMode?: ValidationMode` and `validateDebounceMs?: number` (re-export ValidationMode from `use-form.ts`).
   - When calling `useController`, pass these props through.
   - If `validationMode === 'onSubmit'`, do not pass `validate` into `useController` (so it won’t run on change); instead, run AJV validation in the `onSubmit` handler and pipe the result to `setStatus`.
   - Keep `sanitizeAdditional` logic as-is (orthogonal to validation visibility).

Required tests:
- New or extend: `packages/beatui/tests/unit/json-schema-validation-modes.test.ts`:
  - onSubmit: errors appear only after submit.
  - touchedOrSubmit: errors computed on change but only visible after blur or submit.
  - continuous: errors computed and visible on each change.


## Phase 7 — UnionController and Other Constructors

Outcome: All places constructing `Controller` pass the new constructor signature and the parent’s `validationMode`.

Tasks:
1. Update `union-controller.ts`:
   - For each `new Controller(...)` call, pass the parent object as `{ disabled: this.disabled, validationMode: (this as Controller<T>).parent.validationMode }` so children inherit the same mode.
   - Also pass appropriate `equals` function where you already map values to branch types.
2. Update `ObjectController.field()` and `ArrayController.item()` super/sub calls similarly (if not already covered in Phase 4).

Required tests:
- New: `packages/beatui/tests/unit/union-controller-validation.test.ts`:
  - Switching branches preserves `validationMode` and error visibility behavior.
  - Dirty works within branches (changing active controller value toggles `dirty`).


## Phase 8 — Documentation and Migration Notes

Outcome: Clear docs and minimal friction for users.

Tasks:
1. README updates (or a dedicated docs page):
   - Introduce `ValidationMode` with examples.
   - Show `touched` and `dirty` usage (`markAllTouched`, `markPristine`, `reset`).
   - Note that wrappers now use `errorVisible` by default; in continuous mode, errors appear immediately.
2. Changelog: mention `Controller` constructor expanded to accept `equals` and parent now supports `validationMode`.


## Edge Cases & Notes

- Equality: For complex objects/arrays, expose `equals` parameters on `useController`, `object()`, `array()`, and `transform()` so callers can opt into deep equality where needed. Defaults remain `strictEqual` for performance.
- Performance: If `dirtyDeep` uses value-vs-baseline equality for arrays/objects, consider micro-optimizations later; start with correctness.
- Disposal: Ensure every new signal and subscription (`touched`, `errorVisible`, aggregates) is disposed in existing `onDispose` blocks to prevent leaks.
- Async transforms: For `asyncTransform`, document that `markPristine()` may need to be called on the transformed controller separately unless you wire a cascade.


## Summary Checklist

- [ ] Controller: `touched`, `markTouched`, `resetTouched`, `errorVisible`
- [ ] control-factory: blur marks touched; wrappers use `errorVisible`
- [ ] Containers: `touchedDeep`, `markAllTouched`
- [ ] Controller: `dirty`, `markPristine`, `reset`, constructor `equals`
- [ ] Containers: `dirtyDeep` and cascades
- [ ] useController/useForm: `validationMode`, optional debounce
- [ ] JSONSchemaForm: honors mode
- [ ] UnionController: passes `validationMode` and `equals`
- [ ] Tests: all new unit tests green
- [ ] Docs updated


## Test File Map (to create)

- `packages/beatui/tests/unit/controller-touched.test.ts`
- `packages/beatui/tests/unit/control-factory-blur.test.ts`
- `packages/beatui/tests/unit/controller-touched-deep.test.ts`
- `packages/beatui/tests/unit/controller-dirty.test.ts`
- `packages/beatui/tests/unit/controller-dirty-deep.test.ts`
- `packages/beatui/tests/unit/validation-modes.test.ts`
- `packages/beatui/tests/unit/json-schema-validation-modes.test.ts`
- `packages/beatui/tests/unit/union-controller-validation.test.ts`

Each should use Vitest and `@testing-library/dom` helpers as appropriate.

