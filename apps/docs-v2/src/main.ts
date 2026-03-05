import './styles/main.css'
import { render } from '@tempots/dom'
import { App } from './app'

const appElement = document.getElementById('app')

if (!appElement) {
  throw new Error('App element not found')
}

render(App(), appElement)
