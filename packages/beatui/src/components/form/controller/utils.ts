import { Controller } from './controller'

/**
 * Transforms a controller that uses `undefined` for absent values into one that uses `null`.
 *
 * Useful for bridging between APIs that represent missing values differently.
 * The returned controller exposes `null` to consumers while the underlying controller stores `undefined`.
 *
 * @typeParam T - The non-nullable base value type
 *
 * @param controller - A controller whose value is `NonNullable<T> | undefined`
 * @returns A new controller whose value is `NonNullable<T> | null`
 *
 * @example
 * ```typescript
 * import { transformNullToUndefined } from '@tempots/beatui'
 *
 * // Original controller uses undefined for absent values
 * const undefinedCtrl: Controller<string | undefined> = ...
 *
 * // Transform to use null instead
 * const nullCtrl = transformNullToUndefined(undefinedCtrl)
 * // nullCtrl.signal.value is string | null
 * ```
 */
export function transformNullToUndefined<T>(
  controller: Controller<NonNullable<T> | undefined>
): Controller<NonNullable<T> | null> {
  return controller.transform(
    v => (v == null ? null : v),
    v => (v == null ? undefined : v)
  )
}

/**
 * Transforms a controller that uses `undefined` for absent values into one that uses empty strings.
 *
 * Maps `undefined` to `''` when reading and `''` to `undefined` when writing.
 * Useful for text inputs that need to represent "no value" as an empty string.
 *
 * @param controller - A controller whose value is `string | undefined`
 * @returns A new controller whose value is always `string` (never undefined)
 *
 * @example
 * ```typescript
 * import { transformEmptyStringToUndefined } from '@tempots/beatui'
 *
 * // Original controller uses undefined for empty
 * const optionalCtrl: Controller<string | undefined> = ...
 *
 * // Transform so empty string maps to undefined
 * const stringCtrl = transformEmptyStringToUndefined(optionalCtrl)
 * // stringCtrl.signal.value is always string
 * ```
 */
export function transformEmptyStringToUndefined(
  controller: Controller<NonNullable<string> | undefined>
): Controller<NonNullable<string>> {
  return controller.transform(
    v => (v == null ? '' : v),
    v => (v === '' ? undefined : v)
  )
}

/**
 * Transforms a controller that uses `null` for absent values into one that uses `undefined`.
 *
 * The inverse of {@link transformNullToUndefined}. Maps `null` to `undefined` when reading
 * and `undefined` to `null` when writing.
 *
 * @typeParam T - The non-nullable base value type
 *
 * @param controller - A controller whose value is `NonNullable<T> | null`
 * @returns A new controller whose value is `NonNullable<T> | undefined`
 *
 * @example
 * ```typescript
 * import { transformUndefinedToNull } from '@tempots/beatui'
 *
 * // Original controller uses null for absent values
 * const nullCtrl: Controller<string | null> = ...
 *
 * // Transform to use undefined instead
 * const undefinedCtrl = transformUndefinedToNull(nullCtrl)
 * // undefinedCtrl.signal.value is string | undefined
 * ```
 */
export function transformUndefinedToNull<T>(
  controller: Controller<NonNullable<T> | null>
): Controller<NonNullable<T> | undefined> {
  return controller.transform(
    v => (v == null ? undefined : v),
    v => (v == null ? null : v)
  )
}
