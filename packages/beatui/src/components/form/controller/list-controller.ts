import { Signal } from '@tempots/dom'
import { Path } from './path'
import { makeMapValidationResult, ValidationResult } from './validation-result'
import { CreateController, ValueController } from './value-controller'
import { GroupController } from './group-controller'

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
      value.map(v => (v == null ? [] : v) as In),
      status,
      parent
    )
  }

  readonly length = this.value.map(v => v.length)

  readonly item = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    index: In[number] extends Record<string, any> | any[] ? never : number
  ) => {
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

  readonly list = (index: In[number] extends In[number] ? number : never) => {
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
      ) => new ListController(path, onChange, value, status, parent)
    )
  }

  readonly group = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    index: In[number] extends Record<string, any> ? number : never
  ) => {
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
      ) => new GroupController(path, onChange, value, status, parent)
    )
  }

  override dispose() {
    super.dispose()
    for (const controller of this.#controllers) {
      controller.dispose()
    }
    this.#controllers.length = 0
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
    const controllers = this.#controllers.splice(start, deleteCount)
    for (const controller of controllers) {
      controller.dispose()
    }
    const copy = this.value.value.slice() as In
    copy.splice(start, deleteCount)
    this.change(copy)
  }
}
