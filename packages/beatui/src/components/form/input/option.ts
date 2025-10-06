import { TNode } from '@tempots/dom'

export type ValueOption<T> = {
  type: 'value'
  value: T
  label: string
  disabled?: boolean
  before?: TNode
  after?: TNode
}

export type GroupOption<T> = {
  type: 'group'
  group: string
  options: ValueOption<T>[]
  disabled?: boolean
  before?: TNode
  after?: TNode
}

export type BreakOption = { type: 'break' }

export type SelectOption<T> = ValueOption<T> | GroupOption<T> | BreakOption

export type DropdownOption<T> = ValueOption<T> | GroupOption<T> | BreakOption

export type AnyOption<T> = SelectOption<T> | DropdownOption<T>

export const Option = {
  value: <T>(
    value: T,
    label: string,
    {
      disabled,
      before,
      after,
    }: { disabled?: boolean; before?: TNode; after?: TNode } = {}
  ): SelectOption<T> =>
    ({
      type: 'value',
      value,
      label,
      disabled,
      before,
      after,
    }) as ValueOption<T>,
  group: <T>(
    group: string,
    options: (ValueOption<T> | BreakOption)[],
    {
      disabled,
      before,
      after,
    }: {
      disabled?: boolean
      before?: TNode
      after?: TNode
    } = {}
  ): SelectOption<T> =>
    ({
      type: 'group',
      group,
      options,
      disabled,
      before,
      after,
    }) as GroupOption<T>,

  break: { type: 'break' } as SelectOption<never>,

  getValues: <T>(options: AnyOption<T>[]): T[] => {
    return options.flatMap(o =>
      o.type === 'group'
        ? Option.getValues(o.options)
        : o.type === 'break'
          ? []
          : [o.value]
    )
  },
  contains: <T>(
    options: AnyOption<T>[],
    value: T,
    equality: (a: T, b: T) => boolean = (a, b) => a === b
  ) => {
    return Option.getValues(options).some(v => equality(v, value))
  },
}
