import {
  attr,
  computedOf,
  emitValue,
  emitValueAsNumber,
  Fragment,
  on,
  prop,
  Signal,
} from '@tempots/dom'
import { StandardSchemaV1 } from './standard-schema-v1'

export interface UseFormOptions<In, Out = In> {
  schema: StandardSchemaV1<In, Out>
  defaultValue?: In
}

export type Valid = {
  type: 'Valid'
}

export type InvalidDependencies = {
  error?: string
  dependencies?: Record<string | number, InvalidDependencies>
}

export type Invalid = {
  type: 'Invalid'
} & InvalidDependencies

export type Status = Valid | Invalid

export type PathSegment = string | number
export type Path = PathSegment[]

function convertStandardSchemaPathToPath(
  path: ReadonlyArray<PropertyKey | StandardSchemaV1.PathSegment>
) {
  function normalize(v: PropertyKey) {
    return typeof v === 'number' ? v : v.toString()
  }
  return path.map(p =>
    typeof p === 'object' && p.key != null
      ? normalize(p.key)
      : normalize(p as PropertyKey)
  )
}

export function parsePath(path: string): Path {
  const segments = path.split('.')
  return segments.map(segment => {
    const match = segment.match(/^\[(\d+)\]$/)
    if (match) {
      return Number(match[1])
    }
    return segment
  })
}

function convertStandardSchemaIssues(
  issues: readonly StandardSchemaV1.Issue[]
): InvalidDependencies {
  const topIssues = issues
    .filter(i => i.path == null || i.path.length === 0)
    .map(i => i.message)
  const dependencies = issues
    .filter(i => i.path != null && i.path.length > 0)
    .reduce((acc, i) => {
      const path = convertStandardSchemaPathToPath(i.path!)
      const last = path.pop()!
      let current = acc
      for (const segment of path) {
        if (current.dependencies == null) {
          current.dependencies = {}
        }
        current = current.dependencies[segment]!
      }
      if (current.dependencies == null) {
        current.dependencies = {}
      }
      current.dependencies[last] = { error: i.message }
      return acc
    }, {} as InvalidDependencies)
  const error = topIssues.join('\n')
  return {
    ...dependencies,
    error: error != '' ? error : undefined,
  }
}

export class ValueController<In> {
  readonly path: Path
  readonly change: (value: In) => void
  readonly value: Signal<In>
  readonly status: Signal<Status>
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
    status: Signal<Status>,
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

export class ListController<In> extends ValueController<In> {}

function makeMapStatus(field: string | number) {
  return function mapStatus(status: Status): Status {
    if (status.type === 'Valid') return status
    const dependencies = status.dependencies?.[field]
    if (dependencies != null) {
      return { type: 'Invalid', ...dependencies }
    } else {
      return { type: 'Valid' }
    }
  }
}

export class GroupController<In> extends ValueController<In> {
  readonly field = <K extends keyof In & string>(field: K) => {
    const onChange = async (value: In[K]) => {
      this.change({
        ...this.value.value,
        [field]: value,
      })
    }
    return new ValueController<In[K]>(
      [...this.path, field],
      onChange,
      this.value.map((v: In) => v[field] as In[K]),
      this.status.map(makeMapStatus(field)),
      { disabled: this.disabled }
    )
  }
}

export class FormController<In> extends GroupController<In> {
  override dispose() {
    super.dispose()
    this.parent.disabled.dispose()
    this.value.dispose()
    this.status.dispose()
  }
}

function wrapSegment(v: number | string) {
  return typeof v === 'number' ? `[${v}]` : `.${v}`
}

function pathToString(path: Path) {
  if (path.length === 0) return ''
  const [first, ...rest] = path
  const segments = [
    typeof first === 'number' ? `[${first}]` : first,
    ...rest.map(wrapSegment),
  ]
  return segments.join('')
}

export function connectCommonAttributes<T>(value: ValueController<T>) {
  return Fragment(attr.disabled(value.disabled), attr.name(value.name))
}

export function connectStringInput(
  value: ValueController<string>,
  {
    triggerOn = 'change',
  }: {
    triggerOn?: 'change' | 'input'
  } = {}
) {
  return Fragment(
    connectCommonAttributes(value),
    attr.value(value.value),
    (triggerOn === 'input' ? on.input : on.change)(emitValue(value.change))
  )
}

export function connectNumberInput(
  value: ValueController<number>,
  {
    triggerOn = 'change',
  }: {
    triggerOn?: 'change' | 'input'
  } = {}
) {
  return Fragment(
    connectCommonAttributes(value),
    attr.valueAsNumber(value.value),
    (triggerOn === 'input' ? on.input : on.change)(
      emitValueAsNumber(value.change)
    )
  )
}

export function useForm<In, Out = In>({
  defaultValue = {} as In,
  schema,
}: UseFormOptions<In, Out>) {
  // TODO
  // - [ ] submitting
  // - [ ] validation strategy
  //   - [ ] validate on submit
  //   - [ ] continuous validation
  //   - [ ] validate touched and on submit
  // - [ ] dirty
  // - [ ] touched
  // - [ ] array
  // - [ ] unions
  // - [ ] file support
  // - [ ] date support
  // - [ ] boolean support
  // - [x] disabled

  const value = prop(defaultValue)
  const status = prop<Status>({ type: 'Valid' })
  const disabled = prop(false)
  const change = async (v: In) => {
    value.set(v)
    const result = await schema['~standard'].validate(v)
    if (result.issues != null) {
      status.set({
        type: 'Invalid',
        ...convertStandardSchemaIssues(result.issues),
      })
    } else {
      status.set({ type: 'Valid' })
    }
  }
  const controller = new FormController<In>([], change, value, status, {
    disabled,
  })
  return controller
}
