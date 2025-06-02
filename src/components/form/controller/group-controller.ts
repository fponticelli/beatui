import { makeMapValidationResult, ValidationResult } from './validation-result'
import { CreateController, ValueController } from './value-controller'
import { ListController } from './list-controller'
import { Signal } from '@tempots/dom'
import { Path } from './path'

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

  readonly field = <K extends keyof In & string>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: In[K] extends any[] | Record<string, any> ? never : K
  ) => {
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

  readonly list = <K extends keyof In & string>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: In[K] extends any[] ? K : never
  ) => {
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
      ) => new ListController(path, onChange, value, status, parent)
    )
  }

  readonly group = <K extends keyof In & string>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: In[K] extends Record<string, any> ? K : never
  ) => {
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
      ) => new GroupController(path, onChange, value, status, parent)
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
