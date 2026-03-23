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
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
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
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `Rows ${from} to ${to} of ${filtered} of ${total}`
      : `Rows ${from} to ${to} of ${filtered}`,
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
    lineHeight: 'Line Height',
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
    tableActions: 'Table actions',
    insertRowAbove: 'Insert row above',
    insertRowBelow: 'Insert row below',
    insertColumnLeft: 'Insert column left',
    insertColumnRight: 'Insert column right',
    deleteRow: 'Delete row',
    deleteColumn: 'Delete column',
    deleteTable: 'Delete table',
  },
  // Data table
  dataTable: {
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    clearSort: 'Clear sort',
    filterPlaceholder: 'Filter...',
    clearFilter: 'Clear filter',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    selectedCount: (count: number) => `${count} selected`,
    resetAll: 'Reset all',
    noResults: 'No results found',
    loading: 'Loading...',
    // Filter panel
    filterPanelAddCondition: 'Add condition',
    filterPanelApply: 'Apply',
    filterPanelClear: 'Clear filters',
    filterPanelAnd: 'AND',
    filterPanelOr: 'OR',
    filterPanelContains: 'Contains',
    filterPanelNotContains: 'Does not contain',
    filterPanelEquals: 'Equals',
    filterPanelNotEquals: 'Does not equal',
    filterPanelStartsWith: 'Starts with',
    filterPanelEndsWith: 'Ends with',
    filterPanelIsNull: 'Is empty',
    filterPanelIsNotNull: 'Is not empty',
    filterPanelGt: 'Greater than',
    filterPanelGte: 'Greater or equal',
    filterPanelLt: 'Less than',
    filterPanelLte: 'Less or equal',
    filterPanelBetween: 'Between',
    filterPanelValuePlaceholder: 'Value...',
    sortMultiHint: 'Hold Shift to sort multiple columns',
    columnVisibility: 'Columns',
    showAllColumns: 'Show all',
    // Column header menu
    menuSortAsc: 'Sort Ascending',
    menuSortDesc: 'Sort Descending',
    menuClearSort: 'Clear Sort',
    menuHideColumn: 'Hide Column',
    menuChooseColumns: 'Choose Columns',
    menuResetColumns: 'Reset Columns',
    menuFilter: 'Filter',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Rows: ${filtered}  Total Rows: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Select values...',
    // Group by
    groupCount: (count: number) => `${count} items`,
    collapseGroup: 'Collapse group',
    expandGroup: 'Expand group',
    // Filter descriptions (for toolbar chips)
    describeFilter: {
      textContains: (col: string, val: string) => `${col} contains "${val}"`,
      textNotContains: (col: string, val: string) =>
        `${col} does not contain "${val}"`,
      textEquals: (col: string, val: string) => `${col} equals "${val}"`,
      textNotEquals: (col: string, val: string) =>
        `${col} does not equal "${val}"`,
      textStartsWith: (col: string, val: string) =>
        `${col} starts with "${val}"`,
      textEndsWith: (col: string, val: string) => `${col} ends with "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} between ${min} and ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} in [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} not in [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} is ${val}`,
      isNull: (col: string) => `${col} is empty`,
      isNotNull: (col: string) => `${col} is not empty`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' AND '),
      compositeOr: (descriptions: string[]) => descriptions.join(' OR '),
    },
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
  // Carousel
  carousel: {
    label: 'Carousel',
    previousSlide: 'Previous slide',
    nextSlide: 'Next slide',
    slideNavigation: 'Slide navigation',
    slideOfTotal: (index: number, total: number) =>
      `Slide ${index} of ${total}`,
    goToSlide: (index: number) => `Go to slide ${index}`,
  },
  // Date picker
  datePicker: {
    label: 'Date picker',
    previousYear: 'Previous year',
    previousMonth: 'Previous month',
    selectMonth: 'Select month',
    selectYear: 'Select year',
    nextMonth: 'Next month',
    nextYear: 'Next year',
    previousYears: (count: number) => `Previous ${count} years`,
    nextYears: (count: number) => `Next ${count} years`,
    dateRangePickerLabel: 'Date range picker',
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    shortMonthNames: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    dayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },
  // Time picker
  timePicker: {
    label: 'Time picker',
    hoursLabel: 'HH',
    minutesLabel: 'MM',
    secondsLabel: 'SS',
    selectHours: 'Select hours',
    selectMinutes: 'Select minutes',
    selectSeconds: 'Select seconds',
    selectPeriod: 'Select AM/PM',
    nowLabel: 'Now',
  },
  // Time select
  timeSelectTime: 'Select time',
  // Date time select
  dateTimeSelectDateTime: 'Select date and time',
  // Color picker
  colorPicker: {
    hue: 'Hue',
    saturation: 'Saturation',
    lightness: 'Lightness',
    alpha: 'Alpha',
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    hex: 'Hex',
    whiteness: 'Whiteness',
    blackness: 'Blackness',
    chroma: 'Chroma',
  },
  // Spotlight
  spotlight: {
    placeholder: 'Search...',
    noResults: 'No results found',
    recentItems: 'Recent',
    close: 'Close',
  },
  // Virtual list
  virtualList: {
    listLabel: 'Scrollable list',
  },
  // Stepper
  stepper: {
    step: 'Step',
    stepOfTotal: (current: number, total: number) =>
      `Step ${current} of ${total}`,
    completed: 'Completed',
    next: 'Next',
    previous: 'Previous',
    complete: 'Complete',
  },
  // Sortable list
  sortableList: {
    dragHandle: 'Drag to reorder',
  },
  // Transfer list
  transferList: {
    available: 'Available',
    selected: 'Selected',
    moveRight: 'Move to selected',
    moveLeft: 'Move to available',
    moveAllRight: 'Move all to selected',
    moveAllLeft: 'Move all to available',
    searchAvailable: 'Search available items…',
    searchSelected: 'Search selected items…',
  },
  // Copy button
  copyButton: {
    copied: 'Copied!',
    copyToClipboard: 'Copy to clipboard',
  },
  // Number stepper
  numberStepper: {
    increment: 'Increment',
    decrement: 'Decrement',
    value: 'Value',
  },
  // Stat card
  statCard: {
    trendUp: 'Trending up',
    trendDown: 'Trending down',
    trendFlat: 'No change',
  },
  // OTP input
  otpInputLabel: 'One-time password input',
  otpDigitLabel: (index: number, total: number) => `Digit ${index} of ${total}`,
  // Nine-slice scroll view
  scrollableGridView: 'Scrollable grid view',
  // Onboarding tour
  onboardingTour: {
    label: 'Guided tour',
    stepIndicator: (current: number, total: number) =>
      `Step ${current} of ${total}`,
    skip: 'Skip',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
  },
  // Combobox
  searchPlaceholder: 'Search',
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
