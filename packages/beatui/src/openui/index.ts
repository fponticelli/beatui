/**
 * OpenUI Lang integration for `@tempots/beatui/openui`.
 *
 * Parses OpenUI Lang markup from LLM responses and renders live BeatUI
 * components. Includes a pre-built component library, streaming adapters,
 * and an extensible component registration system.
 *
 * ```ts
 * import { beatuiLibrary, OpenUIRenderer, fromFetch } from '@tempots/beatui/openui'
 * ```
 *
 * @module
 */

// Parser
export { createParser } from './parser/parser'
export { createStreamingParser } from './parser/streaming-parser'
export type { ParseResult, ParseError, ASTNode, Statement, ComponentNameChecker } from './parser/types'

// Library
export { defineComponent } from './library/define-component'
export { createLibrary } from './library/library'
export type { DefinedComponent, Library, ComponentGroup, PromptOptions } from './library/types'

// Pre-built registry
export { beatuiLibrary } from './registry'

// Renderer
export { OpenUIRenderer } from './renderer/openui-renderer'
export { ActionContextProvider } from './renderer/action-context'
export type { OpenUIRendererOptions } from './renderer/openui-renderer'
export type { ActionEvent, ButtonAction, FormSubmitAction, ActionContext } from './renderer/action-context'

// Streaming adapters
export { fromSSE } from './streaming/from-sse'
export { fromFetch } from './streaming/from-fetch'
export { fromWebSocket } from './streaming/from-websocket'
export type { StreamOptions } from './streaming/types'
