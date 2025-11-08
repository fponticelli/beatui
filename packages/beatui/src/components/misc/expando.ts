import { OnDispose, WithElement, Renderable, Value } from '@tempots/dom'

const PREFIX = '$$tts-exp-'

export const Expando = <T>(name: string, value: Value<T>): Renderable => {
  return WithElement(el => {
    const id = `${PREFIX}${name}`
    // eslint-disable-next-line tempots/no-redundant-listener-disposal
    return OnDispose(Value.on(value, v => Reflect.set(el, id, v)))
  })
}

export const emitExpando = <T>(name: string, fn: (text: T) => void) => {
  const id = `${PREFIX}${name}`
  return (event: Event) => {
    fn(Reflect.get(event.target!, id) as T)
  }
}

export const emitOptionExpando = <T>(name: string, fn: (text: T) => void) => {
  const id = `${PREFIX}${name}`
  return (event: Event) => {
    const target = event.target as HTMLSelectElement
    const index = target.selectedIndex
    const option = target.options[index]!
    fn(Reflect.get(option, id) as T)
  }
}
