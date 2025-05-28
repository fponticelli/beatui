import {
  attr,
  computedOf,
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
        // if (current.dependencies[segment] == null) {
        //   current.dependencies[segment] = { type: 'Valid' }
        // }
        current = current.dependencies[segment]!
      }
      if (current.dependencies == null) {
        current.dependencies = {}
      }
      current.dependencies[last] = {
        // type: 'Invalid',
        error: i.message,
      }
      return acc
    }, {} as InvalidDependencies)
  const error = topIssues.join('\n')
  return {
    ...dependencies,
    error: error != '' ? error : undefined,
  }
}

export abstract class ValueProxy<In> {
  readonly path: Path
  readonly change: (value: In) => void
  readonly value: Signal<In>
  readonly status: Signal<Status>
  readonly error: Signal<undefined | string>
  readonly dependencyErrors: Signal<
    undefined | Record<string | number, InvalidDependencies>
  >
  readonly local = {
    disabled: prop(false),
  }
  readonly parent: {
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
    this.dependencyErrors = status.map(s =>
      s.type === 'Invalid' ? s.dependencies : undefined
    )
    this.parent = parent
    this.disabled = computedOf(
      this.local.disabled,
      parent.disabled
    )((local, parent) => local || parent)
  }

  get name() {
    return pathToString(this.path)
  }

  readonly dispose = () => {
    // this.value.dispose()
    // this.status.dispose()
    // this.error.dispose()
    // this.dependencyErrors.dispose()
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
      this.status.map((s: Status): Status => {
        if (s.type === 'Valid') return s
        const dependencies = s.dependencies?.[field]
        if (dependencies != null) {
          return { type: 'Invalid', ...dependencies }
        } else {
          return { type: 'Valid' }
        }
      }),
      { disabled: this.disabled },
      triggerOn
    )
  }
}

export class RootProxy<
  In extends { [K in string]: In[K] },
> extends ObjectProxy<In> {}

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

export abstract class PrimitiveProxy<In> extends ValueProxy<In> {
  readonly triggerOn: 'change' | 'input'

  constructor(
    path: Path,
    change: (value: In) => void,
    value: Signal<In>,
    status: Signal<Status>,
    parent: {
      disabled: Signal<boolean>
    },
    triggerOn: 'change' | 'input'
  ) {
    super(path, change, value, status, parent)
    this.triggerOn = triggerOn
  }
  abstract connectValue(): Renderable

  readonly connect = (): Renderable => {
    return Fragment(
      attr.disabled(this.disabled),
      attr.name(this.name),
      this.connectValue()
    )
  }

  readonly disable = () => {
    this.local.disabled.set(true)
  }

  readonly enable = () => {
    this.local.disabled.set(false)
  }
}

export class NumberProxy extends PrimitiveProxy<number> {
  readonly connectValue = (): Renderable => {
    return Fragment(
      attr.valueAsNumber(this.value),
      (this.triggerOn === 'input' ? on.input : on.change)(
        emitValueAsNumber(this.change)
      )
    )
  }
}

export class StringProxy extends PrimitiveProxy<string> {
  readonly connectValue = (): Renderable => {
    return Fragment(
      attr.value(this.value),
      (this.triggerOn === 'input' ? on.input : on.change)(
        emitValue(this.change)
      )
    )
  }
}

export function useForm<In extends { [K in string]: In[K] }, Out = In>({
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
  status.on(v => console.log(v))
  const change = async (v: In) => {
    value.set(v)
    const result = await schema['~standard'].validate(v)
    if (result.issues != null) {
      status.set({
        type: 'Invalid',
        ...convertStandardSchemaIssues(result.issues),
      })
      console.warn(result.issues)
    } else {
      status.set({ type: 'Valid' })
    }
    console.log(v)
  }
  const proxy = new RootProxy<In>([], change, value, status, { disabled })
  return proxy
}
