import { computedOf, prop, Signal } from '@tempots/dom'
import { Path, pathToString } from './path'
import {
  InvalidDependencies,
  makeMapValidationResult,
  ValidationResult,
} from './validation-result'

export class ValueController<In> {
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
    this.hasError = status.map(s => s.type === 'Invalid')
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

  dispose() {
    this.#local.disabled.dispose()
  }

  readonly disable = () => {
    this.#local.disabled.set(true)
  }

  readonly enable = () => {
    this.#local.disabled.set(false)
  }

  readonly list = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ListController<In extends any[] ? In : never>(
      this.path,
      this.change,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.value as unknown as Signal<In extends any[] ? In : never>,
      this.status,
      this.parent
    )
  }

  readonly group = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new GroupController<In extends Record<string, any> ? In : never>(
      this.path,
      this.change,

      this.value as unknown as Signal<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        In extends Record<string, any> ? In : never
      >,
      this.status,
      this.parent
    )
  }

  readonly transform = <Out>(
    transform: (value: In) => Out,
    untransform: (value: Out) => In
  ) => {
    return new ValueController(
      this.path,
      (value: Out) => this.change(untransform(value)),
      this.value.map(transform),
      this.status,
      this.parent
    )
  }
}

export type CreateController<In, VC extends ValueController<In>> = (
  path: Path,
  onChange: (value: In) => void,
  value: Signal<In>,
  status: Signal<ValidationResult>,
  parent: {
    disabled: Signal<boolean>
  }
) => VC

export class GroupController<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  In extends Record<string, any>,
> extends ValueController<In> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly #controllers = new Map<keyof In, ValueController<any>>()

  readonly #makeField = <
    K extends keyof In & string,
    VC extends ValueController<In[K]>,
  >(
    field: K,
    createController: CreateController<In[K], VC>
  ): VC => {
    if (this.#controllers.has(field)) {
      return this.#controllers.get(field)! as VC
    }
    const onChange = async (value: In[K]) => {
      this.change({
        ...this.value.value,
        [field]: value,
      })
    }
    const controller = createController(
      [...this.path, field],
      onChange,
      this.value.map((v: In) => v[field] as In[K]),
      this.status.map(makeMapValidationResult(field)),
      { disabled: this.disabled }
    )
    this.#controllers.set(
      field,
      controller as unknown as ValueController<In[keyof In]>
    )
    return controller
  }

  constructor(
    path: Path,
    change: (value: In) => void,
    value: Signal<In>,
    status: Signal<ValidationResult>,
    parent: {
      disabled: Signal<boolean>
    }
  ) {
    super(
      path,
      change,
      value.map(v => (v == null ? {} : v) as In),
      status,
      parent
    )
  }

  readonly field = <K extends keyof In & string>(field: K) => {
    return this.#makeField(
      field,
      (
        path: Path,
        onChange: (value: In[K]) => void,
        value: Signal<In[K]>,
        status: Signal<ValidationResult>,
        parent: {
          disabled: Signal<boolean>
        }
      ) => new ValueController(path, onChange, value, status, parent)
    )
  }

  override dispose() {
    super.dispose()
    for (const controller of this.#controllers.values()) {
      controller.dispose()
    }
    this.#controllers.clear()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ListController<In extends any[]> extends ValueController<In> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly #controllers = new Array<ValueController<any>>()

  readonly #makeItem = <VC extends ValueController<In[number]>>(
    index: number,
    createController: CreateController<In[number], VC>
  ) => {
    if (this.#controllers[index]) {
      return this.#controllers[index] as VC
    }
    const onChange = async (value: In[number]) => {
      const copy = this.value.value.slice() as In
      copy[index] = value
      this.change(copy)
    }
    const controller = createController(
      [...this.path, index],
      onChange,
      this.value.map((v: In) => v[index] as In[number]),
      this.status.map(makeMapValidationResult(index)),
      { disabled: this.disabled }
    )
    this.#controllers[index] = controller
    return controller
  }

  readonly #unsubscribe: () => void

  constructor(
    path: Path,
    change: (value: In) => void,
    value: Signal<In>,
    status: Signal<ValidationResult>,
    parent: {
      disabled: Signal<boolean>
    }
  ) {
    const arr = value.map(v => (v == null ? [] : v) as In)
    super(path, change, arr, status, parent)
    this.#unsubscribe = arr.on(v => {
      const diff = this.#controllers.length - v.length
      if (diff > 0) {
        this.#controllers.splice(v.length, diff).forEach(c => c.dispose())
      }
    })
  }

  readonly length = this.value.map(v => v.length)

  readonly item = (index: number) => {
    return this.#makeItem(
      index,
      (
        path: Path,
        onChange: (value: In[number]) => void,
        value: Signal<In[number]>,
        status: Signal<ValidationResult>,
        parent: {
          disabled: Signal<boolean>
        }
      ) => new ValueController(path, onChange, value, status, parent)
    )
  }

  override dispose() {
    super.dispose()
    for (const controller of this.#controllers) {
      controller.dispose()
    }
    this.length.dispose()
    this.#controllers.length = 0
    this.#unsubscribe()
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

  readonly unshift = (...value: In[number]) => {
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
}
