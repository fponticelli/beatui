import { computedOf, prop, Signal } from '@tempots/dom'
import { Path, PathSegment, pathToString } from './path'
import {
  ControllerError,
  makeMapValidation,
  ControllerValidation,
} from './controller-validation'
import { strictEqual } from '@tempots/std'

export class Controller<T> {
  readonly path: Path
  readonly change: (value: T) => void
  readonly value: Signal<T>
  readonly status: Signal<ControllerValidation>
  readonly error: Signal<undefined | string>
  readonly hasError: Signal<boolean>
  readonly dependencyErrors: Signal<
    undefined | Record<string | number, ControllerError>
  >
  readonly #local = {
    disabled: prop(false),
  }
  protected readonly parent: {
    disabled: Signal<boolean>
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
    }
  ) {
    this.path = path
    this.change = change
    this.value = value
    this.status = status
    this.error = status.map(s =>
      s?.type === 'invalid' ? s.error?.message : undefined
    )
    this.hasError = this.error.map(e => e != null)
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
      this.disabled.dispose()
      this.error.dispose()
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
      this.parent
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
      this.parent
    )
  }
}

export class ObjectController<
  T extends Record<keyof T, T[keyof T]>,
> extends Controller<T> {
  readonly #controllers = new Map<keyof T, Controller<unknown>>()

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
      parent
    )

    // Register disposal of child controllers
    this.onDispose(() => {
      for (const controller of this.#controllers.values()) {
        controller.dispose()
      }
      this.#controllers.clear()
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
      { disabled: this.disabled }
    )
    this.#controllers.set(field, controller as Controller<unknown>)
    return controller
  }
}

export class ArrayController<T extends unknown[]> extends Controller<T> {
  readonly #controllers = new Array<Controller<T[number]>>()
  readonly length: Signal<number>

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
    super(path, change, arr, status, parent)
    const cancel = arr.on(v => {
      const diff = this.#controllers.length - v.length
      if (diff > 0) {
        this.#controllers.splice(v.length, diff).forEach(c => c.dispose())
      }
    })
    this.length = arr.map(v => v.length)

    // Register disposal of child controllers and resources
    this.onDispose(() => {
      for (const controller of this.#controllers) {
        controller.dispose()
      }
      this.length.dispose()
      this.#controllers.length = 0
      cancel()
      arr.dispose()
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
      { disabled: this.disabled }
    )
    this.#controllers[index] = controller
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
}
