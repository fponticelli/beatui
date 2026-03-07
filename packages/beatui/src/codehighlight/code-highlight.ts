import { TNode, Value, attr, html, Renderable, computedOf } from '@tempots/dom'
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki'

export type CodeHighlightOptions = {
  /** The source code to highlight. */
  code: Value<string>
  /** The language identifier (e.g., 'typescript', 'css', 'json'). */
  language?: Value<string>
  /** Light-mode Shiki theme. @default 'github-light' */
  lightTheme?: BundledTheme
  /** Dark-mode Shiki theme. @default 'github-dark' */
  darkTheme?: BundledTheme
}

// Lazy-loaded singleton highlighter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let highlighterPromise: Promise<HighlighterGeneric<any, any>> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(mod =>
      mod.createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: [],
      })
    )
  }
  return highlighterPromise
}

// Inject styles once
let stylesInjected = false
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  stylesInjected = true
  const style = document.createElement('style')
  style.id = 'bc-code-highlight-styles'
  style.textContent = `
.bc-code-highlight pre {
  margin: 0;
  padding: 1rem;
  border-radius: var(--radius-md, 6px);
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.6;
}
.bc-code-highlight code {
  font-family: var(--font-family-mono, ui-monospace, monospace);
}
.bc-code-highlight pre,
.bc-code-highlight pre span {
  color: var(--shiki-light);
  background-color: var(--shiki-light-bg);
}
.dark .bc-code-highlight pre,
.dark .bc-code-highlight pre span {
  color: var(--shiki-dark);
  background-color: var(--shiki-dark-bg);
}`
  document.head.appendChild(style)
}

/**
 * Renders a syntax-highlighted code block using Shiki.
 *
 * Themes are applied using CSS variables so that light/dark mode
 * switching works automatically via the `.dark` class on `<html>`.
 *
 * Styles are injected into `<head>` on first use — no external CSS import needed.
 */
export function CodeHighlight(
  options: CodeHighlightOptions,
  ...children: TNode[]
): Renderable {
  injectStyles()

  const {
    code,
    language = 'text',
    lightTheme = 'github-light',
    darkTheme = 'github-dark',
  } = options

  let current = ''
  const highlighted = computedOf(
    code,
    language
  )(async (src: string, lang: string) =>
    highlight(src, lang, lightTheme, darkTheme)
  ).mapAsync(v => v, current)
  highlighted.on(v => (current = v))

  return html.div(
    attr.class('bc-code-highlight'),
    attr.innerHTML(highlighted),
    ...children
  )
}

async function highlight(
  src: string,
  lang: string,
  lightTheme: BundledTheme,
  darkTheme: BundledTheme
): Promise<string> {
  const highlighter = await getHighlighter()
  const loadedLangs = highlighter.getLoadedLanguages()
  if (lang !== 'text' && !loadedLangs.includes(lang as BundledLanguage)) {
    try {
      await highlighter.loadLanguage(lang as BundledLanguage)
    } catch {
      lang = 'text'
    }
  }
  return highlighter.codeToHtml(src, {
    lang: lang as BundledLanguage,
    themes: { light: lightTheme, dark: darkTheme },
    defaultColor: false,
  })
}
