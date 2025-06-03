import type { Preview } from '@storybook/html-vite'
// Import the generated CSS with all layered CSS and pure CSS icons
import '../dist/tempo-ui-lib.css'

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
