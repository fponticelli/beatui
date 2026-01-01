import { Signal, Value } from '@tempots/dom'
import { Path } from './path'
import { Controller } from './controller'
import {
  makeMapValidation,
  ControllerValidation,
} from './controller-validation'
import { strictEqual } from '@tempots/std'

/**
 * Union type definition for the controller
 */
export interface UnionBranch<T = unknown> {
  /** Unique identifier for this branch */
  key: string
  /** Display label for this branch */
  label: string
  /** Type guard function to detect if a value belongs to this branch */
  detect: (value: unknown) => boolean
  /** Function to convert a value to this branch type */
  convert?: (value: unknown) => { ok: true; value: T } | { ok: false }
  /** Default value for this branch when switching to it */
  defaultValue: () => T
}

export type ValidationMode = 'onSubmit' | 'eager' | 'onTouched'

/**
 * Controller for union types that manages multiple possible value types
 */
export class UnionController<T> extends Controller<T> {
  readonly branches: readonly UnionBranch[]
  readonly activeBranch: Signal<string>
  readonly #activeBranchController: Signal<Controller<unknown>>
  readonly #branchControllers = new Map<string, Controller<unknown>>()

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
   * Get the controller for the currently active branch
   */
  get activeController(): Controller<unknown> {
    return Value.get(this.#activeBranchController)
  }

  /**
   * Get a controller for a specific branch
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
   * Switch to a different branch
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
   * Get the current active branch definition
   */
  get activeBranchDefinition(): UnionBranch | undefined {
    const activeBranchKey = Value.get(this.activeBranch)
    return this.branches.find(b => b.key === activeBranchKey)
  }
}
