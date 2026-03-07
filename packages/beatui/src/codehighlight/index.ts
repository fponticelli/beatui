/**
 * Syntax-highlighted code block component powered by Shiki.
 *
 * Ships as a separate entry point (`@tempots/beatui/codehighlight`) to keep the
 * core bundle small — Shiki grammars and themes are only loaded when this
 * module is imported.
 *
 * ```ts
 * import { CodeHighlight } from '@tempots/beatui/codehighlight'
 * ```
 *
 * @module
 */

export { CodeHighlight, type CodeHighlightOptions } from './code-highlight'
