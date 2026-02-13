import {
  Signal,
  prop,
  html,
  attr,
  style,
  on,
  When,
  OnDispose,
  WithElement,
  signal,
} from '@tempots/dom'
import type { LexicalEditor } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $isCodeNode, CodeNode } from '@lexical/code'

export interface LanguageSelectorOptions {
  editor: Signal<LexicalEditor | null>
  stateUpdate: Signal<number>
  readOnly?: Signal<boolean>
  languages?: string[]
}

/**
 * Default supported languages for code blocks
 */
const DEFAULT_LANGUAGES = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'scala',
  'r',
  'bash',
  'shell',
  'powershell',
  'sql',
  'html',
  'css',
  'scss',
  'json',
  'yaml',
  'xml',
  'markdown',
  'plain',
]

/**
 * Language selector that appears when a code block is selected.
 * Allows changing the programming language for syntax highlighting.
 */
export function LanguageSelector({
  editor,
  stateUpdate,
  readOnly = signal(false),
  languages = DEFAULT_LANGUAGES,
}: LanguageSelectorOptions) {
  const isVisible = prop(false)
  const currentLanguage = prop<string | null>(null)
  const isDropdownOpen = prop(false)

  // Check if a code block is currently selected
  const checkCodeBlockSelection = () => {
    const ed = editor.value
    if (!ed) {
      isVisible.value = false
      return
    }

    ed.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        isVisible.value = false
        return
      }

      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()

      // Check if we're inside a code block
      if ($isCodeNode(element)) {
        isVisible.value = true
        // Get the current language from CodeNode
        const codeElement = element as CodeNode
        const language = codeElement.getLanguage() || 'plain'
        currentLanguage.value = language
      } else {
        isVisible.value = false
        currentLanguage.value = null
      }
    })
  }

  // Watch for state updates
  stateUpdate.onChange(checkCodeBlockSelection)

  // Set language
  const setLanguage = (language: string) => {
    const ed = editor.value
    if (!ed) return

    ed.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()

      if ($isCodeNode(element)) {
        const codeElement = element as CodeNode
        codeElement.setLanguage(language)
        currentLanguage.value = language
      }
    })

    isDropdownOpen.value = false
    ed.focus()
  }

  const toggleDropdown = () => {
    if (!readOnly.value) {
      isDropdownOpen.set(!isDropdownOpen.value)
    }
  }

  // Build the language selector
  const selectorContent = html.div(
    attr.class('bc-code-language-selector'),
    style.position('absolute'),
    style.top('8px'),
    style.right('8px'),
    style.zIndex('10'),

    WithElement(container => {
      const handleClickOutside = (e: MouseEvent) => {
        if (isDropdownOpen.value && !container.contains(e.target as Node)) {
          isDropdownOpen.value = false
        }
      }

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isDropdownOpen.value) {
          isDropdownOpen.value = false
          const ed = editor.value
          if (ed) ed.focus()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)

      return OnDispose(() => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      })
    }),

    // Trigger button
    html.button(
      attr.class('bc-code-language-button'),
      attr.type('button'),
      attr.disabled(readOnly),
      on.click(toggleDropdown),
      style.padding('4px 8px'),
      style.fontSize('0.75rem'),
      style.lineHeight('1'),
      style.fontFamily('monospace'),
      style.backgroundColor('var(--color-neutral-100)'),
      style.border('1px solid var(--color-neutral-300)'),
      style.borderRadius('var(--radius-sm)'),
      style.cursor('pointer'),
      style.color('var(--color-neutral-700)'),
      style.transition('all 0.15s'),
      currentLanguage.map(lang => lang || 'plain')
    ),

    // Dropdown menu
    When(isDropdownOpen, () =>
      html.div(
        attr.class('bc-code-language-dropdown'),
        attr.role('listbox'),
        style.position('absolute'),
        style.top('calc(100% + 4px)'),
        style.right('0'),
        style.minWidth('150px'),
        style.maxHeight('300px'),
        style.overflowY('auto'),
        style.backgroundColor('var(--color-surface)'),
        style.border('1px solid var(--color-border)'),
        style.borderRadius('var(--radius-md)'),
        style.boxShadow('0 2px 8px rgba(0, 0, 0, 0.15)'),
        style.padding('var(--spacing-xs)'),
        style.zIndex('1001'),

        ...languages.map(lang =>
          html.button(
            attr.class('bc-code-language-option'),
            attr.type('button'),
            attr.role('option'),
            on.click(() => setLanguage(lang)),
            style.display('block'),
            style.width('100%'),
            style.padding('var(--spacing-xs) var(--spacing-sm)'),
            style.border('none'),
            style.backgroundColor(
              currentLanguage.map(current =>
                current === lang ? 'var(--color-primary-100)' : 'transparent'
              )
            ),
            style.color('var(--color-neutral-900)'),
            style.textAlign('left'),
            style.cursor('pointer'),
            style.borderRadius('var(--radius-sm)'),
            style.fontSize('0.875rem'),
            style.fontFamily('monospace'),
            style.transition('background-color 0.15s'),
            lang
          )
        )
      )
    )
  )

  return When(isVisible, () => selectorContent)
}
