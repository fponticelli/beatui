import { OnDispose, WithElement, Renderable, Value } from '@tempots/dom'

const PREFIX = '$$tts-exp-'

/**
 * Attaches a reactive value to the nearest parent DOM element as an
 * "expando" property (a dynamic property on the element object). This
 * allows passing arbitrary typed data through the DOM without relying
 * on `data-*` attributes or custom events.
 *
 * The value is kept in sync: whenever the reactive `value` changes, the
 * expando property on the element is updated. The property is keyed by
 * an internal prefix plus the provided `name`.
 *
 * @typeParam T - The type of the value to store on the element.
 * @param name - A unique name for the expando property.
 * @param value - A reactive or static value to bind to the element.
 * @returns A renderable that, when mounted, attaches the expando property.
 *
 * @example
 * ```typescript
 * // Attach a typed value to a list item
 * const items = [{ id: 1, label: 'Apple' }, { id: 2, label: 'Banana' }]
 *
 * html.ul(
 *   ...items.map(item =>
 *     html.li(
 *       Expando('item', item),
 *       on.click(emitExpando('item', (clicked: typeof item) => {
 *         console.log('Selected:', clicked.label)
 *       })),
 *       item.label
 *     )
 *   )
 * )
 * ```
 */
export const Expando = <T>(name: string, value: Value<T>): Renderable => {
  return WithElement(el => {
    const id = `${PREFIX}${name}`
    // eslint-disable-next-line tempots/no-redundant-listener-disposal
    return OnDispose(Value.on(value, v => Reflect.set(el, id, v)))
  })
}

/**
 * Creates an event handler that reads an expando property from `event.target`
 * and passes it to the provided callback. Use this with {@link Expando} to
 * retrieve typed data from DOM event targets.
 *
 * @typeParam T - The type of the expando value to retrieve.
 * @param name - The expando property name (must match the name used in {@link Expando}).
 * @param fn - Callback receiving the typed expando value.
 * @returns An event handler function suitable for use with `on.*` bindings.
 *
 * @example
 * ```typescript
 * html.button(
 *   Expando('id', 42),
 *   on.click(emitExpando('id', (id: number) => {
 *     console.log('Clicked item with id:', id)
 *   })),
 *   'Click me'
 * )
 * ```
 */
export const emitExpando = <T>(name: string, fn: (text: T) => void) => {
  const id = `${PREFIX}${name}`
  return (event: Event) => {
    fn(Reflect.get(event.target!, id) as T)
  }
}

/**
 * Creates an event handler that reads an expando property from the currently
 * selected `<option>` element within a `<select>`. Use this with {@link Expando}
 * on individual `<option>` elements to retrieve typed data when the selection changes.
 *
 * @typeParam T - The type of the expando value stored on each option.
 * @param name - The expando property name (must match the name used in {@link Expando}).
 * @param fn - Callback receiving the typed expando value from the selected option.
 * @returns An event handler function suitable for use with `on.change` on a `<select>`.
 *
 * @example
 * ```typescript
 * const fruits = [
 *   { id: 1, name: 'Apple' },
 *   { id: 2, name: 'Banana' },
 * ]
 *
 * html.select(
 *   on.change(emitOptionExpando('fruit', (fruit: typeof fruits[0]) => {
 *     console.log('Selected:', fruit.name)
 *   })),
 *   ...fruits.map(fruit =>
 *     html.option(Expando('fruit', fruit), fruit.name)
 *   )
 * )
 * ```
 */
export const emitOptionExpando = <T>(name: string, fn: (text: T) => void) => {
  const id = `${PREFIX}${name}`
  return (event: Event) => {
    const target = event.target as HTMLSelectElement
    const index = target.selectedIndex
    const option = target.options[index]!
    fn(Reflect.get(option, id) as T)
  }
}
