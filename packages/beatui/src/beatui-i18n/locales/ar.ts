import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const ar: BeatUIMessages = {
  loadingExtended: 'جاري التحميل، يرجى الانتظار',
  loadingShort: 'جاري التحميل...',
  locale: 'اللغة',
  iconDescription: 'أيقونة',
  loadingIcon: 'أيقونة التحميل',
  failedToLoadIcon: 'فشل في تحميل الأيقونة',
  editLabel: 'تحرير',
  selectOne: 'اختر واحد',
  selectNone: 'لا شيء',
  selectMany: 'اختر عدة',
  noResults: 'لا نتائج',
  passwordPlaceholderText: 'كلمة المرور السرية',
  togglePasswordVisibility: 'إظهار/إخفاء كلمة المرور',
  toggleMenu: 'تبديل القائمة',
  toggleAside: 'تبديل اللوحة الجانبية',
  mainNavigation: 'القائمة الرئيسية',
  sidebar: 'الشريط الجانبي',
  closeDrawer: 'إغلاق الدرج',
  closeModal: 'إغلاق النافذة المنبثقة',
  confirm: 'تأكيد',
  cancel: 'إلغاء',
  addLabel: 'إضافة',
  removeItem: 'إزالة العنصر',
  // languages
  currentLocale: 'العربية',
  ar: 'العربية',
  de: 'الألمانية',
  en: 'الإنجليزية',
  es: 'الأسبانية',
  fr: 'الفرنسية',
  hi: 'الهندية',
  it: 'الإيطالية',
  ja: 'اليابانية',
  ko: 'الكورية',
  nl: 'الهولندية',
  pl: 'البولندية',
  pt: 'البرتغالية',
  ru: 'الروسية',
  tr: 'التركية',
  vi: 'الفيتنامية',
  zh: 'الصينية',
  he: 'العبرية',
  fa: 'الفارسية',
  ur: 'الأردية',
  // input
  emailPlaceholderText: 'بريدك الإلكتروني',
  incrementValue: 'زيادة القيمة',
  decrementValue: 'تقليل القيمة',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'انقر للاختيار أو اسحب الملفات هنا، أو اضغط Enter أو Space لفتح محدد الملفات'
      : 'اسحب الملفات هنا',
  // size
  fileSizeUnits: ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب'],
  // file input
  removeFile: 'إزالة الملف',
  clearAllFiles: 'مسح كل الملفات',
  // inputs reset
  clearValue: 'مسح القيمة',
  unknownType: 'نوع غير معروف',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'انقر للاختيار أو اسحب الملفات هنا'
        : 'انقر للاختيار أو اسحب ملف هنا'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`حتى ${maxFiles} ملفات`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`حد أقصى ${formattedSize} لكل ملف`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join('، ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'ترقيم الصفحات',
  firstPage: 'الصفحة الأولى',
  previousPage: 'الصفحة السابقة',
  nextPage: 'الصفحة التالية',
  lastPage: 'الصفحة الأخيرة',
  // Breadcrumbs
  breadcrumbs: 'مسار التنقل',
  // Command palette
  commandPalette: 'لوحة الأوامر',
  typeACommand: 'اكتب أمراً...',
  noResultsFound: 'لم يتم العثور على نتائج',
  noMatchingCommands: 'لا توجد أوامر مطابقة',
  // Appearance
  appearanceSystem: 'النظام',
  appearanceLight: 'فاتح',
  appearanceDark: 'داكن',
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
  pdfPreview: 'معاينة PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'نوع الخط',
    fontSize: 'حجم الخط',
    fontColor: 'لون الخط',
    highlightColor: 'لون التمييز',
    backgroundColor: 'لون الخلفية',
    bold: 'غامق',
    italic: 'مائل',
    underline: 'تسطير',
    strikethrough: 'يتوسطه خط',
    code: 'رمز',
    clearFormatting: 'مسح التنسيق',
    normal: 'عادي',
    heading: (level: number) => `عنوان ${level}`,
    bulletList: 'قائمة نقطية',
    orderedList: 'قائمة مرقمة',
    checkList: 'قائمة مهام',
    indent: 'مسافة بادئة',
    outdent: 'إزالة المسافة البادئة',
    blockquote: 'اقتباس',
    codeBlock: 'كتلة رمز',
    horizontalRule: 'خط أفقي',
    insertTable: 'إدراج جدول',
    link: 'رابط',
    undo: 'تراجع',
    redo: 'إعادة',
    cut: 'قص',
    copy: 'نسخ',
    paste: 'لصق',
    defaultOption: 'افتراضي',
    slashCommands: 'أوامر الشرطة المائلة',
    noCommandsFound: 'لم يتم العثور على أوامر',
    changeBlockType: 'تغيير نوع الكتلة',
    blockTypes: 'أنواع الكتل',
    enterUrl: 'أدخل الرابط:',
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

export default ar
