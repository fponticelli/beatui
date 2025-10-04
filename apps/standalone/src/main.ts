import '@tempots/beatui/css'
import './styles/main.css'
import { render } from '@tempots/dom'
import { App } from './app'

const root = document.getElementById('app')

if (!root) {
  throw new Error('App element not found')
}

render(App(), root)
