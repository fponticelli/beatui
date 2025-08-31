// Bundles markdown component CSS for lazy injection.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite inlines the CSS as a string
import css from './styles.css?inline'

export default css as string
