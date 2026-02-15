import {
  attr,
  computedOf,
  html,
  MapSignal,
  prop,
  style,
  type Signal,
} from '@tempots/dom'
import { NativeSelect, ScrollablePanel, Stack, Switch } from '@tempots/beatui'
import {
  BareEditor,
  ContextualEditor,
  DockedEditor,
  createDefaultPluginConfig,
} from '@tempots/beatui/lexical'
import type {
  ContentFormatType,
  EditorPresetType,
  JsonContent,
  LexicalEditorBaseOptions,
  PluginConfig,
  ToolbarGroupId,
} from '@tempots/beatui/lexical'

// Helper to capitalize the first letter of a string
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Helper to create NativeSelect value options
function selectOption<T extends string>(value: T, label: string) {
  return { type: 'value' as const, value, label }
}

// Plugin toggle definitions for the UI
const pluginToggles: { key: keyof PluginConfig; label: string }[] = [
  { key: 'richText', label: 'Rich Text' },
  { key: 'history', label: 'History' },
  { key: 'clipboard', label: 'Clipboard' },
  { key: 'list', label: 'Lists' },
  { key: 'link', label: 'Links' },
  { key: 'autoLink', label: 'Auto Link' },
  { key: 'code', label: 'Code Blocks' },
  { key: 'table', label: 'Tables' },
  { key: 'hashtag', label: 'Hashtags' },
  { key: 'mark', label: 'Annotations' },
  { key: 'dragon', label: 'Drag & Drop' },
]

// Map plugin config to hidden toolbar groups for the docked editor.
// The 'blocks' group contains Blockquote/HR (richText) and Code Block (code),
// so it's hidden only when both are off.
function getHiddenToolbarGroups(plugins: PluginConfig): ToolbarGroupId[] {
  const hidden: ToolbarGroupId[] = []
  if (!plugins.richText)
    hidden.push(
      'text-formatting',
      'headings',
      'font',
      'color',
      'clear-formatting'
    )
  if (!plugins.richText && !plugins.code) hidden.push('blocks')
  if (!plugins.history) hidden.push('history')
  if (!plugins.list) hidden.push('lists')
  if (!plugins.link) hidden.push('links')
  if (!plugins.table) hidden.push('tables')
  if (!plugins.clipboard) hidden.push('clipboard')
  return hidden
}

// Map plugin config to visible floating toolbar groups for the contextual editor
function getFloatingToolbarGroups(plugins: PluginConfig): ToolbarGroupId[] {
  const groups: ToolbarGroupId[] = []
  if (plugins.richText) groups.push('text-formatting')
  if (plugins.link) groups.push('links')
  if (plugins.clipboard) groups.push('clipboard')
  return groups
}

const markdownSample = `# Rich Text Demo

This paragraph shows **bold**, _italic_, and \`inline code\` formatting.

## Lists

- First item
- Second item
  - Nested item

1. Ordered one
2. Ordered two

> A blockquote with _emphasized_ text.

\`\`\`
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

---

[Visit Example](https://example.com)
`

const htmlSample = [
  '<h1>Rich Text Demo</h1>',
  '<p>This paragraph shows <b>bold</b>, <i>italic</i>, and <code>inline code</code> formatting.</p>',
  '<h2>Lists</h2>',
  '<ul><li>First item</li><li>Second item<ul><li>Nested item</li></ul></li></ul>',
  '<ol><li>Ordered one</li><li>Ordered two</li></ol>',
  '<blockquote>A blockquote with <i>emphasized</i> text.</blockquote>',
  '<p><a href="https://example.com">Visit Example</a></p>',
].join('\n')

const jsonSample = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Rich Text Demo',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h1',
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'This demonstrates the ',
            type: 'text',
            version: 1,
          },
          {
            detail: 0,
            format: 1,
            mode: 'normal',
            style: '',
            text: 'JSON format',
            type: 'text',
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' for Lexical editor state. The content is a serialized ',
            type: 'text',
            version: 1,
          },
          {
            detail: 0,
            format: 2,
            mode: 'normal',
            style: '',
            text: 'editor state',
            type: 'text',
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' object.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Bold text uses format bitmask ',
                type: 'text',
                version: 1,
              },
              {
                detail: 0,
                format: 16,
                mode: 'normal',
                style: '',
                text: '1',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Italic uses ',
                type: 'text',
                version: 1,
              },
              {
                detail: 0,
                format: 16,
                mode: 'normal',
                style: '',
                text: '2',
                type: 'text',
                version: 1,
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: ', code uses ',
                type: 'text',
                version: 1,
              },
              {
                detail: 0,
                format: 16,
                mode: 'normal',
                style: '',
                text: '16',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul',
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

const formatSamples = {
  markdown: markdownSample,
  html: htmlSample,
  json: jsonSample,
}

const formatDescriptions: Record<ContentFormatType, string> = {
  markdown:
    'Content is serialized as Markdown. Good for human-readable storage and interoperability.',
  html: 'Content is serialized as HTML markup. Useful when rendering output directly in web pages.',
  json: 'Content is serialized as Lexical editor state JSON. Preserves full fidelity of the editor state.',
}

const presetDescriptions: Record<EditorPresetType, string> = {
  bare: 'Minimal editor surface with no UI chrome. Use this when you want to provide your own toolbar or controls.',
  docked:
    'Full-featured editor with a persistent toolbar above the editing area. All formatting options are always visible.',
  contextual:
    'Clean editor surface that shows a floating toolbar on text selection and a block handle for changing block types.',
}

// Reusable info panel component
function InfoPanel(
  titleSignal: Signal<string>,
  descriptionSignal: Signal<string>
) {
  return Stack(
    attr.class('gap-2 p-4 border rounded'),
    html.h4(attr.class('font-semibold text-sm'), titleSignal),
    html.p(
      attr.class('text-sm text-gray-600 dark:text-gray-400'),
      descriptionSignal
    )
  )
}

export default function LexicalEditorPage() {
  const preset = prop<EditorPresetType>('docked')
  const format = prop<ContentFormatType>('markdown')
  const readOnly = prop(false)
  const currentOutput = prop('')
  const pluginConfig = prop<PluginConfig>(createDefaultPluginConfig('docked'))

  // Reset plugin config when preset changes
  preset.onChange(p => pluginConfig.set(createDefaultPluginConfig(p)))

  const togglePlugin = (key: keyof PluginConfig) => {
    const current = pluginConfig.value
    const updated = { ...current, [key]: !current[key] }
    // richText and plainText are mutually exclusive — one must be active
    if (key === 'richText') {
      updated.plainText = !updated.richText
    }
    pluginConfig.set(updated)
  }

  const isPluginEnabled = (key: keyof PluginConfig): Signal<boolean> =>
    pluginConfig.map(cfg => !!cfg[key])

  const handleInput = (content: string | JsonContent) => {
    if (typeof content === 'string') {
      currentOutput.set(content)
    } else {
      currentOutput.set(JSON.stringify(content, null, 2))
    }
  }

  // Combine preset + format + plugins into a single config object
  // MapSignal remounts the editor on every change
  const editorConfig = computedOf(
    preset,
    format,
    pluginConfig
  )((p, f, plugins) => ({ preset: p, format: f, plugins }))

  return ScrollablePanel({
    body: html.div(
      attr.class('flex flex-row items-start gap-4 p-4 h-full overflow-hidden'),

      // Left side - Editor
      html.div(
        attr.class('flex flex-col flex-1 gap-4 h-full'),

        // Title
        html.h3(
          attr.class('text-lg font-semibold'),
          'Lexical Rich Text Editor'
        ),

        // Editor Controls
        html.div(
          attr.class('flex flex-row items-center gap-4 flex-wrap'),

          // Preset Selector
          html.label(
            attr.class('flex items-center gap-2'),
            html.span('Preset:'),
            NativeSelect({
              options: [
                selectOption('bare', 'Bare'),
                selectOption('docked', 'Docked'),
                selectOption('contextual', 'Contextual'),
              ],
              value: preset,
              onChange: preset.set,
            })
          ),

          // Format Selector
          html.label(
            attr.class('flex items-center gap-2'),
            html.span('Format:'),
            NativeSelect({
              options: [
                selectOption('markdown', 'Markdown'),
                selectOption('html', 'HTML'),
                selectOption('json', 'JSON'),
              ],
              value: format,
              onChange: format.set,
            })
          ),

          // Read Only Toggle
          html.label(
            attr.class('flex items-center gap-2'),
            Switch({ value: readOnly, onChange: readOnly.set }),
            html.span('Read Only')
          )
        ),

        // Editor Container
        html.div(
          attr.class('flex-1 border rounded overflow-hidden'),
          style.minHeight('0'),
          MapSignal(editorConfig, ({ preset: p, format: f, plugins }) => {
            const base: LexicalEditorBaseOptions = {
              value: formatSamples[f],
              format: f,
              readOnly,
              plugins,
              onInput: handleInput,
              placeholder: 'Start typing...',
            } as LexicalEditorBaseOptions
            switch (p) {
              case 'docked':
                return DockedEditor({
                  ...base,
                  toolbar: { hiddenGroups: getHiddenToolbarGroups(plugins) },
                })
              case 'contextual':
                return ContextualEditor({
                  ...base,
                  floatingToolbarGroups: getFloatingToolbarGroups(plugins),
                })
              default:
                return BareEditor(base)
            }
          })
        )
      ),

      // Right side - Info and Preview
      html.div(
        attr.class('flex flex-col gap-4'),
        style.minWidth('20rem'),
        style.maxWidth('20rem'),

        // Preset Info Panel
        InfoPanel(
          preset.map(p => `${capitalize(p)} Editor`),
          preset.map(p => presetDescriptions[p])
        ),

        // Format Info
        InfoPanel(
          format.map(f => `Format: ${capitalize(f)}`),
          format.map(f => formatDescriptions[f])
        ),

        // Plugin Toggles
        Stack(
          attr.class('gap-2 p-4 border rounded'),
          html.h4(attr.class('font-semibold text-sm'), 'Plugins'),
          ...pluginToggles.map(({ key, label }) =>
            html.label(
              attr.class('flex items-center gap-2'),
              Switch({
                value: isPluginEnabled(key),
                onChange: () => togglePlugin(key),
                size: 'xs',
              }),
              html.span(attr.class('text-sm'), label)
            )
          )
        ),

        // Output Preview
        Stack(
          attr.class('flex-1 gap-2 p-4 border rounded overflow-auto'),
          html.h4(
            attr.class('font-semibold text-sm'),
            format.map(f => `Current ${capitalize(f)}`)
          ),
          html.pre(
            attr.class(
              'text-xs overflow-auto bg-gray-50 dark:bg-gray-900 p-2 rounded'
            ),
            style.maxHeight('400px'),
            currentOutput
          )
        )
      )
    ),
  })
}
