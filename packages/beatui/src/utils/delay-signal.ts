import { prop, Signal } from '@tempots/dom'

export function delaySignal<T>(
  signal: Signal<T>,
  delay = 0,
  predicate: (v: T) => boolean = () => true
) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let value: T
  const result = prop(signal.value)
  signal.on(v => {
    value = v
    if (!predicate(v)) {
      result.set(v)
    } else if (timeout == null) {
      timeout = setTimeout(() => {
        timeout = null
        result.set(value)
      }, delay)
    }
  })
  signal.onDispose(() => {
    if (timeout != null) {
      clearTimeout(timeout)
    }
  })
  return result
}
