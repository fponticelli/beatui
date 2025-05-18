import {
  Fragment,
  OnDispose,
  Provide,
  render,
  Renderable,
  Use,
} from '@tempots/dom'
import { ThemeProvider } from '../src/components/theme'

export function renderTempoComponent<T>(fn: (args: T) => Renderable) {
  return (args: T) => {
    const container = document.createElement('div')
    render(
      Provide(ThemeProvider, {}, () =>
        Use(ThemeProvider, theme =>
          Fragment(
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
