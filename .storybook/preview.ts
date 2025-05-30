import type { Preview } from '@storybook/html'
// Import Iconify web component
import 'iconify-icon'
// Import the generated CSS with all BEM classes and CSS variables
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
