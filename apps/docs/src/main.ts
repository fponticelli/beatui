import { render } from '@tempots/dom'
import { App } from './app'
import './styles/main.css'
// Import BeatUI CSS directly for docs
import '@tempots/beatui/css'
import '@tempots/beatui/markdown.css'
import '@tempots/beatui/milkdown.css'
import '@tempots/beatui/monaco.css'

// Get the app container
const appElement = document.getElementById('app')

if (!appElement) {
  throw new Error('App element not found')
}

// Render the main app
render(App(), appElement)
