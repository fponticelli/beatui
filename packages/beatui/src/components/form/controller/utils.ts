import { Controller } from './controller'

export function transformNullToUndefined<T>(
  controller: Controller<NonNullable<T> | undefined>
): Controller<NonNullable<T> | null> {
  return controller.transform(
    v => (v == null ? null : v),
    v => (v == null ? undefined : v)
  )
}

export function transformUndefinedToNull<T>(
  controller: Controller<NonNullable<T> | null>
): Controller<NonNullable<T> | undefined> {
  return controller.transform(
    v => (v == null ? undefined : v),
    v => (v == null ? null : v)
  )
}
