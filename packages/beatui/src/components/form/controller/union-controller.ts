import { Signal, Value } from '@tempots/dom'
import { Path } from './path'
import { Controller } from './controller'
import {
  makeMapValidation,
  ControllerValidation,
} from './controller-validation'
import { strictEqual } from '@tempots/std'

/**
 * Defines a single branch (variant) within a union type for use with {@link UnionController}.
 *
 * Each branch has a unique key, a display label, a detection predicate, an optional
 * conversion function for migrating values between branches, and a factory for default values.
 *
 * @typeParam T - The value type produced by this branch
 *
 * @example
 * ```typescript
 * const stringBranch: UnionBranch<string> = {
 *   key: 'string',
 *   label: 'Text',
 *   detect: (v) => typeof v === 'string',
 *   defaultValue: () => '',
 * }
 *
 * const numberBranch: UnionBranch<number> = {
 *   key: 'number',
 *   label: 'Number',
 *   detect: (v) => typeof v === 'number',
 *   convert: (v) => {
 *     const n = Number(v)
 *     return isNaN(n) ? { ok: false } : { ok: true, value: n }
 *   },
 *   defaultValue: () => 0,
 * }
 * ```
 */
export interface UnionBranch<T = unknown> {
  /** Unique identifier for this branch (used as path segment and lookup key) */
  key: string
  /** Human-readable display label for this branch, shown in UI selectors */
  label: string
  /** Type guard function that returns `true` if a value belongs to this branch */
  detect: (value: unknown) => boolean
  /** Optional function to convert a value from another branch to this branch's type. Returns `{ ok: true, value }` on success or `{ ok: false }` on failure. */
  convert?: (value: unknown) => { ok: true; value: T } | { ok: false }
  /** Factory function that produces the default value when switching to this branch */
  defaultValue: () => T
}

/**
 * Determines when validation errors are displayed.
 *
 * - `'onSubmit'` - Errors shown only after form submission
 * - `'eager'` - Errors shown immediately as values change
 * - `'onTouched'` - Errors shown after the field has been touched/blurred
 */
export type ValidationMode = 'onSubmit' | 'eager' | 'onTouched'

/**
 * Controller for union/discriminated types that manages multiple possible value branches.
 *
 * Extends `Controller<T>` to support values that can be one of several types.
 * Automatically detects which branch is active based on the current value,
 * creates per-branch sub-controllers lazily, and supports switching between branches
 * with optional value conversion.
 *
 * @typeParam T - The union type representing all possible value shapes
 *
 * @example
 * ```typescript
 * import { UnionController, UnionBranch } from '@tempots/beatui'
 *
 * type Value = string | number
 *
 * const branches: UnionBranch[] = [
 *   { key: 'string', label: 'Text', detect: v => typeof v === 'string', defaultValue: () => '' },
 *   { key: 'number', label: 'Number', detect: v => typeof v === 'number', defaultValue: () => 0 },
 * ]
 *
 * // The active branch is automatically detected from the current value
 * console.log(unionCtrl.activeBranch.value) // 'string' or 'number'
 *
 * // Switch to a different branch
 * unionCtrl.switchToBranch('number')
 * ```
 */
export class UnionController<T> extends Controller<T> {
  /** The immutable list of branch definitions for this union */
  readonly branches: readonly UnionBranch[]
  /** Reactive signal containing the key of the currently active branch */
  readonly activeBranch: Signal<string>
  /** @internal Reactive signal containing the controller for the active branch */
  readonly #activeBranchController: Signal<Controller<unknown>>
  /** @internal Cache of lazily-created branch controllers */
  readonly #branchControllers = new Map<string, Controller<unknown>>()

  /**
   * Creates a new UnionController.
   *
   * @param path - The path segments identifying this controller in the form tree
   * @param change - Callback to propagate value changes to the parent
   * @param signal - Reactive signal holding the current union value
   * @param status - Reactive signal holding the current validation status
   * @param parent - Parent context providing disabled state and optional validation mode
   * @param branches - Array of branch definitions describing the possible value types
   * @param equals - Optional equality function for comparing values. Defaults to `strictEqual`.
   */
  constructor(
    path: Path,
    change: (value: T) => void,
    signal: Signal<T>,
    status: Signal<ControllerValidation>,
    parent: {
      disabled: Signal<boolean>
      validationMode?: Signal<ValidationMode>
    },
    branches: UnionBranch[],
    equals: (a: T, b: T) => boolean = strictEqual
  ) {
    super(path, change, signal, status, parent, equals)

    this.branches = branches

    // Determine the active branch based on current value
    const detectActiveBranch = (val: T): string => {
      for (const branch of branches) {
        if (branch.detect(val)) {
          return branch.key
        }
      }
      // Fallback to first branch if no match
      return branches[0]?.key ?? 'unknown'
    }

    // Create active branch signal
    this.activeBranch = signal.map(detectActiveBranch, strictEqual)

    // Create branch controllers lazily
    const getBranchController = (branchKey: string): Controller<unknown> => {
      if (this.#branchControllers.has(branchKey)) {
        return this.#branchControllers.get(branchKey)!
      }

      const branch = branches.find(b => b.key === branchKey)
      if (!branch) {
        throw new Error(`Unknown branch: ${branchKey}`)
      }

      // Create a controller for this specific branch
      const branchController = new Controller(
        [...path, branchKey],
        (branchValue: unknown) => {
          // When branch value changes, update the main value
          this.change(branchValue as T)
        },
        this.signal.map(
          (val: T) => {
            // Extract the value for this branch
            if (branch.detect(val)) {
              return val as unknown
            }
            // If current value doesn't match this branch, return default
            return branch.defaultValue() as unknown
          },
          equals as (a: unknown, b: unknown) => boolean
        ),
        status.map(makeMapValidation([branchKey])),
        {
          disabled: this.disabled,
          validationMode: this.parent.validationMode,
        },
        equals as (a: unknown, b: unknown) => boolean
      )

      this.#branchControllers.set(branchKey, branchController)
      return branchController
    }

    // Create reactive controller for the active branch
    this.#activeBranchController = this.activeBranch.map(
      branchKey => getBranchController(branchKey),
      strictEqual
    )

    // Register disposal of child controllers and resources
    this.onDispose(() => {
      for (const controller of this.#branchControllers.values()) {
        controller.dispose()
      }
      this.#branchControllers.clear()
      this.activeBranch.dispose()
      this.#activeBranchController.dispose()
    })
  }

  /**
   * Gets the controller for the currently active branch.
   *
   * The returned controller's value and type correspond to the branch that
   * matches the current union value.
   *
   * @returns The `Controller<unknown>` for the active branch
   */
  get activeController(): Controller<unknown> {
    return Value.get(this.#activeBranchController)
  }

  /**
   * Gets or creates a controller for a specific branch by key.
   *
   * Controllers are created lazily and cached for subsequent calls.
   *
   * @param branchKey - The unique key of the branch to get a controller for
   * @returns The `Controller<unknown>` for the specified branch
   * @throws Error if the branch key is not found in the branches array
   */
  getBranchController(branchKey: string): Controller<unknown> {
    const branch = this.branches.find(b => b.key === branchKey)
    if (!branch) {
      throw new Error(`Unknown branch: ${branchKey}`)
    }

    if (this.#branchControllers.has(branchKey)) {
      return this.#branchControllers.get(branchKey)!
    }

    // Create controller lazily
    const branchController = new Controller(
      [...this.path, branchKey],
      (branchValue: unknown) => {
        this.change(branchValue as T)
      },
      this.signal.map(
        (val: T) => {
          if (branch.detect(val)) {
            return val as unknown
          }
          return branch.defaultValue() as unknown
        },
        strictEqual as (a: unknown, b: unknown) => boolean
      ),
      this.status.map(makeMapValidation([branchKey])),
      {
        disabled: this.disabled,
        validationMode: this.parent.validationMode,
      },
      strictEqual as (a: unknown, b: unknown) => boolean
    )

    this.#branchControllers.set(branchKey, branchController)
    return branchController
  }

  /**
   * Switches the union value to a different branch.
   *
   * Attempts the following in order:
   * 1. If already on the target branch, returns `true` immediately
   * 2. If the branch has a `convert` function, tries to convert the current value
   * 3. If conversion fails and `confirmChange` is true, prompts the user with `window.confirm`
   * 4. Sets the value to the branch's default value
   *
   * @param branchKey - The key of the branch to switch to
   * @param confirmChange - If true, prompts the user before losing the current value when conversion fails
   * @returns `true` if the switch was successful, `false` if the user cancelled
   * @throws Error if the branch key is not found in the branches array
   */
  switchToBranch(branchKey: string, confirmChange = false): boolean {
    const branch = this.branches.find(b => b.key === branchKey)
    if (!branch) {
      throw new Error(`Unknown branch: ${branchKey}`)
    }

    const currentValue = Value.get(this.signal)

    // If already on this branch, do nothing
    if (branch.detect(currentValue)) {
      return true
    }

    // Try to convert current value to new branch
    if (branch.convert) {
      const conversion = branch.convert(currentValue)
      if (conversion.ok) {
        this.change(conversion.value as T)
        return true
      }
    }

    // If conversion failed, ask for confirmation if required
    if (confirmChange) {
      if (typeof window === 'object' && typeof window.confirm === 'function') {
        const ok = window.confirm(
          'Changing type will clear the current value. Continue?'
        )
        if (!ok) return false
      }
    }

    // Set to default value for the new branch
    const defaultValue = branch.defaultValue()
    this.change(defaultValue as T)
    return true
  }

  /**
   * Gets the {@link UnionBranch} definition for the currently active branch.
   *
   * @returns The active branch definition, or `undefined` if no branch matches
   */
  get activeBranchDefinition(): UnionBranch | undefined {
    const activeBranchKey = Value.get(this.activeBranch)
    return this.branches.find(b => b.key === activeBranchKey)
  }
}
