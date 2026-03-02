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
    'سيؤدي تغيير النوع إلى مسح القيمة الحالية. هل تريد المتابعة؟',
  // Notifications
  notifications: 'الإشعارات',
  markAllAsRead: 'تحديد الكل كمقروء',
  noNotifications: 'لا توجد إشعارات',
  // JSON Schema
  schemaConflictsDetected: 'تم اكتشاف تعارضات في المخطط',
  schemaViolationsDetected: 'تم اكتشاف انتهاكات في المخطط',
  properties: 'الخصائص',
  // File upload
  uploading: 'جاري الرفع...',
  dropFilesOrBrowse: 'أسقط الملفات هنا أو انقر للتصفح',
  acceptedTypes: (types: string) => `الأنواع المقبولة: ${types}`,
  // Rich text
  enterUrlPrompt: 'أدخل الرابط:',
  exceeded: '(تم التجاوز)',
  // PDF
  pdfPreview: 'معاينة PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'نوع الخط',
    fontSize: 'حجم الخط',
    lineHeight: 'ارتفاع السطر',
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
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    clearSort: 'Clear sort',
    filterPlaceholder: 'Filter...',
    clearFilter: 'Clear filter',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    selectedCount: '{count} selected',
    resetAll: 'Reset all',
    noResults: 'No results found',
    loading: 'Loading...',
    // Filter panel
    filterPanelAddCondition: 'إضافة شرط',
    filterPanelApply: 'تطبيق',
    filterPanelClear: 'مسح الفلاتر',
    filterPanelAnd: 'و',
    filterPanelOr: 'أو',
    filterPanelContains: 'يحتوي على',
    filterPanelNotContains: 'لا يحتوي على',
    filterPanelEquals: 'يساوي',
    filterPanelNotEquals: 'لا يساوي',
    filterPanelStartsWith: 'يبدأ بـ',
    filterPanelEndsWith: 'ينتهي بـ',
    filterPanelIsNull: 'فارغ',
    filterPanelIsNotNull: 'غير فارغ',
    filterPanelGt: 'أكبر من',
    filterPanelGte: 'أكبر من أو يساوي',
    filterPanelLt: 'أقل من',
    filterPanelLte: 'أقل من أو يساوي',
    filterPanelBetween: 'بين',
    filterPanelValuePlaceholder: 'القيمة...',
    sortMultiHint: 'اضغط Shift للترتيب حسب أعمدة متعددة',
    columnVisibility: 'الأعمدة',
    showAllColumns: 'إظهار الكل',
    // Column header menu
    menuSortAsc: 'ترتيب تصاعدي',
    menuSortDesc: 'ترتيب تنازلي',
    menuClearSort: 'مسح الترتيب',
    menuHideColumn: 'إخفاء العمود',
    menuChooseColumns: 'اختيار الأعمدة',
    menuResetColumns: 'إعادة تعيين الأعمدة',
    menuFilter: 'تصفية',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `الصفوف: ${filtered}  إجمالي الصفوف: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'اختر القيم...',
    // Group by
    groupCount: (count: number) => `${count} عناصر`,
    collapseGroup: 'طي المجموعة',
    expandGroup: 'توسيع المجموعة',
    // Aggregation labels
    aggregationSum: 'المجموع',
    aggregationCount: 'العدد',
    aggregationAvg: 'المتوسط',
    aggregationMin: 'الحد الأدنى',
    aggregationMax: 'الحد الأقصى',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} يحتوي على "${val}"`,
      textNotContains: (col: string, val: string) => `${col} لا يحتوي على "${val}"`,
      textEquals: (col: string, val: string) => `${col} يساوي "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} لا يساوي "${val}"`,
      textStartsWith: (col: string, val: string) => `${col} يبدأ بـ "${val}"`,
      textEndsWith: (col: string, val: string) => `${col} ينتهي بـ "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) => `${col} بين ${min} و ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} ضمن [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} ليس ضمن [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} هو ${val}`,
      isNull: (col: string) => `${col} فارغ`,
      isNotNull: (col: string) => `${col} ليس فارغاً`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' و '),
      compositeOr: (descriptions: string[]) => descriptions.join(' أو '),
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

export default ar
