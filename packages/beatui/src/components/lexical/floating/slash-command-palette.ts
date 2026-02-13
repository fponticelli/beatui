import {
  Signal,
  Prop,
  prop,
  html,
  attr,
  style,
  When,
  OnDispose,
  WithElement,
  aria,
  TNode,
  ForEach,
} from '@tempots/dom'
import type { LexicalEditor } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import type { SlashCommandDefinition } from '../../../lexical/types'
import {
  INSERT_HORIZONTAL_RULE_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '../../../lexical/commands'
import { Icon } from '../../data'

export interface SlashCommandPaletteOptions {
  editor: Signal<LexicalEditor | null>
  commands: SlashCommandDefinition[]
  isVisible: Prop<boolean>
  filterText: Signal<string>
  position: Signal<{ top: number; left: number }>
  onSelect: (command: SlashCommandDefinition) => void
  onDismiss: () => void
}

/**
 * Default slash commands for the editor
 */
export const DEFAULT_SLASH_COMMANDS: SlashCommandDefinition[] = [
  {
    id: 'heading1',
    label: 'Heading 1',
    description: 'Large section heading',
    icon: 'mdi:format-header-1',
    keywords: ['h1', 'heading', 'title'],
    category: 'Basic blocks',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h1'))
        }
      })
    },
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: 'mdi:format-header-2',
    keywords: ['h2', 'heading'],
    category: 'Basic blocks',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h2'))
        }
      })
    },
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    description: 'Small section heading',
    icon: 'mdi:format-header-3',
    keywords: ['h3', 'heading'],
    category: 'Basic blocks',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h3'))
        }
      })
    },
  },
  {
    id: 'bullet-list',
    label: 'Bullet List',
    description: 'Create a bulleted list',
    icon: 'mdi:format-list-bulleted',
    keywords: ['ul', 'unordered', 'bullets'],
    category: 'Lists',
    handler: editor => {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    },
  },
  {
    id: 'ordered-list',
    label: 'Ordered List',
    description: 'Create a numbered list',
    icon: 'mdi:format-list-numbered',
    keywords: ['ol', 'numbered', '1', '2', '3'],
    category: 'Lists',
    handler: editor => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    },
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Insert a blockquote',
    icon: 'mdi:format-quote-close',
    keywords: ['blockquote', 'citation'],
    category: 'Basic blocks',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode())
        }
      })
    },
  },
  {
    id: 'code-block',
    label: 'Code Block',
    description: 'Insert a code block',
    icon: 'mdi:code-braces',
    keywords: ['code', 'pre', 'programming'],
    category: 'Basic blocks',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode())
        }
      })
    },
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Insert a horizontal rule',
    icon: 'mdi:minus',
    keywords: ['hr', 'horizontal', 'line', 'separator'],
    category: 'Basic blocks',
    handler: editor => {
      editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
    },
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a table',
    icon: 'mdi:table',
    keywords: ['table', 'grid', 'cells', 'rows', 'columns'],
    category: 'Advanced',
    handler: editor => {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: '3',
        columns: '3',
        includeHeaders: true,
      })
    },
  },
]

export function SlashCommandPalette({
  commands,
  isVisible,
  filterText,
  position,
  onSelect,
  onDismiss,
}: SlashCommandPaletteOptions) {
  // Active command index for keyboard navigation
  const activeIndex = prop(0)

  // Filter commands based on filter text
  const filteredCommands = filterText.map(filter => {
    const lowerFilter = filter.toLowerCase().trim()
    if (!lowerFilter) return commands

    return commands.filter(cmd => {
      // Match against label, description, keywords
      const searchText = [
        cmd.label.toLowerCase(),
        cmd.description?.toLowerCase() || '',
        ...(cmd.keywords?.map(k => k.toLowerCase()) || []),
      ].join(' ')

      return searchText.includes(lowerFilter)
    })
  })

  // Reset active index when filtered commands change
  filteredCommands.onChange(() => {
    activeIndex.value = 0
  })

  // Handle command selection
  const selectCommand = (index: number) => {
    const cmds = filteredCommands.value
    if (index >= 0 && index < cmds.length) {
      const cmd = cmds[index]
      onSelect(cmd)
    }
  }

  // Keyboard navigation handler
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isVisible.value) return

    const cmds = filteredCommands.value
    const maxIndex = cmds.length - 1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        activeIndex.value = Math.min(activeIndex.value + 1, maxIndex)
        break
      case 'ArrowUp':
        e.preventDefault()
        activeIndex.value = Math.max(activeIndex.value - 1, 0)
        break
      case 'Enter':
        e.preventDefault()
        selectCommand(activeIndex.value)
        break
      case 'Escape':
        e.preventDefault()
        onDismiss()
        break
    }
  }

  // Helper to render a single command item
  const renderCommandItem = (cmd: SlashCommandDefinition, index: number) => {
    const isActive = activeIndex.map(active => active === index)
    const itemId = `slash-cmd-${cmd.id}`

    return html.div(
      attr.class('bc-slash-command-palette__item'),
      attr.id(itemId),
      attr.role('option'),
      aria.selected(isActive),

      // Mouse hover handlers
      WithElement(el => {
        const handleMouseEnter = () => {
          activeIndex.value = index
        }
        const handleClick = () => {
          selectCommand(index)
        }

        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('click', handleClick)

        return OnDispose(() => {
          el.removeEventListener('mouseenter', handleMouseEnter)
          el.removeEventListener('click', handleClick)
        })
      }),

      // Icon
      typeof cmd.icon === 'string'
        ? html.div(
            attr.class('bc-slash-command-palette__icon'),
            Icon({ icon: cmd.icon, size: 'sm' })
          )
        : (cmd.icon as TNode),

      // Label and description
      html.div(
        attr.class('bc-slash-command-palette__content'),

        html.div(attr.class('bc-slash-command-palette__label'), cmd.label),

        cmd.description
          ? html.div(
              attr.class('bc-slash-command-palette__description'),
              cmd.description
            )
          : undefined
      ),

      // Category badge (optional)
      cmd.category
        ? html.div(
            attr.class('bc-slash-command-palette__category'),
            cmd.category
          )
        : undefined
    )
  }

  // Build the command palette
  const paletteContent = html.div(
    attr.class('bc-slash-command-palette'),
    attr.role('listbox'),
    aria.label('Slash commands'),
    style.position('absolute'),
    style.top(position.map(p => `${p.top}px`)),
    style.left(position.map(p => `${p.left}px`)),

    WithElement(() => {
      document.addEventListener('keydown', handleKeyDown)
      return OnDispose(() => {
        document.removeEventListener('keydown', handleKeyDown)
      })
    }),

    // Empty state
    When(
      filteredCommands.map(cmds => cmds.length === 0),
      () =>
        html.div(
          attr.class('bc-slash-command-palette__empty'),
          'No commands found'
        )
    ),

    // Command list using ForEach for proper Tempo dynamic list rendering
    ForEach(filteredCommands, (cmdSignal, position) => {
      const cmd = cmdSignal.value
      return renderCommandItem(cmd, position.index)
    })
  )

  return When(isVisible, () => paletteContent)
}
