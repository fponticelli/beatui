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
  pdfPreview: 'תצוגה מקדימה של PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'משפחת גופן',
    fontSize: 'גודל גופן',
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

export default he
