const en = {
  // Toolbar actions
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  code: 'Code',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  heading4: 'Heading 4',
  heading5: 'Heading 5',
  heading6: 'Heading 6',
  bulletList: 'Bullet List',
  orderedList: 'Ordered List',
  checkList: 'Check List',
  quote: 'Quote',
  codeBlock: 'Code Block',
  divider: 'Divider',
  link: 'Link',
  table: 'Table',
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  insertTable: 'Insert Table',
  indent: 'Indent',
  outdent: 'Outdent',
  fontFamily: 'Font Family',
  fontSize: 'Font Size',
  fontColor: 'Font Color',
  highlightColor: 'Highlight Color',
  backgroundColor: 'Background Color',
  clearFormatting: 'Clear Formatting',

  // Slash commands
  slashCommandsTitle: 'Commands',
  slashCommandsEmpty: 'No commands found',
  slashCommandHeading1: 'Heading 1',
  slashCommandHeading1Desc: 'Large section heading',
  slashCommandHeading2: 'Heading 2',
  slashCommandHeading2Desc: 'Medium section heading',
  slashCommandHeading3: 'Heading 3',
  slashCommandHeading3Desc: 'Small section heading',
  slashCommandBulletList: 'Bullet List',
  slashCommandBulletListDesc: 'Create a bulleted list',
  slashCommandOrderedList: 'Ordered List',
  slashCommandOrderedListDesc: 'Create a numbered list',
  slashCommandQuote: 'Quote',
  slashCommandQuoteDesc: 'Insert a blockquote',
  slashCommandCodeBlock: 'Code Block',
  slashCommandCodeBlockDesc: 'Insert a code block',
  slashCommandDivider: 'Divider',
  slashCommandDividerDesc: 'Insert a horizontal rule',
  slashCommandTable: 'Table',
  slashCommandTableDesc: 'Insert a table',

  // Table actions
  insertRowAbove: 'Insert row above',
  insertRowBelow: 'Insert row below',
  insertColumnLeft: 'Insert column left',
  insertColumnRight: 'Insert column right',
  deleteRow: 'Delete row',
  deleteColumn: 'Delete column',
  deleteTable: 'Delete table',

  // Link actions
  linkUrl: 'URL',
  linkUrlPlaceholder: 'https://example.com',
  linkText: 'Text',
  linkTextPlaceholder: 'Link text',
  linkInsert: 'Insert link',
  linkEdit: 'Edit link',
  linkRemove: 'Remove link',
  linkOpen: 'Open link',

  // Code block
  codeLanguage: 'Language',
  codeLanguagePlaceholder: 'Select language',

  // File operations
  exportMarkdown: 'Export as Markdown',
  exportHtml: 'Export as HTML',
  exportJson: 'Export as JSON',
  importFile: 'Import file',

  // Character count
  characterCount: (count: number) => `${count} characters`,
  characterCountWithMax: (count: number, max: number) =>
    `${count} / ${max} characters`,
  characterCountExceeded: 'Character limit exceeded',

  // Errors
  errorGeneric: 'An error occurred',
  errorLoadFailed: 'Failed to load editor',
  errorSaveFailed: 'Failed to save content',

  // Placeholder
  placeholder: 'Start typing...',
  placeholderEmpty: 'Type / for commands',

  // Accessibility
  a11yEditor: 'Rich text editor',
  a11yToolbar: 'Editor toolbar',
  a11yFloatingToolbar: 'Floating toolbar',
  a11ySlashCommands: 'Slash commands menu',
  a11yTableControls: 'Table controls menu',
  a11yCodeLanguage: 'Code language selector',
}

export default en
