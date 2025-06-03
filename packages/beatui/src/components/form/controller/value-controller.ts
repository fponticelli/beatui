import { computedOf, prop, Signal } from '@tempots/dom'
import { Path, pathToString } from './path'
import { InvalidDependencies, ValidationResult } from './validation-result'

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
