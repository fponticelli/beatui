import { Renderable, Value, html, attr, aria, computedOf } from '@tempots/dom'
import { InputContainer } from '../form/input/input-container'
import { BareEditor } from './bare-editor'
import type { JsonContent, LexicalInputOptions } from '../../lexical/types'
import type { LexicalEditor } from 'lexical'

/**
 * LexicalEditorInput - Form-compatible rich text editor input
 *
 * Wraps BareEditor with BeatUI's form system integration (InputContainer).
 * Supports markdown, HTML, and JSON formats. Compatible with form controllers
 * and validation.
 *
 * @example
 * ```ts
 * const content = prop('')
 * LexicalEditorInput({
 *   value: content,
 *   format: 'markdown',
 *   placeholder: 'Enter text...',
 *   onInput: (v) => console.log(v),
 * })
 * ```
 *
 * @example With form controller:
 * ```ts
 * Control(LexicalEditorInput, {
 *   controller: formController.field('description'),
 *   label: 'Description',
 *   format: 'markdown',
 * })
 * ```
 */
export const LexicalEditorInput = (
  options: LexicalInputOptions
): Renderable => {
  const {
    // InputOptions fields
    value,
    before,
    after,
    onChange: formOnChange,
    onInput: formOnInput,
    onBlur: formOnBlur,
    disabled,
    hasError,
    name,
    placeholder,
    id,
    required,
    tabIndex,
    size,
    class: cls,
    // LexicalEditorBaseOptions fields
    namespace,
    format,
    plugins,
    readOnly,
    onError,
    onReady,
    marks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = options as Record<string, unknown> as any // Union type requires runtime access to all fields

  // Map disabled to readOnly (editor doesn't have a native disabled concept)
  // Combine disabled and readOnly - if either is true, editor should be read-only
  const editorReadOnly =
    disabled != null && readOnly != null
      ? computedOf(disabled, readOnly)((d, r) => (d ?? false) || (r ?? false))
      : disabled != null
        ? disabled
        : readOnly

  return InputContainer({
    disabled,
    hasError,
    size,
    baseContainer: true,
    growInput: true,
    focusableSelector: '[contenteditable]',
    before,
    after,
    input: html.div(
      attr.class('bc-lexical-editor-input'),
      attr.name(name),
      attr.id(id),
      required != null ? aria.required(required) : null,
      tabIndex != null ? attr.tabindex(tabIndex) : null,
      hasError != null
        ? attr.class(
            Value.map(hasError, (e): string =>
              e ? 'bc-lexical-editor-input--error' : ''
            )
          )
        : null,
      BareEditor({
        value,
        format: format ?? 'markdown',
        plugins,
        readOnly: editorReadOnly,
        placeholder,
        namespace,
        class: cls,
        onError,
        onReady,
        marks,
        onInput: formOnInput
          ? (content: string | JsonContent, _editor: LexicalEditor) => {
              // Content type matches format (string for markdown/html, JsonContent for json)
              ;(formOnInput as (content: string | JsonContent) => void)(content)
            }
          : undefined,
        onChange: formOnChange
          ? (content: string | JsonContent, _editor: LexicalEditor) => {
              // Content type matches format (string for markdown/html, JsonContent for json)
              ;(formOnChange as (content: string | JsonContent) => void)(
                content
              )
            }
          : undefined,
        onBlur: formOnBlur
          ? (_editor: LexicalEditor) => {
              formOnBlur()
            }
          : undefined,
      })
    ),
  })
}
