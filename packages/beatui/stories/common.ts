import {
  Fragment,
  OnDispose,
  Provide,
  render,
  Renderable,
  Use,
} from '@tempots/dom'
import { Theme, ThemeAppearance } from '../src'

export function renderTempoComponent<T>(fn: (args: T) => Renderable) {
  return (args: T) => {
    const container = document.createElement('div')
    render(
      Provide(Theme, {}, () =>
        Use(Theme, theme =>
          Fragment(
            ThemeAppearance(),
            OnDispose(
              theme.appearance.on(value => {
                document.documentElement.classList.toggle(
                  'bg-gray-900',
                  value === 'dark'
                )
              })
            ),
            fn(args)
          )
        )
      ),
      container,
      { disposeWithParent: false, clear: false }
    )
    return container
  }
}
