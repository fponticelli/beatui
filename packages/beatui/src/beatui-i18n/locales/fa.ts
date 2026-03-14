import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const fa: BeatUIMessages = {
  loadingExtended: 'در حال بارگذاری، لطفاً صبر کنید',
  loadingShort: 'در حال بارگذاری...',
  locale: 'زبان',
  iconDescription: 'نماد',
  loadingIcon: 'نماد بارگذاری',
  failedToLoadIcon: 'بارگذاری نماد ناموفق بود',
  editLabel: 'ویرایش',
  selectOne: 'یکی را انتخاب کنید',
  selectNone: 'هیچکدام',
  selectMany: 'چند مورد را انتخاب کنید',
  noResults: 'بدون نتیجه',
  passwordPlaceholderText: 'رمز عبور محرمانه',
  togglePasswordVisibility: 'نمایش/مخفی کردن رمز عبور',
  toggleMenu: 'نمایش/مخفی کردن منو',
  toggleAside: 'نمایش/مخفی کردن پانل کناری',
  mainNavigation: 'ناوبری اصلی',
  sidebar: 'نوار کناری',
  closeDrawer: 'بستن کشو',
  closeModal: 'بستن پنجره',
  confirm: 'تأیید',
  cancel: 'لغو',
  addLabel: 'افزودن',
  removeItem: 'حذف مورد',
  // languages
  currentLocale: 'فارسی',
  ar: 'عربی',
  de: 'آلمانی',
  en: 'انگلیسی',
  es: 'اسپانیایی',
  fr: 'فرانسوی',
  he: 'عبری',
  hi: 'هندی',
  it: 'ایتالیایی',
  ja: 'ژاپنی',
  ko: 'کره‌ای',
  nl: 'هلندی',
  pl: 'لهستانی',
  pt: 'پرتغالی',
  ru: 'روسی',
  tr: 'ترکی',
  vi: 'ویتنامی',
  zh: 'چینی',
  fa: 'فارسی',
  ur: 'اردو',
  // input
  emailPlaceholderText: 'ایمیل خود را وارد کنید',
  incrementValue: 'افزایش مقدار',
  decrementValue: 'کاهش مقدار',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'برای انتخاب کلیک کنید یا فایل‌ها را بکشید، یا Enter یا Space را فشار دهید تا انتخابگر فایل باز شود'
      : 'فایل‌ها را بکشید',
  // size
  fileSizeUnits: ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'],
  // file input
  removeFile: 'حذف فایل',
  clearAllFiles: 'حذف همه فایل‌ها',
  // inputs reset
  clearValue: 'حذف مقدار',
  unknownType: 'نوع ناشناخته',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'برای انتخاب کلیک کنید یا فایل‌ها را بکشید'
        : 'برای انتخاب کلیک کنید یا فایل را بکشید'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`تا ${maxFiles} فایل`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`حداکثر ${formattedSize} هر کدام`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join('، ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'صفحه‌بندی',
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `ردیف‌های ${from} تا ${to} از ${filtered} از ${total}`
      : `ردیف‌های ${from} تا ${to} از ${filtered}`,
  firstPage: 'صفحه اول',
  previousPage: 'صفحه قبلی',
  nextPage: 'صفحه بعدی',
  lastPage: 'صفحه آخر',
  // Breadcrumbs
  breadcrumbs: 'مسیر ناوبری',
  // Command palette
  commandPalette: 'پالت فرمان',
  typeACommand: 'یک فرمان تایپ کنید...',
  noResultsFound: 'نتیجه‌ای یافت نشد',
  noMatchingCommands: 'فرمان منطبقی یافت نشد',
  // Appearance
  appearanceSystem: 'سیستم',
  appearanceLight: 'روشن',
  appearanceDark: 'تاریک',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation: 'تغییر نوع مقدار فعلی را پاک می‌کند. ادامه می‌دهید؟',
  // Notifications
  notifications: 'اعلان‌ها',
  markAllAsRead: 'علامت‌گذاری همه به عنوان خوانده‌شده',
  noNotifications: 'اعلانی وجود ندارد',
  // JSON Schema
  schemaConflictsDetected: 'تعارض‌های طرحواره شناسایی شد',
  schemaViolationsDetected: 'نقض‌های طرحواره شناسایی شد',
  properties: 'ویژگی‌ها',
  // File upload
  uploading: 'در حال بارگذاری...',
  dropFilesOrBrowse: 'فایل‌ها را اینجا رها کنید یا برای مرور کلیک کنید',
  acceptedTypes: (types: string) => `انواع مجاز: ${types}`,
  // Rich text
  enterUrlPrompt: 'آدرس URL را وارد کنید:',
  exceeded: '(بیش از حد)',
  // PDF
  pdfPreview: 'پیش‌نمایش PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'خانواده فونت',
    fontSize: 'اندازه فونت',
    lineHeight: 'ارتفاع خط',
    fontColor: 'رنگ فونت',
    highlightColor: 'رنگ هایلایت',
    backgroundColor: 'رنگ پس‌زمینه',
    bold: 'درشت',
    italic: 'کج',
    underline: 'زیرخط',
    strikethrough: 'خط‌خورده',
    code: 'کد',
    clearFormatting: 'پاک کردن قالب‌بندی',
    normal: 'عادی',
    heading: (level: number) => `سرتیتر ${level}`,
    bulletList: 'فهرست نقطه‌ای',
    orderedList: 'فهرست شماره‌دار',
    checkList: 'فهرست چک‌باکس',
    indent: 'تورفتگی',
    outdent: 'کاهش تورفتگی',
    blockquote: 'نقل‌قول',
    codeBlock: 'بلوک کد',
    horizontalRule: 'خط افقی',
    insertTable: 'درج جدول',
    link: 'پیوند',
    undo: 'واگرد',
    redo: 'ازنو',
    cut: 'برش',
    copy: 'کپی',
    paste: 'چسباندن',
    defaultOption: 'پیش‌فرض',
    slashCommands: 'فرمان‌های اسلش',
    noCommandsFound: 'فرمانی یافت نشد',
    changeBlockType: 'تغییر نوع بلوک',
    blockTypes: 'انواع بلوک',
    enterUrl: 'آدرس URL را وارد کنید:',
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
    sortAscending: 'مرتب‌سازی صعودی',
    sortDescending: 'مرتب‌سازی نزولی',
    clearSort: 'پاک کردن مرتب‌سازی',
    filterPlaceholder: 'فیلتر...',
    clearFilter: 'پاک کردن فیلتر',
    selectAll: 'انتخاب همه',
    deselectAll: 'لغو انتخاب همه',
    selectedCount: (count: number) => `${count} انتخاب شده`,
    resetAll: 'بازنشانی همه',
    noResults: 'نتیجه‌ای یافت نشد',
    loading: 'در حال بارگذاری...',
    // Filter panel
    filterPanelAddCondition: 'افزودن شرط',
    filterPanelApply: 'اعمال',
    filterPanelClear: 'پاک کردن فیلترها',
    filterPanelAnd: 'و',
    filterPanelOr: 'یا',
    filterPanelContains: 'شامل می‌شود',
    filterPanelNotContains: 'شامل نمی‌شود',
    filterPanelEquals: 'برابر است با',
    filterPanelNotEquals: 'برابر نیست با',
    filterPanelStartsWith: 'شروع می‌شود با',
    filterPanelEndsWith: 'پایان می‌یابد با',
    filterPanelIsNull: 'خالی است',
    filterPanelIsNotNull: 'خالی نیست',
    filterPanelGt: 'بزرگتر از',
    filterPanelGte: 'بزرگتر یا مساوی',
    filterPanelLt: 'کوچکتر از',
    filterPanelLte: 'کوچکتر یا مساوی',
    filterPanelBetween: 'بین',
    filterPanelValuePlaceholder: 'مقدار...',
    sortMultiHint: 'برای مرتب‌سازی چند ستون، Shift را نگه دارید',
    columnVisibility: 'ستون‌ها',
    showAllColumns: 'نمایش همه',
    // Column header menu
    menuSortAsc: 'مرتب‌سازی صعودی',
    menuSortDesc: 'مرتب‌سازی نزولی',
    menuClearSort: 'حذف مرتب‌سازی',
    menuHideColumn: 'پنهان کردن ستون',
    menuChooseColumns: 'انتخاب ستون‌ها',
    menuResetColumns: 'بازنشانی ستون‌ها',
    menuFilter: 'فیلتر',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `ردیف‌ها: ${filtered}  کل ردیف‌ها: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'انتخاب مقادیر...',
    // Group by
    groupCount: (count: number) => `${count} مورد`,
    collapseGroup: 'جمع کردن گروه',
    expandGroup: 'بسط دادن گروه',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} شامل "${val}"`,
      textNotContains: (col: string, val: string) =>
        `${col} شامل نیست "${val}"`,
      textEquals: (col: string, val: string) => `${col} برابر با "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} نابرابر با "${val}"`,
      textStartsWith: (col: string, val: string) => `${col} شروع با "${val}"`,
      textEndsWith: (col: string, val: string) => `${col} پایان با "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} بین ${min} و ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} در [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} نه در [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} است ${val}`,
      isNull: (col: string) => `${col} خالی است`,
      isNotNull: (col: string) => `${col} خالی نیست`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' و '),
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

export default fa
