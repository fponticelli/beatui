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
  },
  // prosemirror
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
