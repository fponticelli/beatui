import { computedOf, prop, Signal } from '@tempots/dom'
import { Path, PathSegment, pathToString } from './path'
import {
  ControllerError,
  makeMapValidation,
  ControllerValidation,
} from './controller-validation'
import { strictEqual } from '@tempots/std'
import { ValidationMode } from './union-controller'

/**
 * Reactive form field controller that manages value, validation state, touched/dirty tracking, and disabled state.
 * Provides the foundation for type-safe form handling with fine-grained reactivity.
 *
 * @template T - The type of the value managed by this controller
 *
 * @example
 * ```typescript
 * import { prop } from '@tempots/dom'
 * import { Controller } from '@tempots/beatui'
 * import { Validation } from '@tempots/std'
 *
 * const valueSignal = prop('initial')
 * const statusSignal = prop(Validation.valid)
 * const disabledSignal = prop(false)
 *
 * const controller = new Controller(
 *   ['email'],
 *   (value) => { valueSignal.set(value) },
 *   valueSignal,
 *   statusSignal,
 *   { disabled: disabledSignal }
 * )
 *
 * // Access reactive properties
 * controller.signal.value // Current value
 * controller.hasError.value // Boolean error state
 * controller.touched.value // User interaction tracking
 * controller.dirty.value // Differs from baseline
 * ```
 */
export class Controller<T> {
  /** The path segments identifying this controller's position in the form hierarchy (e.g., ['user', 'email']). */
  readonly path: Path
  /** Callback to propagate value changes up to the parent form. */
  readonly change: (value: T) => void
  /** Reactive signal containing the current field value. */
  readonly signal: Signal<T>
  /** Reactive signal containing the current validation state (valid, pending, or invalid with errors). */
  readonly status: Signal<ControllerValidation>
  /** Reactive signal containing the current error message string, or undefined if valid. */
  readonly error: Signal<undefined | string>
  /** Reactive signal indicating whether this field has any errors. */
  readonly hasError: Signal<boolean>
  /** Reactive signal tracking whether the user has interacted with this field. */
  readonly touched: Signal<boolean>
  /** Reactive signal indicating whether errors should be shown (respects validation mode and touched state). */
  readonly errorVisible: Signal<boolean>
  /** Reactive signal tracking whether the current value differs from the baseline. */
  readonly dirty: Signal<boolean>
  /** Reactive signal containing nested field errors for child controllers. */
  readonly dependencyErrors: Signal<
    undefined | Record<string | number, ControllerError>
  >
  readonly #local = {
    disabled: prop(false),
    touched: prop(false),
  }
  readonly #equals: (a: T, b: T) => boolean
  #baseline = prop<T>(undefined as unknown as T)
  /** Parent controller context providing disabled state and optional validation mode. */
  protected readonly parent: {
    disabled: Signal<boolean>
    // Optional validation mode signal supplied by useController/useForm
    validationMode?: Signal<ValidationMode>
  }
  /** Reactive signal indicating whether this field is disabled (combines local and parent disabled state). */
  readonly disabled: Signal<boolean>
  readonly #disposeCallbacks: (() => void)[] = []

  /** Reactive signal indicating whether this field is disabled OR has errors (useful for submit button state). */
  readonly disabledOrHasErrors: Signal<boolean>

  /**
   * Creates a new Controller instance.
   *
   * @param path - Field path segments in the form hierarchy
   * @param change - Callback to propagate value changes
   * @param signal - Reactive signal holding the field value
   * @param status - Reactive signal holding validation state
   * @param parent - Parent context with disabled state and optional validation mode
   * @param equals - Equality function for dirty tracking (defaults to strictEqual)
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
    equals: (a: T, b: T) => boolean = strictEqual
  ) {
    this.path = path
    this.change = change
    this.signal = signal
    this.status = status
    this.#equals = equals
    this.#baseline.set(signal.value)
    this.error = status.map(s =>
      s?.type === 'invalid' ? s.error?.message : undefined
    )
    this.hasError = this.error.map(e => e != null)
    this.touched = this.#local.touched
    // Error visibility respects validation mode if provided by parent
    if (parent.validationMode) {
      this.errorVisible = computedOf(
        this.hasError,
        this.touched,
        parent.validationMode
      )((hasError, touched, mode) => {
        if (mode === 'eager') return !!hasError
        // onSubmit and onTouched gate on touched
        return !!hasError && !!touched
      })
    } else {
      this.errorVisible = computedOf(
        this.hasError,
        this.touched
      )((hasError, touched) => !!hasError && !!touched)
    }
    this.dirty = computedOf(
      this.signal,
      this.#baseline
    )((v, b) => !this.#equals(v, b))
    this.dependencyErrors = status.map(s =>
      s?.type === 'invalid' ? s.error?.dependencies : undefined
    )
    this.parent = parent
    this.disabled = computedOf(
      this.#local.disabled,
      parent.disabled
    )((local, parent) => local || parent)

    this.disabledOrHasErrors = computedOf(
      this.disabled,
      this.hasError
    )((d, e) => d || e)

    // Register disposal of internal resources
    this.onDispose(() => {
      this.#local.disabled.dispose()
      this.#local.touched.dispose()
      this.disabled.dispose()
      this.error.dispose()
      this.errorVisible.dispose()
      this.dirty.dispose()
      this.#baseline.dispose()
      this.dependencyErrors.dispose()
      this.disabledOrHasErrors.dispose()
    })
  }

  /**
   * Returns the field name as a dot-separated string (e.g., "user.email").
   */
  get name() {
    return pathToString(this.path)
  }

  /**
   * Registers a callback to be executed when this controller is disposed.
   *
   * @param callback - Function to execute on disposal
   */
  readonly onDispose = (callback: () => void) => {
    this.#disposeCallbacks.push(callback)
  }

  /**
   * Disposes all internal resources and registered callbacks.
   * Should be called when the controller is no longer needed to prevent memory leaks.
   */
  readonly dispose = () => {
    // Call user-registered dispose callbacks first
    for (const callback of this.#disposeCallbacks) {
      try {
        callback()
      } catch (error) {
        console.error('Error in dispose callback:', error)
      }
    }
    this.#disposeCallbacks.length = 0
  }

  /**
   * Sets the disabled state for this field.
   *
   * @param disabled - Whether the field should be disabled
   */
  readonly setDisabled = (disabled: boolean) => {
    this.#local.disabled.set(disabled)
  }

  /**
   * Disables this field.
   */
  readonly disable = () => this.setDisabled(true)

  /**
   * Enables this field.
   */
  readonly enable = () => this.setDisabled(false)

  /**
   * Marks this field as touched (user has interacted with it).
   */
  readonly markTouched = () => {
    this.#local.touched.set(true)
  }

  /**
   * Resets the touched state to false.
   */
  readonly resetTouched = () => {
    this.#local.touched.set(false)
  }

  /**
   * Marks the current value as the new baseline for dirty tracking.
   */
  readonly markPristine = () => {
    this.#baseline.set(this.signal.value)
  }

  /**
   * Resets the field value to the baseline value.
   */
  readonly reset = () => {
    this.change(this.#baseline.value)
  }

  /**
   * Casts this controller to an ArrayController for managing array values.
   *
   * @param equals - Equality function for array comparison (defaults to strictEqual)
   * @returns An ArrayController instance
   */
  readonly array = (equals: (a: T, b: T) => boolean = strictEqual) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ArrayController<T extends any[] ? T : never>(
      this.path,
      this.change,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.signal as unknown as Signal<T extends any[] ? T : never>,
      this.status,
      this.parent,
      equals
    )
  }

  /**
   * Casts this controller to an ObjectController for managing object values with field access.
   *
   * @param equals - Equality function for object comparison (defaults to strictEqual)
   * @returns An ObjectController instance
   */
  readonly object = (equals: (a: T, b: T) => boolean = strictEqual) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ObjectController<T extends Record<string, any> ? T : never>(
      this.path,
      this.change,
      this.signal as unknown as Signal<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        T extends Record<string, any> ? T : never
      >,
      this.status,
      this.parent,
      equals
    )
  }

  /**
   * Creates a transformed controller that maps values bidirectionally.
   * Useful for converting between internal and display representations.
   *
   * @template Out - The transformed value type
   * @param transform - Function to convert from T to Out
   * @param untransform - Function to convert from Out back to T
   * @param subpath - Optional path segments to append
   * @param equals - Equality function for the transformed type
   * @returns A new Controller instance managing the transformed value
   *
   * @example
   * ```typescript
   * // Transform number to string for text input
   * const stringController = numberController.transform(
   *   (n) => n.toString(),
   *   (s) => parseFloat(s) || 0
   * )
   * ```
   */
  readonly transform = <Out>(
    transform: (value: T) => Out,
    untransform: (value: Out) => T,
    subpath: PathSegment[] = [],
    equals: (a: Out, b: Out) => boolean = strictEqual
  ) => {
    return new Controller(
      [...this.path, ...subpath],
      (value: Out) => this.change(untransform(value)),
      this.signal.map(transform, equals),
      this.status.map(makeMapValidation(subpath)),
      this.parent,
      equals
    )
  }

  /**
   * Creates a transformed controller with async bidirectional mapping.
   * Useful for async operations like fetching related data or formatting.
   *
   * @template Out - The transformed value type
   * @param transform - Async function to convert from T to Out
   * @param untransform - Async function to convert from Out back to T
   * @param alt - Fallback value while async transform is pending
   * @param subpath - Optional path segments to append
   * @param equals - Equality function for the transformed type
   * @returns A new Controller instance managing the async-transformed value
   */
  readonly asyncTransform = <Out>(
    transform: (value: T) => Promise<Out>,
    untransform: (value: Out) => Promise<T>,
    alt: Out,
    subpath: PathSegment[] = [],
    equals: (a: Out, b: Out) => boolean = strictEqual
  ) => {
    return new Controller(
      [...this.path, ...subpath],
      (value: Out) => {
        untransform(value).then(v => this.change(v))
      },
      this.signal.mapAsync(transform, alt, undefined, equals),
      this.status.map(makeMapValidation(subpath)),
      this.parent,
      equals
    )
  }
}

/**
 * Controller specialized for object values that provides field-level access via the `.field()` method.
 * Automatically tracks deep touched and dirty states by monitoring all child field controllers.
 *
 * @template T - The object type managed by this controller
 *
 * @example
 * ```typescript
 * import { prop } from '@tempots/dom'
 * import { ObjectController } from '@tempots/beatui'
 * import { Validation } from '@tempots/std'
 *
 * const valueSignal = prop({ email: '', password: '' })
 * const statusSignal = prop(Validation.valid)
 * const disabledSignal = prop(false)
 *
 * const controller = new ObjectController(
 *   [],
 *   (value) => { valueSignal.set(value) },
 *   valueSignal,
 *   statusSignal,
 *   { disabled: disabledSignal }
 * )
 *
 * // Access field controllers
 * const emailController = controller.field('email')
 * const passwordController = controller.field('password')
 *
 * // Deep state tracking
 * controller.touchedDeep.value // True if any field is touched
 * controller.dirtyDeep.value // True if any field is dirty
 * ```
 */
export class ObjectController<T extends object> extends Controller<T> {
  readonly #controllers = new Map<keyof T, Controller<unknown>>()
  readonly #childTouched = new Map<keyof T, boolean>()
  readonly #childTouchedCancel = new Map<keyof T, () => void>()
  readonly #touchedDeep = prop(false)
  /** Reactive signal indicating whether this field or any child field is touched. */
  readonly touchedDeep: Signal<boolean> = this.#touchedDeep
  readonly #childDirty = new Map<keyof T, boolean>()
  readonly #childDirtyCancel = new Map<keyof T, () => void>()
  readonly #dirtyDeep = prop(false)
  /** Reactive signal indicating whether this field or any child field is dirty. */
  readonly dirtyDeep: Signal<boolean> = this.#dirtyDeep
  readonly #parentTouchedCancel: () => void
  readonly #parentDirtyCancel: () => void

  readonly #recomputeTouchedDeep = () => {
    let anyChild = false
    for (const v of this.#childTouched.values()) {
      if (v) {
        anyChild = true
        break
      }
    }
    this.#touchedDeep.set(this.touched.value || anyChild)
  }

  constructor(
    path: Path,
    change: (value: T) => void,
    signal: Signal<T>,
    status: Signal<ControllerValidation>,
    parent: {
      disabled: Signal<boolean>
    },
    equals: (a: T, b: T) => boolean
  ) {
    super(
      path,
      change,
      signal.map(v => (v == null ? {} : v) as T, equals),
      status,
      parent,
      equals
    )

    // Keep aggregates in sync when parent touched/dirty change
    this.#parentTouchedCancel = this.touched.on(() => {
      this.#recomputeTouchedDeep()
    })
    this.#parentDirtyCancel = this.dirty.on(() => {
      this.#recomputeDirtyDeep()
    })
    // Also recompute when value changes (covers structural changes and baseline compares)
    const cancelValue = this.signal.on(() => this.#recomputeDirtyDeep())

    // Register disposal of child controllers
    this.onDispose(() => {
      for (const controller of this.#controllers.values()) {
        controller.dispose()
      }
      this.#controllers.clear()
      for (const cancel of this.#childTouchedCancel.values()) cancel()
      this.#childTouchedCancel.clear()
      this.#childTouched.clear()
      this.#touchedDeep.dispose()
      for (const cancel of this.#childDirtyCancel.values()) cancel()
      this.#childDirtyCancel.clear()
      this.#childDirty.clear()
      this.#dirtyDeep.dispose()
      this.#parentTouchedCancel()
      this.#parentDirtyCancel()
      cancelValue()
    })
  }

  /**
   * Gets or creates a controller for a specific field in the object.
   * Controllers are cached and reused for the same field name.
   *
   * @template K - The field key type
   * @param field - The field name to access
   * @returns A Controller instance for the specified field
   *
   * @example
   * ```typescript
   * const emailController = userController.field('email')
   * const nameController = userController.field('name')
   * ```
   */
  readonly field = <K extends keyof T & string>(field: K) => {
    if (this.#controllers.has(field)) {
      return this.#controllers.get(field)! as Controller<T[K]>
    }
    const onChange = async (value: T[K]) => {
      this.change({
        ...this.signal.value,
        [field]: value,
      })
    }
    const controller = new Controller(
      [...this.path, field],
      onChange,
      this.signal.map((v: T) => v[field] as T[K]),
      this.status.map(makeMapValidation([field])),
      {
        disabled: this.disabled,
        // propagate validationMode to children if present
        validationMode: this.parent.validationMode,
      }
    )
    this.#controllers.set(field, controller as Controller<unknown>)
    // Track child touched for aggregation
    const cancel = controller.touched.on(v => {
      this.#childTouched.set(field, v)
      this.#recomputeTouchedDeep()
    })
    this.#childTouchedCancel.set(field, cancel)
    // Track child dirty for aggregation
    const cancelDirty = controller.dirty.on(v => {
      this.#childDirty.set(field, v)
      this.#recomputeDirtyDeep()
    })
    this.#childDirtyCancel.set(field, cancelDirty)
    return controller
  }

  /**
   * Marks this field and all child fields as touched recursively.
   * Useful for showing all validation errors when a form is submitted.
   */
  readonly markAllTouched = () => {
    this.markTouched()
    // Ensure all current fields are marked
    const current = this.signal.value
    for (const key of Object.keys(current as object) as (keyof T & string)[]) {
      this.field(key).markTouched()
    }
    for (const ctrl of this.#controllers.values()) {
      ctrl.markTouched()
    }
  }

  /**
   * Marks this field and all child fields as pristine (resets baseline) recursively.
   */
  readonly markAllPristine = () => {
    this.markPristine()
    const current = this.signal.value
    for (const key of Object.keys(current as object) as (keyof T & string)[]) {
      this.field(key)['markPristine']?.()
    }
    for (const ctrl of this.#controllers.values()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(ctrl as any).markPristine?.()
    }
  }

  readonly #recomputeDirtyDeep = () => {
    let anyChild = false
    for (const v of this.#childDirty.values()) {
      if (v) {
        anyChild = true
        break
      }
    }
    this.#dirtyDeep.set(this.dirty.value || anyChild)
  }
}

/**
 * Controller specialized for array values that provides item-level access and array manipulation methods.
 * Automatically tracks deep touched and dirty states by monitoring all child item controllers.
 *
 * @template T - The array type managed by this controller
 *
 * @example
 * ```typescript
 * import { prop } from '@tempots/dom'
 * import { ArrayController } from '@tempots/beatui'
 * import { Validation } from '@tempots/std'
 *
 * const valueSignal = prop(['task 1', 'task 2'])
 * const statusSignal = prop(Validation.valid)
 * const disabledSignal = prop(false)
 *
 * const controller = new ArrayController(
 *   [],
 *   (value) => { valueSignal.set(value) },
 *   valueSignal,
 *   statusSignal,
 *   { disabled: disabledSignal }
 * )
 *
 * // Access item controllers
 * const firstItemController = controller.item(0)
 *
 * // Array operations
 * controller.push('new task')
 * controller.removeAt(1)
 * controller.move(0, 2) // Move first item to third position
 * controller.length.value // Reactive array length
 * ```
 */
export class ArrayController<T extends unknown[]> extends Controller<T> {
  readonly #controllers = new Array<Controller<T[number]>>()
  /** Reactive signal containing the current array length. */
  readonly length: Signal<number>
  readonly #childTouched = new Map<number, boolean>()
  readonly #childTouchedCancel = new Map<number, () => void>()
  readonly #touchedDeep = prop(false)
  /** Reactive signal indicating whether this array or any item is touched. */
  readonly touchedDeep: Signal<boolean> = this.#touchedDeep
  readonly #childDirty = new Map<number, boolean>()
  readonly #childDirtyCancel = new Map<number, () => void>()
  readonly #dirtyDeep = prop(false)
  /** Reactive signal indicating whether this array or any item is dirty. */
  readonly dirtyDeep: Signal<boolean> = this.#dirtyDeep
  readonly #parentTouchedCancel: () => void
  readonly #parentDirtyCancel: () => void

  readonly #recomputeTouchedDeep = () => {
    let anyChild = false
    for (const v of this.#childTouched.values()) {
      if (v) {
        anyChild = true
        break
      }
    }
    this.#touchedDeep.set(this.touched.value || anyChild)
  }

  constructor(
    path: Path,
    change: (value: T) => void,
    signal: Signal<T>,
    status: Signal<ControllerValidation>,
    parent: {
      disabled: Signal<boolean>
    },
    equals: (a: T, b: T) => boolean
  ) {
    const arr = signal.map(v => (v == null ? [] : v) as T, equals)
    super(path, change, arr, status, parent, equals)
    const cancel = arr.on(v => {
      const diff = this.#controllers.length - v.length
      if (diff > 0) {
        this.#controllers.splice(v.length, diff).forEach((c, idx) => {
          const absoluteIndex = v.length + idx
          c.dispose()
          const cancel = this.#childTouchedCancel.get(absoluteIndex)
          cancel?.()
          this.#childTouchedCancel.delete(absoluteIndex)
          this.#childTouched.delete(absoluteIndex)
          const cancelDirty = this.#childDirtyCancel.get(absoluteIndex)
          cancelDirty?.()
          this.#childDirtyCancel.delete(absoluteIndex)
          this.#childDirty.delete(absoluteIndex)
        })
        this.#recomputeTouchedDeep()
        this.#recomputeDirtyDeep()
      }
    })
    this.length = arr.map(v => v.length)

    // Keep aggregates in sync when parent touched/dirty change
    this.#parentTouchedCancel = this.touched.on(() => {
      this.#recomputeTouchedDeep()
    })
    this.#parentDirtyCancel = this.dirty.on(() => {
      this.#recomputeDirtyDeep()
    })
    const cancelValue = this.signal.on(() => this.#recomputeDirtyDeep())

    // Register disposal of child controllers and resources
    this.onDispose(() => {
      for (const controller of this.#controllers) {
        controller.dispose()
      }
      this.length.dispose()
      this.#controllers.length = 0
      cancel()
      arr.dispose()
      for (const cancel of this.#childTouchedCancel.values()) cancel()
      this.#childTouchedCancel.clear()
      this.#childTouched.clear()
      this.#touchedDeep.dispose()
      for (const cancel of this.#childDirtyCancel.values()) cancel()
      this.#childDirtyCancel.clear()
      this.#childDirty.clear()
      this.#dirtyDeep.dispose()
      this.#parentTouchedCancel()
      this.#parentDirtyCancel()
      cancelValue()
    })
  }

  /**
   * Gets or creates a controller for a specific array item by index.
   * Controllers are cached and reused for the same index.
   *
   * @param index - The zero-based index of the item
   * @returns A Controller instance for the specified item
   *
   * @example
   * ```typescript
   * const firstTaskController = tasksController.item(0)
   * const secondTaskController = tasksController.item(1)
   * ```
   */
  readonly item = (index: number) => {
    if (this.#controllers[index]) {
      return this.#controllers[index] as Controller<T[number]>
    }
    const onChange = async (value: T[number]) => {
      const copy = this.signal.value.slice() as T
      copy[index] = value
      this.change(copy)
    }
    const controller = new Controller(
      [...this.path, index],
      onChange,
      this.signal.map((v: T) => v[index] as T[number]),
      this.status.map(makeMapValidation([index])),
      {
        disabled: this.disabled,
        validationMode: this.parent.validationMode,
      }
    )
    this.#controllers[index] = controller
    const cancel = controller.touched.on(v => {
      this.#childTouched.set(index, v)
      this.#recomputeTouchedDeep()
    })
    this.#childTouchedCancel.set(index, cancel)
    const cancelDirty = controller.dirty.on(v => {
      this.#childDirty.set(index, v)
      this.#recomputeDirtyDeep()
    })
    this.#childDirtyCancel.set(index, cancelDirty)
    return controller
  }

  /**
   * Appends one or more items to the end of the array.
   *
   * @param value - Items to append
   */
  readonly push = (...value: T[number][]) => {
    this.change([...this.signal.value, ...value] as T)
  }

  /**
   * Removes the last item from the array.
   */
  readonly pop = () => {
    this.splice(this.signal.value.length - 1, 1)
  }

  /**
   * Removes the first item from the array.
   */
  readonly shift = () => {
    this.splice(0, 1)
  }

  /**
   * Inserts one or more items at the beginning of the array.
   *
   * @param value - Items to prepend
   */
  readonly unshift = (...value: T) => {
    this.change([...value, ...this.signal.value] as T)
  }

  /**
   * Removes the item at the specified index.
   *
   * @param index - Zero-based index of the item to remove
   */
  readonly removeAt = (index: number) => {
    this.splice(index, 1)
  }

  /**
   * Removes items from the array starting at the specified index.
   *
   * @param start - Zero-based index to start removing items
   * @param deleteCount - Number of items to remove (optional)
   */
  readonly splice = (start: number, deleteCount?: number) => {
    const copy = this.signal.value.slice() as T
    copy.splice(start, deleteCount)
    this.change(copy)
  }

  /**
   * Moves one or more items from one index to another within the array.
   *
   * @param from - Source index to move from
   * @param to - Destination index to move to
   * @param length - Number of items to move (defaults to 1)
   *
   * @example
   * ```typescript
   * controller.move(0, 2) // Move first item to third position
   * controller.move(2, 0, 2) // Move items at index 2-3 to the beginning
   * ```
   */
  readonly move = (from: number, to: number, length: number = 1) => {
    if (length < 1) return
    if (from === to) return
    const copy = this.signal.value.slice() as T
    const items = copy.splice(from, length)
    copy.splice(to, 0, ...items)
    this.change(copy)
  }

  /**
   * Marks this array and all item controllers as touched recursively.
   * Useful for showing all validation errors when a form is submitted.
   */
  readonly markAllTouched = () => {
    this.markTouched()
    const len = this.signal.value.length
    for (let i = 0; i < len; i++) {
      this.item(i).markTouched()
    }
  }

  /**
   * Marks this array and all item controllers as pristine (resets baseline) recursively.
   */
  readonly markAllPristine = () => {
    this.markPristine()
    const len = this.signal.value.length
    for (let i = 0; i < len; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this.item(i) as any).markPristine?.()
    }
  }

  readonly #recomputeDirtyDeep = () => {
    let anyChild = false
    for (const v of this.#childDirty.values()) {
      if (v) {
        anyChild = true
        break
      }
    }
    this.#dirtyDeep.set(this.dirty.value || anyChild)
  }
}
