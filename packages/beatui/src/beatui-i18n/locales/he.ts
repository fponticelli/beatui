import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const he: BeatUIMessages = {
  loadingExtended: 'טוען, אנא המתן',
  loadingShort: 'טוען...',
  locale: 'שפה',
  iconDescription: 'סמל',
  loadingIcon: 'סמל טעינה',
  failedToLoadIcon: 'נכשל בטעינת הסמל',
  editLabel: 'עריכה',
  selectOne: 'בחר אחד',
  selectNone: 'ללא',
  selectMany: 'בחר מספר',
  noResults: 'אין תוצאות',
  passwordPlaceholderText: 'סיסמה סודית',
  togglePasswordVisibility: 'הצג/הסתר סיסמה',
  toggleMenu: 'הצג/הסתר תפריט',
  toggleAside: 'הצג/הסתר פאנל צדדי',
  mainNavigation: 'ניווט ראשי',
  sidebar: 'סרגל צדדי',
  closeDrawer: 'סגור מגירה',
  closeModal: 'סגור חלון קופץ',
  confirm: 'אישור',
  cancel: 'ביטול',
  addLabel: 'הוסף',
  removeItem: 'הסר פריט',
  // languages
  currentLocale: 'עברית',
  ar: 'ערבית',
  de: 'גרמנית',
  en: 'אנגלית',
  es: 'ספרדית',
  fr: 'צרפתית',
  he: 'עברית',
  hi: 'הינדי',
  it: 'איטלקית',
  ja: 'יפנית',
  ko: 'קוריאנית',
  nl: 'הולנדית',
  pl: 'פולנית',
  pt: 'פורטוגזית',
  ru: 'רוסית',
  tr: 'טורקית',
  vi: 'וייטנאמית',
  zh: 'סינית',
  fa: 'פרסית',
  ur: 'אורדו',
  // input
  emailPlaceholderText: 'הכנס את כתובת הדוא"ל',
  incrementValue: 'הגדלת ערך',
  decrementValue: 'הקטנת ערך',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'לחץ לבחירה או גרור קבצים כאן, או לחץ Enter או רווח לפתיחת בורר הקבצים'
      : 'גרור קבצים כאן',
  // size
  fileSizeUnits: ['בתים', 'ק״ב', 'מ״ב', 'ג״ב', 'ט״ב'],
  // file input
  removeFile: 'הסר קובץ',
  clearAllFiles: 'נקה את כל הקבצים',
  // inputs reset
  clearValue: 'נקה ערך',
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
  unknownType: 'סוג לא ידוע',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'לחץ לבחירה או גרור קבצים כאן'
        : 'לחץ לבחירה או גרור קובץ כאן'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`עד ${maxFiles} קבצים`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`מקסימום ${formattedSize} כל אחד`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'עימוד',
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `שורות ${from} עד ${to} מתוך ${filtered} מתוך ${total}`
      : `שורות ${from} עד ${to} מתוך ${filtered}`,
  firstPage: 'עמוד ראשון',
  previousPage: 'עמוד קודם',
  nextPage: 'עמוד הבא',
  lastPage: 'עמוד אחרון',
  // Breadcrumbs
  breadcrumbs: 'שבילי ניווט',
  // Command palette
  commandPalette: 'לוח פקודות',
  typeACommand: 'הקלד פקודה...',
  noResultsFound: 'לא נמצאו תוצאות',
  noMatchingCommands: 'לא נמצאו פקודות תואמות',
  // Appearance
  appearanceSystem: 'מערכת',
  appearanceLight: 'בהיר',
  appearanceDark: 'כהה',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation: 'שינוי הסוג ימחק את הערך הנוכחי. להמשיך?',
  // Notifications
  notifications: 'התראות',
  markAllAsRead: 'סמן הכל כנקרא',
  noNotifications: 'אין התראות',
  // JSON Schema
  schemaConflictsDetected: 'זוהו התנגשויות בסכמה',
  schemaViolationsDetected: 'זוהו הפרות סכמה',
  properties: 'מאפיינים',
  // File upload
  uploading: 'מעלה...',
  dropFilesOrBrowse: 'גרור קבצים לכאן או לחץ לעיון',
  acceptedTypes: (types: string) => `סוגים מותרים: ${types}`,
  // Rich text
  enterUrlPrompt: 'הכנס כתובת URL:',
  exceeded: '(חורג)',
  // PDF
  pdfPreview: 'תצוגה מקדימה של PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'משפחת גופן',
    fontSize: 'גודל גופן',
    lineHeight: 'גובה שורה',
    fontColor: 'צבע גופן',
    highlightColor: 'צבע הדגשה',
    backgroundColor: 'צבע רקע',
    bold: 'מודגש',
    italic: 'נטוי',
    underline: 'קו תחתון',
    strikethrough: 'קו חוצה',
    code: 'קוד',
    clearFormatting: 'נקה עיצוב',
    normal: 'רגיל',
    heading: (level: number) => `כותרת ${level}`,
    bulletList: 'רשימת תבליטים',
    orderedList: 'רשימה ממוספרת',
    checkList: 'רשימת סימון',
    indent: 'הגדל כניסה',
    outdent: 'הקטן כניסה',
    blockquote: 'ציטוט',
    codeBlock: 'בלוק קוד',
    horizontalRule: 'קו אופקי',
    insertTable: 'הוסף טבלה',
    link: 'קישור',
    undo: 'בטל',
    redo: 'בצע שוב',
    cut: 'גזור',
    copy: 'העתק',
    paste: 'הדבק',
    defaultOption: 'ברירת מחדל',
    slashCommands: 'פקודות סלאש',
    noCommandsFound: 'לא נמצאו פקודות',
    changeBlockType: 'שנה סוג בלוק',
    blockTypes: 'סוגי בלוקים',
    enterUrl: 'הכנס כתובת URL:',
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
    sortAscending: 'מיון עולה',
    sortDescending: 'מיון יורד',
    clearSort: 'נקה מיון',
    filterPlaceholder: 'סינון...',
    clearFilter: 'נקה סינון',
    selectAll: 'בחר הכל',
    deselectAll: 'בטל בחירת הכל',
    selectedCount: (count: number) => `${count} נבחרו`,
    resetAll: 'אפס הכל',
    noResults: 'לא נמצאו תוצאות',
    loading: 'טוען...',
    // Filter panel
    filterPanelAddCondition: 'הוסף תנאי',
    filterPanelApply: 'החל',
    filterPanelClear: 'נקה מסננים',
    filterPanelAnd: 'וגם',
    filterPanelOr: 'או',
    filterPanelContains: 'מכיל',
    filterPanelNotContains: 'לא מכיל',
    filterPanelEquals: 'שווה ל',
    filterPanelNotEquals: 'לא שווה ל',
    filterPanelStartsWith: 'מתחיל ב',
    filterPanelEndsWith: 'מסתיים ב',
    filterPanelIsNull: 'ריק',
    filterPanelIsNotNull: 'לא ריק',
    filterPanelGt: 'גדול מ',
    filterPanelGte: 'גדול או שווה',
    filterPanelLt: 'קטן מ',
    filterPanelLte: 'קטן או שווה',
    filterPanelBetween: 'בין',
    filterPanelValuePlaceholder: 'ערך...',
    sortMultiHint: 'החזק Shift למיון לפי מספר עמודות',
    columnVisibility: 'עמודות',
    showAllColumns: 'הצג הכל',
    // Column header menu
    menuSortAsc: 'מיון עולה',
    menuSortDesc: 'מיון יורד',
    menuClearSort: 'בטל מיון',
    menuHideColumn: 'הסתר עמודה',
    menuChooseColumns: 'בחר עמודות',
    menuResetColumns: 'אפס עמודות',
    menuFilter: 'סינון',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `שורות: ${filtered}  סה"כ שורות: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'בחר ערכים...',
    // Group by
    groupCount: (count: number) => `${count} פריטים`,
    collapseGroup: 'כווץ קבוצה',
    expandGroup: 'הרחב קבוצה',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} מכיל "${val}"`,
      textNotContains: (col: string, val: string) => `${col} לא מכיל "${val}"`,
      textEquals: (col: string, val: string) => `${col} שווה ל-"${val}"`,
      textNotEquals: (col: string, val: string) => `${col} לא שווה ל-"${val}"`,
      textStartsWith: (col: string, val: string) => `${col} מתחיל ב-"${val}"`,
      textEndsWith: (col: string, val: string) => `${col} מסתיים ב-"${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} בין ${min} ל-${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} ב-[${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} לא ב-[${vals}]`,
      booleanIs: (col: string, val: string) => `${col} הוא ${val}`,
      isNull: (col: string) => `${col} ריק`,
      isNotNull: (col: string) => `${col} לא ריק`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' וגם '),
      compositeOr: (descriptions: string[]) => descriptions.join(' או '),
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
    label: 'קרוסלה',
    previousSlide: 'שקופית קודמת',
    nextSlide: 'שקופית הבאה',
    slideNavigation: 'ניווט שקופיות',
    slideOfTotal: (index: number, total: number) =>
      `שקופית ${index} מתוך ${total}`,
    goToSlide: (index: number) => `עבור לשקופית ${index}`,
  },
  // Date picker
  datePicker: {
    label: 'בורר תאריך',
    previousYear: 'שנה קודמת',
    previousMonth: 'חודש קודם',
    selectMonth: 'בחר חודש',
    selectYear: 'בחר שנה',
    nextMonth: 'חודש הבא',
    nextYear: 'שנה הבאה',
    previousYears: (count: number) => `${count} שנים קודמות`,
    nextYears: (count: number) => `${count} שנים הבאות`,
    dateRangePickerLabel: 'בורר טווח תאריכים',
    monthNames: [
      'ינואר',
      'פברואר',
      'מרץ',
      'אפריל',
      'מאי',
      'יוני',
      'יולי',
      'אוגוסט',
      'ספטמבר',
      'אוקטובר',
      'נובמבר',
      'דצמבר',
    ],
    shortMonthNames: [
      'ינו',
      'פבר',
      'מרץ',
      'אפר',
      'מאי',
      'יונ',
      'יול',
      'אוג',
      'ספט',
      'אוק',
      'נוב',
      'דצמ',
    ],
    dayNames: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  },
  // Time picker
  timePicker: {
    label: 'בורר שעה',
    hoursLabel: 'HH',
    minutesLabel: 'MM',
    secondsLabel: 'SS',
    selectHours: 'בחירת שעות',
    selectMinutes: 'בחירת דקות',
    selectSeconds: 'בחירת שניות',
    selectPeriod: 'בחירת לפנה"צ/אחה"צ',
    nowLabel: 'עכשיו',
  },
  // Time select
  timeSelectTime: 'בחר שעה',
  dateTimeSelectDateTime: 'בחר תאריך ושעה',
  // OTP input
  otpInputLabel: 'הזנת סיסמה חד-פעמית',
  otpDigitLabel: (index: number, total: number) =>
    `ספרה ${index} מתוך ${total}`,
  // Nine-slice scroll view
  scrollableGridView: 'תצוגת רשת ניתנת לגלילה',
  // Onboarding tour
  onboardingTour: {
    label: 'סיור מודרך',
    stepIndicator: (current: number, total: number) =>
      `שלב ${current} מתוך ${total}`,
    skip: 'דלג',
    previous: 'הקודם',
    next: 'הבא',
    finish: 'סיום',
  },
  // Combobox
  searchPlaceholder: 'חיפוש',
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

export default he
