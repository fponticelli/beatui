import { formatFileSize } from '@/utils'
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
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (מקסימום ${formattedSize})`
    }

    return instruction
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
}

export default he
