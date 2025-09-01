import { DropdownOption, ValueOption } from './option'

export function toggleValue<T>(
  list: T[],
  value: T,
  equality: (a: T, b: T) => boolean
): T[] {
  const exists = list.some(v => equality(v, value))
  return exists ? list.filter(v => !equality(v, value)) : [...list, value]
}

export function removeValue<T>(
  list: T[],
  value: T,
  equality: (a: T, b: T) => boolean
): T[] {
  return list.filter(v => !equality(v, value))
}

export function containsValue<T>(
  list: T[],
  value: T,
  equality: (a: T, b: T) => boolean
): boolean {
  return list.some(v => equality(v, value))
}

export function findOptionByValue<T>(
  options: DropdownOption<T>[],
  target: T,
  equality: (a: T, b: T) => boolean
): { label: string } | undefined {
  for (const opt of options) {
    if (opt.type === 'value') {
      if (equality(opt.value, target)) return { label: opt.label }
    } else if (opt.type === 'group') {
      const found = findOptionByValue(
        opt.options as DropdownOption<T>[],
        target,
        equality
      )
      if (found != null) return found
    }
  }
  return undefined
}

export function getLabelByValue<T>(
  options: DropdownOption<T>[],
  target: T,
  equality: (a: T, b: T) => boolean
): string {
  return findOptionByValue(options, target, equality)?.label ?? String(target)
}

export function filterOptionsByQuery<T>(
  options: DropdownOption<T>[],
  query: string,
  predicate?: (q: string, opt: { label: string }) => boolean
): DropdownOption<T>[] {
  const q = query.trim().toLowerCase()
  const match =
    predicate ??
    ((qq: string, o: { label: string }) => o.label.toLowerCase().includes(qq))
  if (q === '') return options

  const filtered: DropdownOption<T>[] = []
  for (const opt of options) {
    if (opt.type === 'value') {
      if (match(q, { label: opt.label })) filtered.push(opt)
    } else if (opt.type === 'group') {
      const sub = filterOptionsByQuery(
        opt.options as DropdownOption<T>[],
        q,
        match
      )
      if (sub.length > 0)
        filtered.push({ ...opt, options: sub as ValueOption<T>[] })
    } else {
      // break: ignore unless surrounded by visible items (simplify by skipping)
    }
  }
  return filtered
}
