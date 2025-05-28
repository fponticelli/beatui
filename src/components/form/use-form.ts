import {
  attr,
  emitValue,
  emitValueAsNumber,
  Fragment,
  on,
  prop,
  Renderable,
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

export abstract class ValueProxy<In> {
  readonly path: Path
  readonly change: (value: In) => void
  readonly value: Signal<In>
  readonly status: Signal<Status>
  readonly error: Signal<undefined | string>
  readonly dependencyErrors: Signal<
    undefined | Record<string | number, InvalidDependencies>
  >
  constructor(
    path: Path,
    change: (value: In) => void,
    value: Signal<In>,
    status: Signal<Status>
  ) {
    this.path = path
    this.change = change
    this.value = value
    this.status = status
    this.error = status.map(s => (s.type === 'Invalid' ? s.error : undefined))
    this.dependencyErrors = status.map(s =>
      s.type === 'Invalid' ? s.dependencies : undefined
    )
  }
}

export class ArrayProxy<In> extends ValueProxy<In> {}

export class ObjectProxy<
  In extends { [K in string]: In[K] },
> extends ValueProxy<In> {
  readonly string = <K extends keyof In & string>(
    field: In[K] extends string ? K : never,
    {
      triggerOn = 'change',
    }: {
      triggerOn?: 'change' | 'input'
    } = {}
  ) => {
    const onChange = async (value: string) => {
      this.change({
        ...this.value.value,
        [field]: value,
      })
    }
    return new StringProxy(
      [...this.path, field],
      onChange,
      this.value.map((v: In) => v[field] as string),
      this.status, // TODO, wrong!
      triggerOn
    )
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

export class NumberProxy extends ValueProxy<number> {
  readonly triggerOn: 'change' | 'input'

  constructor(
    path: Path,
    change: (value: number) => void,
    value: Signal<number>,
    status: Signal<Status>,
    triggerOn: 'change' | 'input'
  ) {
    super(path, change, value, status)
    this.triggerOn = triggerOn
  }

  readonly connect = (): Renderable => {
    return Fragment(
      attr.name(pathToString(this.path)),
      attr.valueAsNumber(this.value),
      (this.triggerOn === 'input' ? on.input : on.change)(
        emitValueAsNumber(this.change)
      )
    )
  }
}

export class StringProxy extends ValueProxy<string> {
  readonly triggerOn: 'change' | 'input'

  constructor(
    path: Path,
    change: (value: string) => void,
    value: Signal<string>,
    status: Signal<Status>,
    triggerOn: 'change' | 'input'
  ) {
    super(path, change, value, status)
    this.triggerOn = triggerOn
  }

  readonly connect = (): Renderable => {
    return Fragment(
      attr.name(pathToString(this.path)),
      attr.value(this.value),
      (this.triggerOn === 'input' ? on.input : on.change)(
        emitValue(this.change)
      )
    )
  }
}

export function useForm<In extends { [K in string]: In[K] }, Out = In>(
  options: UseFormOptions<In, Out>
) {
  const value = prop((options.defaultValue ?? {}) as In)
  const status = prop<Status>({ type: 'Valid' })
  const change = (v: In) => {
    value.set(v)
    console.log(v)
  }
  const proxy = new ObjectProxy<In>([], change, value, status)
  return proxy
}
