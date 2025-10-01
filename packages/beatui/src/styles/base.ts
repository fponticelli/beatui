// CSS entrypoints for BeatUI consumers.
// Default export retains backwards compatibility with the previous single bundle.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite inlines CSS as strings
import standaloneCss from './styles.css?inline'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite inlines CSS as strings
import tailwindCss from './tailwind.css?inline'

export const stylesCss = standaloneCss as string
export const tailwindStylesCss = tailwindCss as string

export default standaloneCss as string
