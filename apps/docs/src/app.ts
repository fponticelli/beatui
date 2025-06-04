import { html, Provide } from '@tempots/dom'
import { Theme, ThemeAppeareance } from '@tempots/beatui'
import { HomePage } from './pages/home'

export const App = () => {
  return Provide(Theme, {}, () =>
    html.div(
      ThemeAppeareance(),
      HomePage()
    )
  )
}
