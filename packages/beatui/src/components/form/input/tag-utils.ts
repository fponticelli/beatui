import { DropdownOption, ValueOption } from './option'

/**
 * Toggles the presence of a value in a list. If the value exists, it is removed;
 * if it does not exist, it is appended.
 *
 * @typeParam T - The type of list elements.
 * @param list - The current list of values.
 * @param value - The value to toggle.
 * @param equality - A function to compare two values for equality.
 * @returns A new list with the value toggled.
 *
 * @example
 * ```ts
 * const updated = toggleValue(['a', 'b'], 'c', (a, b) => a === b)
 * // ['a', 'b', 'c']
 * const removed = toggleValue(['a', 'b', 'c'], 'b', (a, b) => a === b)
 * // ['a', 'c']
 * ```
 */
export function toggleValue<T>(
  list: T[],
  value: T,
  equality: (a: T, b: T) => boolean
): T[] {
  const exists = list.some(v => equality(v, value))
  return exists ? list.filter(v => !equality(v, value)) : [...list, value]
}

/**
 * Removes all occurrences of a value from a list.
 *
 * @typeParam T - The type of list elements.
 * @param list - The current list of values.
 * @param value - The value to remove.
 * @param equality - A function to compare two values for equality.
 * @returns A new list with the value removed.
 *
 * @example
 * ```ts
 * const updated = removeValue(['a', 'b', 'c'], 'b', (a, b) => a === b)
 * // ['a', 'c']
 * ```
 */
export function removeValue<T>(
  list: T[],
  value: T,
  equality: (a: T, b: T) => boolean
): T[] {
  return list.filter(v => !equality(v, value))
}

/**
 * Checks whether a list contains a specific value.
 *
 * @typeParam T - The type of list elements.
 * @param list - The list to search.
 * @param value - The value to look for.
 * @param equality - A function to compare two values for equality.
 * @returns `true` if the value is found in the list, `false` otherwise.
 *
 * @example
 * ```ts
 * containsValue(['a', 'b'], 'b', (a, b) => a === b) // true
 * containsValue(['a', 'b'], 'c', (a, b) => a === b) // false
 * ```
 */
export function containsValue<T>(
  list: T[],
  value: T,
  equality: (a: T, b: T) => boolean
): boolean {
  return list.some(v => equality(v, value))
}

/**
 * Searches a hierarchical list of dropdown options for a value and returns its label.
 * Supports nested group options by recursing into group children.
 *
 * @typeParam T - The type of option values.
 * @param options - The list of dropdown options to search.
 * @param target - The value to find.
 * @param equality - A function to compare two values for equality.
 * @returns An object with the matching `label`, or `undefined` if not found.
 *
 * @example
 * ```ts
 * const opt = findOptionByValue(
 *   [{ type: 'value', value: 1, label: 'One' }],
 *   1,
 *   (a, b) => a === b
 * )
 * // { label: 'One' }
 * ```
 */
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

/**
 * Gets the display label for a value from a list of dropdown options.
 * Falls back to `String(target)` if the value is not found.
 *
 * @typeParam T - The type of option values.
 * @param options - The list of dropdown options to search.
 * @param target - The value to look up.
 * @param equality - A function to compare two values for equality.
 * @returns The label string for the matching option, or the stringified target as fallback.
 *
 * @example
 * ```ts
 * const label = getLabelByValue(
 *   [{ type: 'value', value: 'us', label: 'United States' }],
 *   'us',
 *   (a, b) => a === b
 * )
 * // 'United States'
 * ```
 */
export function getLabelByValue<T>(
  options: DropdownOption<T>[],
  target: T,
  equality: (a: T, b: T) => boolean
): string {
  return findOptionByValue(options, target, equality)?.label ?? String(target)
}

/**
 * Filters a hierarchical list of dropdown options by a search query string.
 * By default, matches options whose label contains the query (case-insensitive).
 * Group options are preserved if any of their children match.
 *
 * @typeParam T - The type of option values.
 * @param options - The list of dropdown options to filter.
 * @param query - The search query string.
 * @param predicate - Optional custom match function. Receives the lowercased query and option.
 * @returns A new filtered list of dropdown options.
 *
 * @example
 * ```ts
 * const filtered = filterOptionsByQuery(
 *   [
 *     { type: 'value', value: 1, label: 'Apple' },
 *     { type: 'value', value: 2, label: 'Banana' },
 *   ],
 *   'app',
 * )
 * // [{ type: 'value', value: 1, label: 'Apple' }]
 * ```
 */
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
