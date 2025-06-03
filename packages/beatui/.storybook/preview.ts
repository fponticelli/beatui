import type { Preview } from '@storybook/html-vite'
// Import the source CSS with all layered CSS and pure CSS icons
import '../src/styles/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
