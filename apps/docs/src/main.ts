import './styles/main.css'
import '@tempots/beatui/markdown.css'
import '@tempots/beatui/monaco.css'
import '@tempots/beatui/prosemirror.css'
import { render } from '@tempots/dom'
import { App } from './app'

// Get the app container
const appElement = document.getElementById('app')

if (!appElement) {
  throw new Error('App element not found')
}

// Render the main app
render(App(), appElement)
