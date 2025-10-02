import { render } from '@tempots/dom'
import { App } from './app'
import './styles/main.css'
// BeatUI Tailwind bundle is injected via Vite plugin
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
