import { computedOf, prop, Signal } from '@tempots/dom'
import { Path, PathSegment, pathToString } from './path'
import {
  ControllerError,
  makeMapValidation,
  ControllerValidation,
} from './controller-validation'
import { strictEqual } from '@tempots/std'
import { ValidationMode } from './union-controller'

export class Controller<T> {
  readonly path: Path
  readonly change: (value: T) => void
  readonly value: Signal<T>
  readonly status: Signal<ControllerValidation>
  readonly error: Signal<undefined | string>
  readonly hasError: Signal<boolean>
  readonly touched: Signal<boolean>
  readonly errorVisible: Signal<boolean>
  readonly dirty: Signal<boolean>
  readonly dependencyErrors: Signal<
    undefined | Record<string | number, ControllerError>
  >
  readonly #local = {
    disabled: prop(false),
    touched: prop(false),
  }
  readonly #equals: (a: T, b: T) => boolean
  #baseline = prop<T>(undefined as unknown as T)
  protected readonly parent: {
    disabled: Signal<boolean>
    // Optional validation mode signal supplied by useController/useForm
    validationMode?: Signal<ValidationMode>
  }
  readonly disabled: Signal<boolean>
  readonly #disposeCallbacks: (() => void)[] = []

  readonly disabledOrHasErrors: Signal<boolean>

  constructor(
    path: Path,
    change: (value: T) => void,
    value: Signal<T>,
    status: Signal<ControllerValidation>,
    parent: {
      disabled: Signal<boolean>
      validationMode?: Signal<ValidationMode>
    },
    equals: (a: T, b: T) => boolean = strictEqual
  ) {
    this.path = path
    this.change = change
    this.value = value
    this.status = status
    this.#equals = equals
    this.#baseline.set(value.value)
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
        if (mode === 'continuous') return !!hasError
        // onSubmit and touchedOrSubmit gate on touched
        return !!hasError && !!touched
      })
    } else {
      this.errorVisible = computedOf(
        this.hasError,
        this.touched
      )((hasError, touched) => !!hasError && !!touched)
    }
    this.dirty = computedOf(
      this.value,
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

  get name() {
    return pathToString(this.path)
  }

  readonly onDispose = (callback: () => void) => {
    this.#disposeCallbacks.push(callback)
  }

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

  readonly setDisabled = (disabled: boolean) => {
    this.#local.disabled.set(disabled)
  }

  readonly disable = () => this.setDisabled(true)

  readonly enable = () => this.setDisabled(false)

  readonly markTouched = () => {
    this.#local.touched.set(true)
  }

  readonly resetTouched = () => {
    this.#local.touched.set(false)
  }

  readonly markPristine = () => {
    this.#baseline.set(this.value.value)
  }

  readonly reset = () => {
    this.change(this.#baseline.value)
  }

  readonly array = (equals: (a: T, b: T) => boolean = strictEqual) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ArrayController<T extends any[] ? T : never>(
      this.path,
      this.change,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.value as unknown as Signal<T extends any[] ? T : never>,
      this.status,
      this.parent,
      equals
    )
  }

  readonly object = (equals: (a: T, b: T) => boolean = strictEqual) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ObjectController<T extends Record<string, any> ? T : never>(
      this.path,
      this.change,
      this.value as unknown as Signal<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        T extends Record<string, any> ? T : never
      >,
      this.status,
      this.parent,
      equals
    )
  }

  readonly transform = <Out>(
    transform: (value: T) => Out,
    untransform: (value: Out) => T,
    subpath: PathSegment[] = [],
    equals: (a: Out, b: Out) => boolean = strictEqual
  ) => {
    return new Controller(
      [...this.path, ...subpath],
      (value: Out) => this.change(untransform(value)),
      this.value.map(transform, equals),
      this.status.map(makeMapValidation(subpath)),
      this.parent,
      equals
    )
  }

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
      this.value.mapAsync(transform, alt, undefined, equals),
      this.status.map(makeMapValidation(subpath)),
      this.parent,
      equals
    )
  }
}

export class ObjectController<
  T extends Record<keyof T, T[keyof T]>,
> extends Controller<T> {
  readonly #controllers = new Map<keyof T, Controller<unknown>>()
  readonly #childTouched = new Map<keyof T, boolean>()
  readonly #childTouchedCancel = new Map<keyof T, () => void>()
  readonly #touchedDeep = prop(false)
  readonly touchedDeep: Signal<boolean> = this.#touchedDeep
  readonly #childDirty = new Map<keyof T, boolean>()
  readonly #childDirtyCancel = new Map<keyof T, () => void>()
  readonly #dirtyDeep = prop(false)
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
    value: Signal<T>,
    status: Signal<ControllerValidation>,
    parent: {
      disabled: Signal<boolean>
    },
    equals: (a: T, b: T) => boolean
  ) {
    super(
      path,
      change,
      value.map(v => (v == null ? {} : v) as T, equals),
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
    const cancelValue = this.value.on(() => this.#recomputeDirtyDeep())

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

  readonly field = <K extends keyof T & string>(field: K) => {
    if (this.#controllers.has(field)) {
      return this.#controllers.get(field)! as Controller<T[K]>
    }
    const onChange = async (value: T[K]) => {
      this.change({
        ...this.value.value,
        [field]: value,
      })
    }
    const controller = new Controller(
      [...this.path, field],
      onChange,
      this.value.map((v: T) => v[field] as T[K]),
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

  readonly markAllTouched = () => {
    this.markTouched()
    // Ensure all current fields are marked
    const current = this.value.value
    for (const key of Object.keys(current as object) as (keyof T & string)[]) {
      this.field(key).markTouched()
    }
    for (const ctrl of this.#controllers.values()) {
      ctrl.markTouched()
    }
  }

  readonly markAllPristine = () => {
    this.markPristine()
    const current = this.value.value
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

export class ArrayController<T extends unknown[]> extends Controller<T> {
  readonly #controllers = new Array<Controller<T[number]>>()
  readonly length: Signal<number>
  readonly #childTouched = new Map<number, boolean>()
  readonly #childTouchedCancel = new Map<number, () => void>()
  readonly #touchedDeep = prop(false)
  readonly touchedDeep: Signal<boolean> = this.#touchedDeep
  readonly #childDirty = new Map<number, boolean>()
  readonly #childDirtyCancel = new Map<number, () => void>()
  readonly #dirtyDeep = prop(false)
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
    value: Signal<T>,
    status: Signal<ControllerValidation>,
    parent: {
      disabled: Signal<boolean>
    },
    equals: (a: T, b: T) => boolean
  ) {
    const arr = value.map(v => (v == null ? [] : v) as T, equals)
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
    const cancelValue = this.value.on(() => this.#recomputeDirtyDeep())

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

  readonly item = (index: number) => {
    if (this.#controllers[index]) {
      return this.#controllers[index] as Controller<T[number]>
    }
    const onChange = async (value: T[number]) => {
      const copy = this.value.value.slice() as T
      copy[index] = value
      this.change(copy)
    }
    const controller = new Controller(
      [...this.path, index],
      onChange,
      this.value.map((v: T) => v[index] as T[number]),
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

  readonly push = (...value: T[number][]) => {
    this.change([...this.value.value, ...value] as T)
  }

  readonly pop = () => {
    this.splice(this.value.value.length - 1, 1)
  }

  readonly shift = () => {
    this.splice(0, 1)
  }

  readonly unshift = (...value: T) => {
    this.change([...value, ...this.value.value] as T)
  }

  readonly removeAt = (index: number) => {
    this.splice(index, 1)
  }

  readonly splice = (start: number, deleteCount?: number) => {
    const copy = this.value.value.slice() as T
    copy.splice(start, deleteCount)
    this.change(copy)
  }

  readonly move = (from: number, to: number, length: number = 1) => {
    if (length < 1) return
    if (from === to) return
    const copy = this.value.value.slice() as T
    const items = copy.splice(from, length)
    copy.splice(to, 0, ...items)
    this.change(copy)
  }

  readonly markAllTouched = () => {
    this.markTouched()
    const len = this.value.value.length
    for (let i = 0; i < len; i++) {
      this.item(i).markTouched()
    }
  }

  readonly markAllPristine = () => {
    this.markPristine()
    const len = this.value.value.length
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
