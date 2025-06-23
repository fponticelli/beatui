import { computedOf, prop, Signal } from '@tempots/dom'
import { Path, PathSegment, pathToString } from './path'
import {
  InvalidDependencies,
  makeMapValidationResult,
  ValidationResult,
} from './validation-result'
import { strictEqual } from '@tempots/std'

export class Controller<In> {
  readonly path: Path
  readonly change: (value: In) => void
  readonly value: Signal<In>
  readonly status: Signal<ValidationResult>
  readonly error: Signal<undefined | string>
  readonly hasError: Signal<boolean>
  readonly dependencyErrors: Signal<
    undefined | Record<string | number, InvalidDependencies>
  >
  readonly #local = {
    disabled: prop(false),
  }
  protected readonly parent: {
    disabled: Signal<boolean>
  }
  readonly disabled: Signal<boolean>
  readonly #disposeCallbacks: (() => void)[] = []

  constructor(
    path: Path,
    change: (value: In) => void,
    value: Signal<In>,
    status: Signal<ValidationResult>,
    parent: {
      disabled: Signal<boolean>
    }
  ) {
    this.path = path
    this.change = change
    this.value = value
    this.status = status
    this.error = status.map(s => (s.type === 'Invalid' ? s.error : undefined))
    this.hasError = this.error.map(e => e != null)
    this.dependencyErrors = status.map(s =>
      s.type === 'Invalid' ? s.dependencies : undefined
    )
    this.parent = parent
    this.disabled = computedOf(
      this.#local.disabled,
      parent.disabled
    )((local, parent) => local || parent)
  }

  get name() {
    return pathToString(this.path)
  }

  onDispose(callback: () => void) {
    this.#disposeCallbacks.push(callback)
  }

  dispose() {
    // Call user-registered dispose callbacks first
    for (const callback of this.#disposeCallbacks) {
      try {
        callback()
      } catch (error) {
        console.error('Error in dispose callback:', error)
      }
    }
    this.#disposeCallbacks.length = 0

    // Dispose internal resources
    this.#local.disabled.dispose()
    this.disabled.dispose()
    this.status.dispose()
    this.error.dispose()
    this.hasError.dispose()
    this.dependencyErrors.dispose()
  }

  readonly disable = () => {
    this.#local.disabled.set(true)
  }

  readonly enable = () => {
    this.#local.disabled.set(false)
  }

  readonly array = (equals: (a: In, b: In) => boolean = strictEqual) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ArrayController<In extends any[] ? In : never>(
      this.path,
      this.change,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.value as unknown as Signal<In extends any[] ? In : never>,
      this.status,
      this.parent,
      equals
    )
  }

  readonly object = (equals: (a: In, b: In) => boolean = strictEqual) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ObjectController<In extends Record<string, any> ? In : never>(
      this.path,
      this.change,
      this.value as unknown as Signal<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        In extends Record<string, any> ? In : never
      >,
      this.status,
      this.parent,
      equals
    )
  }

  readonly transform = <Out>(
    transform: (value: In) => Out,
    untransform: (value: Out) => In,
    subpath: PathSegment[] = [],
    equals: (a: Out, b: Out) => boolean = strictEqual
  ) => {
    return new Controller(
      [...this.path, ...subpath],
      (value: Out) => this.change(untransform(value)),
      this.value.map(transform, equals),
      this.status.map(makeMapValidationResult(subpath)),
      this.parent
    )
  }
}

export class ObjectController<
  In extends Record<string, In[keyof In]>,
> extends Controller<In> {
  readonly #controllers = new Map<keyof In, Controller<unknown>>()

  constructor(
    path: Path,
    change: (value: In) => void,
    value: Signal<In>,
    status: Signal<ValidationResult>,
    parent: {
      disabled: Signal<boolean>
    },
    equals: (a: In, b: In) => boolean
  ) {
    super(
      path,
      change,
      value.map(v => (v == null ? {} : v) as In, equals),
      status,
      parent
    )
  }

  readonly field = <K extends keyof In & string>(field: K) => {
    if (this.#controllers.has(field)) {
      return this.#controllers.get(field)! as Controller<In[K]>
    }
    const onChange = async (value: In[K]) => {
      this.change({
        ...this.value.value,
        [field]: value,
      })
    }
    const controller = new Controller(
      [...this.path, field],
      onChange,
      this.value.map((v: In) => v[field] as In[K]),
      this.status.map(makeMapValidationResult([field])),
      { disabled: this.disabled }
    )
    this.#controllers.set(field, controller as Controller<unknown>)
    return controller
  }

  override dispose() {
    super.dispose()
    for (const controller of this.#controllers.values()) {
      controller.dispose()
    }
    this.#controllers.clear()
  }
}

export class ArrayController<In extends unknown[]> extends Controller<In> {
  readonly #controllers = new Array<Controller<In[number]>>()
  readonly #unsubscribe: () => void
  readonly length: Signal<number>

  constructor(
    path: Path,
    change: (value: In) => void,
    value: Signal<In>,
    status: Signal<ValidationResult>,
    parent: {
      disabled: Signal<boolean>
    },
    equals: (a: In, b: In) => boolean
  ) {
    const arr = value.map(v => (v == null ? [] : v) as In, equals)
    super(path, change, arr, status, parent)
    this.#unsubscribe = arr.on(v => {
      const diff = this.#controllers.length - v.length
      if (diff > 0) {
        this.#controllers.splice(v.length, diff).forEach(c => c.dispose())
      }
    })
    this.length = arr.map(v => v.length)
  }

  readonly item = (index: number) => {
    if (this.#controllers[index]) {
      return this.#controllers[index] as Controller<In[number]>
    }
    const onChange = async (value: In[number]) => {
      const copy = this.value.value.slice() as In
      copy[index] = value
      this.change(copy)
    }
    const controller = new Controller(
      [...this.path, index],
      onChange,
      this.value.map((v: In) => v[index] as In[number]),
      this.status.map(makeMapValidationResult([index])),
      { disabled: this.disabled }
    )
    this.#controllers[index] = controller
    return controller
  }

  override dispose() {
    super.dispose()
    for (const controller of this.#controllers) {
      controller.dispose()
    }
    this.length.dispose()
    this.#controllers.length = 0
    this.#unsubscribe()
    this.value.dispose()
  }

  readonly push = (...value: In[number][]) => {
    this.change([...this.value.value, ...value] as In)
  }

  readonly pop = () => {
    this.splice(this.value.value.length - 1, 1)
  }

  readonly shift = () => {
    this.splice(0, 1)
  }

  readonly unshift = (...value: In) => {
    this.change([...value, ...this.value.value] as In)
  }

  readonly removeAt = (index: number) => {
    this.splice(index, 1)
  }

  readonly splice = (start: number, deleteCount?: number) => {
    const copy = this.value.value.slice() as In
    copy.splice(start, deleteCount)
    this.change(copy)
  }

  readonly move = (from: number, to: number, length: number = 1) => {
    if (length < 1) return
    if (from === to) return
    const copy = this.value.value.slice() as In
    const items = copy.splice(from, length)
    copy.splice(to, 0, ...items)
    this.change(copy)
  }
}
