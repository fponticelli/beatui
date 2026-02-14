import { formatFileSize } from '../../utils'

const en = {
  loadingExtended: 'Loading, please wait',
  loadingShort: 'Loading...',
  locale: 'Locale',
  iconDescription: 'Icon',
  loadingIcon: 'Loading icon',
  failedToLoadIcon: 'Failed to load icon',
  editLabel: 'Edit',
  selectOne: 'Select one',
  selectNone: 'None',
  selectMany: 'Select many',
  noResults: 'No results',
  passwordPlaceholderText: 'Secret Password',
  togglePasswordVisibility: 'Toggle password visibility',
  toggleMenu: 'Toggle menu',
  toggleAside: 'Toggle aside',
  mainNavigation: 'Main navigation',
  sidebar: 'Sidebar',
  closeDrawer: 'Close drawer',
  closeModal: 'Close modal',
  confirm: 'Confirm',
  cancel: 'Cancel',
  addLabel: 'Add',
  removeItem: 'Remove item',
  // languages
  currentLocale: 'English',
  ar: 'Arabic',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  nl: 'Dutch',
  pl: 'Polish',
  pt: 'Portuguese',
  ru: 'Russian',
  tr: 'Turkish',
  vi: 'Vietnamese',
  zh: 'Chinese',
  he: 'Hebrew',
  fa: 'Persian',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'Enter your email',
  incrementValue: 'Increment value',
  decrementValue: 'Decrement value',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean): string =>
    clickEnabled
      ? 'Click to choose or drag files here, or press Enter or Space to open file selector'
      : 'Drag files here',
  // size
  fileSizeUnits: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Remove file',
  clearAllFiles: 'Clear all files',
  // inputs reset
  clearValue: 'Reset',
  unknownType: 'Unknown type',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Click to choose or drag files here'
        : 'Click to choose or drag a file here'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`up to ${maxFiles} files`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`max ${formattedSize} each`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Pagination',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  // Breadcrumbs
  breadcrumbs: 'Breadcrumbs',
  // Command palette
  commandPalette: 'Command palette',
  typeACommand: 'Type a command...',
  noResultsFound: 'No results found',
  noMatchingCommands: 'No matching commands',
  // Appearance
  appearanceSystem: 'System',
  appearanceLight: 'Light',
  appearanceDark: 'Dark',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    'Changing type will clear the current value. Continue?',
  // Notifications
  notifications: 'Notifications',
  markAllAsRead: 'Mark all as read',
  noNotifications: 'No notifications',
  // JSON Schema
  schemaConflictsDetected: 'Schema Conflicts Detected',
  schemaViolationsDetected: 'Schema Violations Detected',
  properties: 'Properties',
  // File upload
  uploading: 'Uploading...',
  dropFilesOrBrowse: 'Drop files here or click to browse',
  acceptedTypes: (types: string) => `Accepted types: ${types}`,
  // Rich text
  enterUrlPrompt: 'Enter URL:',
  exceeded: '(exceeded)',
  // PDF
  pdfPreview: 'PDF Preview',
  // Lexical editor
  lexical: {
    fontFamily: 'Font Family',
    fontSize: 'Font Size',
    fontColor: 'Font Color',
    highlightColor: 'Highlight Color',
    backgroundColor: 'Background Color',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    code: 'Code',
    clearFormatting: 'Clear Formatting',
    normal: 'Normal',
    heading: (level: number) => `Heading ${level}`,
    bulletList: 'Bullet List',
    orderedList: 'Ordered List',
    checkList: 'Check List',
    indent: 'Indent',
    outdent: 'Outdent',
    blockquote: 'Blockquote',
    codeBlock: 'Code Block',
    horizontalRule: 'Horizontal Rule',
    insertTable: 'Insert Table',
    link: 'Link',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    defaultOption: 'Default',
    slashCommands: 'Slash commands',
    noCommandsFound: 'No commands found',
    changeBlockType: 'Change block type',
    blockTypes: 'Block types',
    enterUrl: 'Enter URL:',
  },
  // ProseMirror editor
  prosemirror: {
    bold: 'Bold',
    italic: 'Italic',
    code: 'Inline code',
    link: 'Insert link',
    removeLink: 'Remove link',
    heading: (level: number) => `Heading ${level}`,
    bulletList: 'Bullet list',
    orderedList: 'Ordered list',
    blockquote: 'Blockquote',
    codeBlock: 'Code block',
    horizontalRule: 'Horizontal rule',
    linkUrlPlaceholder: 'https://example.com',
  },
  // PDF Page Viewer
  pdfPageViewer: {
    loading: 'Loading PDF...',
    loadFailed: 'Failed to load PDF',
    invalidPdf: 'Invalid PDF file',
    pageOutOfRange: (page: number, total: number) =>
      `Page ${page} is out of range (1-${total})`,
    renderFailed: 'Failed to render PDF page',
  },
}

export default en
