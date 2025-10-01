import {
  html,
  attr,
  Renderable,
  computedOf,
  prop,
  on,
  When,
  style,
  Ensure,
  ForEach,
  WithElement,
} from '@tempots/dom'
import { type Controller } from '../../form'
import { Button } from '../../button'
import { Icon } from '../../data'
import { Stack } from '../../layout'

/**
 * File upload widget configuration
 */
export interface FileUploadConfig {
  /** Accepted file types (MIME types or extensions) */
  accept?: string[]
  /** Maximum file size in bytes */
  maxSize?: number
  /** Allow multiple files */
  multiple?: boolean
  /** Upload endpoint URL */
  uploadUrl?: string
  /** Custom upload handler */
  onUpload?: (files: FileList) => Promise<string | string[]>
  /** Preview mode for images */
  showPreview?: boolean
}

/**
 * Rich text editor configuration
 */
export interface RichTextConfig {
  /** Toolbar options */
  toolbar?: ('bold' | 'italic' | 'underline' | 'link' | 'list' | 'heading')[]
  /** Maximum length */
  maxLength?: number
  /** Placeholder text */
  placeholder?: string
  /** Output format */
  format?: 'html' | 'markdown' | 'text'
}

/**
 * Code editor configuration
 */
export interface CodeEditorConfig {
  /** Programming language */
  language?: string
  /** Theme */
  theme?: 'light' | 'dark' | 'auto'
  /** Show line numbers */
  lineNumbers?: boolean
  /** Enable syntax highlighting */
  syntaxHighlighting?: boolean
  /** Tab size */
  tabSize?: number
  /** Enable code folding */
  codeFolding?: boolean
}

/**
 * File upload widget
 */
export function FileUploadWidget({
  controller,
  config = {},
}: {
  controller: Controller<string | string[] | null>
  config?: FileUploadConfig
}): Renderable {
  const isDragging = prop(false)
  const isUploading = prop(false)
  const uploadProgress = prop(0)

  const acceptString = config.accept?.join(',') || '*/*'
  const isMultiple = config.multiple || false

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Validate file size
    if (config.maxSize) {
      for (const file of Array.from(files)) {
        if (file.size > config.maxSize) {
          // TODO: Show error message
          console.error(
            `File ${file.name} exceeds maximum size of ${config.maxSize} bytes`
          )
          return
        }
      }
    }

    // Handle upload
    if (config.onUpload) {
      try {
        isUploading.set(true)
        const result = await config.onUpload(files)
        controller.change(result)
      } catch (error) {
        console.error('Upload failed:', error)
        // TODO: Show error message
      } finally {
        isUploading.set(false)
      }
    } else {
      // Default behavior: store file names
      const fileNames = Array.from(files).map(f => f.name)
      controller.change(isMultiple ? fileNames : fileNames[0] || null)
    }
  }

  return html.div(
    attr.class('bc-file-upload'),
    attr.class(
      computedOf(isDragging)((dragging): string =>
        dragging ? 'bc-file-upload--dragging' : ''
      )
    ),

    // Hidden file input
    html.input(
      attr.type('file'),
      attr.accept(acceptString),
      attr.multiple(isMultiple),
      attr.class('bc-file-upload__input'),
      on.change(e => {
        const input = e.target as HTMLInputElement
        handleFileSelect(input.files)
      })
    ),

    // Drop zone
    html.div(
      attr.class('bc-file-upload__dropzone'),
      on.dragover(e => {
        e.preventDefault()
        isDragging.set(true)
      }),
      on.dragleave(() => isDragging.set(false)),
      on.drop(e => {
        e.preventDefault()
        isDragging.set(false)
        handleFileSelect(e.dataTransfer?.files || null)
      }),
      on.click(e => {
        const input = (e.currentTarget as HTMLElement).querySelector(
          'input[type="file"]'
        ) as HTMLInputElement
        input?.click()
      }),

      Stack(
        attr.class('bc-group--gap-2 bc-group--align-center'),
        Icon({ icon: 'upload', size: 'lg' }),
        html.div(
          attr.class('bc-file-upload__text'),
          computedOf(isUploading)((uploading): string =>
            uploading ? 'Uploading...' : 'Drop files here or click to browse'
          )
        ),
        config.accept &&
          html.div(
            attr.class('bc-file-upload__hint'),
            `Accepted types: ${config.accept.join(', ')}`
          )
      )
    ),

    // Upload progress
    When(isUploading, () =>
      html.div(
        attr.class('bc-file-upload__progress'),
        html.div(
          attr.class('bc-file-upload__progress-bar'),
          style.width(computedOf(uploadProgress)(progress => `${progress}%`))
        )
      )
    ),

    // File preview/list
    Ensure(controller.value, value => {
      return html.div(
        attr.class('bc-file-upload__files'),
        ForEach(
          value.map(v => (Array.isArray(v) ? v : [v])),
          fileName =>
            html.div(
              attr.class('bc-file-upload__file'),
              Icon({ icon: 'file', size: 'sm' }),
              html.span(fileName),
              Button(
                {
                  variant: 'text',
                  size: 'sm',
                  onClick: () => {
                    const value = controller.value.value
                    if (Array.isArray(value)) {
                      const newFiles = value.filter(f => f !== fileName.value)
                      controller.change(newFiles.length > 0 ? newFiles : null)
                    } else {
                      controller.change(null)
                    }
                  },
                },
                Icon({ icon: 'x', size: 'xs' })
              )
            )
        )
      )
    })
  )
}

/**
 * Rich text editor widget (simplified implementation)
 */
export function RichTextWidget({
  controller,
  config = {},
}: {
  controller: Controller<string | null>
  config?: RichTextConfig
}): Renderable {
  const editorRef = prop<HTMLDivElement | null>(null)
  const isFocused = prop(false)

  const toolbar = config.toolbar || ['bold', 'italic', 'underline', 'link']

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.value?.focus()
  }

  return html.div(
    attr.class('bc-rich-text'),

    // Toolbar
    html.div(
      attr.class('bc-rich-text__toolbar'),
      ...toolbar.map(tool => {
        const toolConfig = {
          bold: { icon: 'bold', command: 'bold' },
          italic: { icon: 'italic', command: 'italic' },
          underline: { icon: 'underline', command: 'underline' },
          link: { icon: 'link', command: 'createLink' },
          list: { icon: 'list', command: 'insertUnorderedList' },
          heading: { icon: 'heading', command: 'formatBlock' },
        }[tool]

        if (!toolConfig) return null

        return Button(
          {
            variant: 'text',
            size: 'sm',
            onClick: () => {
              if (tool === 'link') {
                const url = prompt('Enter URL:')
                if (url) execCommand(toolConfig.command, url)
              } else if (tool === 'heading') {
                execCommand(toolConfig.command, '<h3>')
              } else {
                execCommand(toolConfig.command)
              }
            },
          },
          Icon({ icon: toolConfig.icon, size: 'sm' })
        )
      })
    ),

    // Editor
    html.div(
      attr.class('bc-rich-text__editor'),
      attr.class(
        computedOf(isFocused)((focused): string =>
          focused ? 'bc-rich-text__editor--focused' : ''
        )
      ),
      attr.contenteditable('true'),
      attr.innerHTML(controller.value.map(v => v || '')),
      config.placeholder && attr.placeholder(config.placeholder),

      on.focus(() => isFocused.set(true)),
      on.blur(() => isFocused.set(false)),
      on.input(e => {
        const target = e.target as HTMLDivElement
        const content =
          config.format === 'text' ? target.textContent : target.innerHTML
        controller.change(content || null)
      }),

      // Store reference
      WithElement((element: HTMLDivElement) => {
        editorRef.set(element)
        return null
      })
    ),

    // Character count
    config.maxLength != null
      ? html.div(
          attr.class('bc-rich-text__counter'),
          computedOf(controller.value)((value): string => {
            const length = value?.length || 0
            const remaining = config.maxLength! - length
            return `${length}/${config.maxLength} ${remaining < 0 ? '(exceeded)' : ''}`
          })
        )
      : null
  )
}

/**
 * Code editor widget (simplified implementation)
 */
export function CodeEditorWidget({
  controller,
  config = {},
}: {
  controller: Controller<string | null>
  config?: CodeEditorConfig
}): Renderable {
  const textareaRef = prop<HTMLTextAreaElement | null>(null)

  const handleKeyDown = (e: KeyboardEvent) => {
    const textarea = e.target as HTMLTextAreaElement

    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const spaces = ' '.repeat(config.tabSize || 2)

      const newValue =
        textarea.value.substring(0, start) +
        spaces +
        textarea.value.substring(end)
      controller.change(newValue)

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length
      })
    }
  }

  return html.div(
    attr.class('bc-code-editor'),
    attr.class(`bc-code-editor--${config.theme || 'light'}`),
    config.language && attr.class(`bc-code-editor--${config.language}`),

    // Line numbers (if enabled)
    config.lineNumbers != null
      ? html.div(
          attr.class('bc-code-editor__line-numbers'),
          html.div(
            attr.class('bc-code-editor__line-number'),
            computedOf(controller.value)((value): string => {
              const lines = (value || '').split('\n').length
              return Array.from({ length: lines }, (_, i) =>
                String(i + 1)
              ).join('\n')
            })
          )
        )
      : null,

    // Editor textarea
    html.textarea(
      attr.class('bc-code-editor__textarea'),
      attr.value(controller.value.map(v => v || '')),
      attr.spellcheck(false),
      attr.autocomplete('off'),
      // attr.autocorrect('off'),
      attr.autocapitalize('off'),

      on.input(e => {
        const target = e.target as HTMLTextAreaElement
        controller.change(target.value || null)
      }),
      on.keydown(handleKeyDown),

      // Store reference
      WithElement((element: HTMLTextAreaElement) => {
        textareaRef.set(element)
        return null
      })
    )
  )
}
