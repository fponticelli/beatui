// Bundles BeatUI base CSS for lazy, bundler-agnostic injection.
// Keep usage internal (loaded via Task in the BeatUI root component).

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite inlines CSS as a string
import css from './index.css?inline'

export default css as string
