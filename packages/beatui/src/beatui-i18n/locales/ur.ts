import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const ur: BeatUIMessages = {
  loadingExtended: 'لوڈ ہو رہا ہے، براہ کرم انتظار کریں',
  loadingShort: 'لوڈ ہو رہا ہے...',
  locale: 'زبان',
  iconDescription: 'آئیکن',
  loadingIcon: 'لوڈنگ آئیکن',
  failedToLoadIcon: 'آئیکن لوڈ کرنے میں ناکام',
  editLabel: 'ترمیم',
  selectOne: 'ایک منتخب کریں',
  selectNone: 'کوئی نہیں',
  selectMany: 'متعدد منتخب کریں',
  noResults: 'کوئی نتیجہ نہیں',
  passwordPlaceholderText: 'خفیہ پاس ورڈ',
  togglePasswordVisibility: 'پاس ورڈ کی مرئیت تبدیل کریں',
  toggleMenu: 'مینو ٹوگل کریں',
  toggleAside: 'سائیڈ پینل ٹوگل کریں',
  mainNavigation: 'بنیادی نیویگیشن',
  sidebar: 'سائیڈ بار',
  closeDrawer: 'دراز بند کریں',
  closeModal: 'ماڈل بند کریں',
  confirm: 'تصدیق',
  cancel: 'منسوخ',
  addLabel: 'شامل کریں',
  removeItem: 'آئٹم ہٹائیں',
  // languages
  currentLocale: 'اردو',
  ar: 'عربی',
  de: 'جرمن',
  en: 'انگریزی',
  es: 'ہسپانوی',
  fr: 'فرانسیسی',
  he: 'عبرانی',
  hi: 'ہندی',
  it: 'اطالوی',
  ja: 'جاپانی',
  ko: 'کوریائی',
  nl: 'ڈچ',
  pl: 'پولش',
  pt: 'پرتگالی',
  ru: 'روسی',
  tr: 'ترکی',
  vi: 'ویتنامی',
  zh: 'چینی',
  fa: 'فارسی',
  ur: 'اردو',
  // input
  emailPlaceholderText: 'اپنا ای میل داخل کریں',
  incrementValue: 'قدر اضافہ کریں',
  decrementValue: 'قدر کم کریں',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'منتخب کرنے کے لیے کلک کریں یا فائلیں یہاں گھسیٹیں، یا فائل منتخب کرنے کے لیے Enter یا Space دبائیں'
      : 'فائلیں یہاں گھسیٹیں',
  // size
  fileSizeUnits: ['بائٹس', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'فائل حذف کریں',
  clearAllFiles: 'تمام فائلیں صاف کریں',
  // inputs reset
  clearValue: 'قدر صاف کریں',
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
  unknownType: 'نامعلوم قسم',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'منتخب کرنے کے لیے کلک کریں یا فائلیں یہاں گھسیٹیں'
        : 'منتخب کرنے کے لیے کلک کریں یا فائل یہاں گھسیٹیں'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`زیادہ سے زیادہ ${maxFiles} فائلیں`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`ہر ایک زیادہ سے زیادہ ${formattedSize}`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join('، ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'صفحہ بندی',
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `قطاریں ${from} سے ${to} تک، ${filtered} میں سے ${total} میں سے`
      : `قطاریں ${from} سے ${to} تک، ${filtered} میں سے`,
  firstPage: 'پہلا صفحہ',
  previousPage: 'پچھلا صفحہ',
  nextPage: 'اگلا صفحہ',
  lastPage: 'آخری صفحہ',
  // Breadcrumbs
  breadcrumbs: 'بریڈ کرمبز',
  // Command palette
  commandPalette: 'کمانڈ پیلیٹ',
  typeACommand: 'کمانڈ ٹائپ کریں...',
  noResultsFound: 'کوئی نتیجہ نہیں ملا',
  noMatchingCommands: 'کوئی مماثل کمانڈ نہیں ملی',
  // Appearance
  appearanceSystem: 'سسٹم',
  appearanceLight: 'ہلکا',
  appearanceDark: 'گہرا',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    'قسم تبدیل کرنے سے موجودہ قدر صاف ہو جائے گی۔ جاری رکھیں؟',
  // Notifications
  notifications: 'اطلاعات',
  markAllAsRead: 'سب کو پڑھا ہوا نشان زد کریں',
  noNotifications: 'کوئی اطلاع نہیں',
  // JSON Schema
  schemaConflictsDetected: 'اسکیما تنازعات کا پتا چلا',
  schemaViolationsDetected: 'اسکیما خلاف ورزیوں کا پتا چلا',
  properties: 'خصوصیات',
  // File upload
  uploading: 'اپ لوڈ ہو رہا ہے...',
  dropFilesOrBrowse: 'فائلیں یہاں چھوڑیں یا براؤز کرنے کے لیے کلک کریں',
  acceptedTypes: (types: string) => `قابل قبول اقسام: ${types}`,
  // Rich text
  enterUrlPrompt: 'URL درج کریں:',
  exceeded: '(حد سے تجاوز)',
  // PDF
  pdfPreview: 'PDF پیش نظارہ',
  // Lexical editor
  lexical: {
    fontFamily: 'فونٹ فیملی',
    fontSize: 'فونٹ سائز',
    lineHeight: 'لائن کی اونچائی',
    fontColor: 'فونٹ رنگ',
    highlightColor: 'ہائی لائٹ رنگ',
    backgroundColor: 'پس منظر رنگ',
    bold: 'بولڈ',
    italic: 'ترچھا',
    underline: 'خط کشیدہ',
    strikethrough: 'کٹا ہوا',
    code: 'کوڈ',
    clearFormatting: 'فارمیٹنگ صاف کریں',
    normal: 'عام',
    heading: (level: number) => `سرخی ${level}`,
    bulletList: 'بلٹ فہرست',
    orderedList: 'نمبر شدہ فہرست',
    checkList: 'چیک فہرست',
    indent: 'اندر کریں',
    outdent: 'باہر کریں',
    blockquote: 'اقتباس',
    codeBlock: 'کوڈ بلاک',
    horizontalRule: 'افقی لکیر',
    insertTable: 'ٹیبل داخل کریں',
    link: 'لنک',
    undo: 'واپس',
    redo: 'دوبارہ',
    cut: 'کاٹیں',
    copy: 'نقل',
    paste: 'چسپاں',
    defaultOption: 'پہلے سے طے شدہ',
    slashCommands: 'سلیش کمانڈز',
    noCommandsFound: 'کوئی کمانڈ نہیں ملی',
    changeBlockType: 'بلاک کی قسم تبدیل کریں',
    blockTypes: 'بلاک کی اقسام',
    enterUrl: 'URL درج کریں:',
    tableActions: 'Table actions',
    insertRowAbove: 'Insert row above',
    insertRowBelow: 'Insert row below',
    insertColumnLeft: 'Insert column left',
    insertColumnRight: 'Insert column right',
    deleteRow: 'Delete row',
    deleteColumn: 'Delete column',
    deleteTable: 'Delete table',
  },
  // prosemirror
  dataTable: {
    sortAscending: 'صعودی ترتیب',
    sortDescending: 'نزولی ترتیب',
    clearSort: 'ترتیب صاف کریں',
    filterPlaceholder: 'فلٹر...',
    clearFilter: 'فلٹر صاف کریں',
    selectAll: 'سب منتخب کریں',
    deselectAll: 'سب غیر منتخب کریں',
    selectedCount: (count: number) => `${count} منتخب`,
    resetAll: 'سب ری سیٹ کریں',
    noResults: 'کوئی نتائج نہیں ملے',
    loading: 'لوڈ ہو رہا ہے...',
    // Filter panel
    filterPanelAddCondition: 'شرط شامل کریں',
    filterPanelApply: 'لاگو کریں',
    filterPanelClear: 'فلٹرز صاف کریں',
    filterPanelAnd: 'اور',
    filterPanelOr: 'یا',
    filterPanelContains: 'شامل ہے',
    filterPanelNotContains: 'شامل نہیں ہے',
    filterPanelEquals: 'برابر ہے',
    filterPanelNotEquals: 'برابر نہیں ہے',
    filterPanelStartsWith: 'سے شروع ہوتا ہے',
    filterPanelEndsWith: 'پر ختم ہوتا ہے',
    filterPanelIsNull: 'خالی ہے',
    filterPanelIsNotNull: 'خالی نہیں ہے',
    filterPanelGt: 'سے بڑا',
    filterPanelGte: 'سے بڑا یا برابر',
    filterPanelLt: 'سے چھوٹا',
    filterPanelLte: 'سے چھوٹا یا برابر',
    filterPanelBetween: 'کے درمیان',
    filterPanelValuePlaceholder: 'قدر...',
    sortMultiHint: 'متعدد کالموں کو ترتیب دینے کے لیے Shift دبائیں',
    columnVisibility: 'کالم',
    showAllColumns: 'سب دکھائیں',
    // Column header menu
    menuSortAsc: 'صعودی ترتیب',
    menuSortDesc: 'نزولی ترتیب',
    menuClearSort: 'ترتیب ہٹائیں',
    menuHideColumn: 'کالم چھپائیں',
    menuChooseColumns: 'کالم منتخب کریں',
    menuResetColumns: 'کالم ری سیٹ کریں',
    menuFilter: 'فلٹر',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `قطاریں: ${filtered}  کل قطاریں: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'قدریں منتخب کریں...',
    // Group by
    groupCount: (count: number) => `${count} آئٹم`,
    collapseGroup: 'گروپ سکیڑیں',
    expandGroup: 'گروپ پھیلائیں',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} "${val}" پر مشتمل`,
      textNotContains: (col: string, val: string) =>
        `${col} "${val}" پر مشتمل نہیں`,
      textEquals: (col: string, val: string) => `${col} "${val}" کے برابر`,
      textNotEquals: (col: string, val: string) =>
        `${col} "${val}" کے برابر نہیں`,
      textStartsWith: (col: string, val: string) =>
        `${col} "${val}" سے شروع ہوتا ہے`,
      textEndsWith: (col: string, val: string) =>
        `${col} "${val}" پر ختم ہوتا ہے`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} ${min} اور ${max} کے درمیان`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} [${vals}] میں`,
      setNotIn: (col: string, vals: string) => `${col} [${vals}] میں نہیں`,
      booleanIs: (col: string, val: string) => `${col} ${val} ہے`,
      isNull: (col: string) => `${col} خالی ہے`,
      isNotNull: (col: string) => `${col} خالی نہیں ہے`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' اور '),
      compositeOr: (descriptions: string[]) => descriptions.join(' یا '),
    },
  },
  prosemirror: {
    bold: 'Bold',
    italic: 'Italic',
    code: 'Code',
    link: 'Link',
    removeLink: 'Remove Link',
    heading: (level: number) => `Heading ${level}`,
    bulletList: 'Bullet List',
    orderedList: 'Ordered List',
    blockquote: 'Blockquote',
    codeBlock: 'Code Block',
    horizontalRule: 'Horizontal Rule',
    linkUrlPlaceholder: 'https://example.com',
  },
  // Carousel
  carousel: {
    label: 'کیروسیل',
    previousSlide: 'پچھلی سلائیڈ',
    nextSlide: 'اگلی سلائیڈ',
    slideNavigation: 'سلائیڈ نیویگیشن',
    slideOfTotal: (index: number, total: number) =>
      `سلائیڈ ${index} از ${total}`,
    goToSlide: (index: number) => `سلائیڈ ${index} پر جائیں`,
  },
  // Date picker
  datePicker: {
    label: 'تاریخ منتخب کریں',
    previousYear: 'پچھلا سال',
    previousMonth: 'پچھلا مہینہ',
    selectMonth: 'مہینہ منتخب کریں',
    selectYear: 'سال منتخب کریں',
    nextMonth: 'اگلا مہینہ',
    nextYear: 'اگلا سال',
    previousYears: (count: number) => `پچھلے ${count} سال`,
    nextYears: (count: number) => `اگلے ${count} سال`,
    dateRangePickerLabel: 'تاریخ کی حد منتخب کریں',
    monthNames: [
      'جنوری',
      'فروری',
      'مارچ',
      'اپریل',
      'مئی',
      'جون',
      'جولائی',
      'اگست',
      'ستمبر',
      'اکتوبر',
      'نومبر',
      'دسمبر',
    ],
    shortMonthNames: [
      'جنو',
      'فرو',
      'مار',
      'اپر',
      'مئی',
      'جون',
      'جول',
      'اگس',
      'ستم',
      'اکت',
      'نوم',
      'دسم',
    ],
    dayNames: ['اتو', 'پیر', 'منگ', 'بدھ', 'جمع', 'جمعہ', 'ہفت'],
  },
  // OTP input
  otpInputLabel: 'ایک بار کا پاس ورڈ درج کریں',
  otpDigitLabel: (index: number, total: number) => `ہندسہ ${index} از ${total}`,
  // Nine-slice scroll view
  scrollableGridView: 'سکرول ایبل گرڈ ویو',
  // Onboarding tour
  onboardingTour: {
    label: 'رہنمائی ٹور',
    stepIndicator: (current: number, total: number) =>
      `مرحلہ ${current} از ${total}`,
    skip: 'چھوڑیں',
    previous: 'پچھلا',
    next: 'اگلا',
    finish: 'مکمل',
  },
  // Combobox
  searchPlaceholder: 'تلاش کریں',
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

export default ur
