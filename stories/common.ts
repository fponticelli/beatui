import { Provide, render, Renderable } from '@tempots/dom'
import { ThemeProvider } from '../src/components/theme'

export function renderTempoComponent<T>(fn: (args: T) => Renderable) {
  return (args: T) => {
    const container = document.createElement('div')
    render(
      Provide(ThemeProvider, {}, () => fn(args)),
      container,
      { disposeWithParent: false, clear: false }
    )
    return container
  }
}
