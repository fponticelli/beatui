import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const hi: BeatUIMessages = {
  loadingExtended: 'लोड हो रहा है, कृपया प्रतीक्षा करें',
  loadingShort: 'लोड हो रहा है...',
  locale: 'स्थानीय',
  iconDescription: 'आइकन',
  loadingIcon: 'लोडिंग आइकन',
  failedToLoadIcon: 'आइकन लोड करने में विफल',
  editLabel: 'संपादित करें',
  selectOne: 'एक चुनें',
  selectNone: 'कोई नहीं',
  selectMany: 'बहुत चुनें',
  noResults: 'कोई परिणाम नहीं',
  passwordPlaceholderText: 'गुप्त पासवर्ड',
  togglePasswordVisibility: 'पासवर्ड दृश्यता टॉगल करें',
  toggleMenu: 'मेनू टॉगल करें',
  toggleAside: 'साइड पैनल टॉगल करें',
  mainNavigation: 'मुख्य नेवीगेशन',
  sidebar: 'साइडबार',
  closeDrawer: 'ड्रॉअर बंद करें',
  closeModal: 'मॉडल बंद करें',
  confirm: 'पुष्टि करें',
  cancel: 'रद्द करें',
  addLabel: 'जोड़ें',
  removeItem: 'आइटम हटाएं',
  // languages
  currentLocale: 'हिंदी',
  ar: 'अरबी',
  de: 'जर्मन',
  en: 'अंग्रेज़ी',
  es: 'स्पेनिश',
  fr: 'फ्रेंच',
  hi: 'हिन्दी',
  it: 'इतालवी',
  ja: 'जापानी',
  ko: 'कोरियाई',
  nl: 'डच',
  pl: 'पोलिश',
  pt: 'पोर्तुगीज',
  ru: 'रूसी',
  tr: 'तुर्की',
  vi: 'वियतनामी',
  zh: 'चीनी',
  he: 'हिब्रू',
  fa: 'फारसी',
  ur: 'उर्दू',
  // input
  emailPlaceholderText: 'अपना ईमेल दर्ज करें',
  incrementValue: 'वृद्धि मान',
  decrementValue: 'घटाना मान',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'चुनने के लिए क्लिक करें या फ़ाइलें यहाँ खींचें, या फाइल चयनकर्ता खोलने के लिए Enter या Space दबाएं'
      : 'फ़ाइलें यहाँ खींचें',
  // size
  fileSizeUnits: ['बाइट्स', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'फ़ाइल हटाएं',
  clearAllFiles: 'सभी फ़ाइलें हटाएं',
  // inputs reset
  clearValue: 'वृद्धि मान',
  unknownType: 'अज्ञात प्रकार',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'चुनने के लिए क्लिक करें या फ़ाइलें यहाँ खींचें'
        : 'चुनने के लिए क्लिक करें या फ़ाइल यहाँ खींचें'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`अधिकतम ${maxFiles} फ़ाइलें`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`प्रत्येक अधिकतम ${formattedSize}`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'पृष्ठांकन',
  firstPage: 'पहला पृष्ठ',
  previousPage: 'पिछला पृष्ठ',
  nextPage: 'अगला पृष्ठ',
  lastPage: 'अंतिम पृष्ठ',
  // Breadcrumbs
  breadcrumbs: 'ब्रेडक्रम्ब',
  // Command palette
  commandPalette: 'कमांड पैलेट',
  typeACommand: 'कमांड टाइप करें...',
  noResultsFound: 'कोई परिणाम नहीं मिला',
  noMatchingCommands: 'कोई मेल खाने वाला कमांड नहीं',
  // Appearance
  appearanceSystem: 'सिस्टम',
  appearanceLight: 'लाइट',
  appearanceDark: 'डार्क',
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
  pdfPreview: 'PDF पूर्वावलोकन',
  // Lexical editor
  lexical: {
    fontFamily: 'फ़ॉन्ट परिवार',
    fontSize: 'फ़ॉन्ट आकार',
    fontColor: 'फ़ॉन्ट रंग',
    highlightColor: 'हाइलाइट रंग',
    backgroundColor: 'पृष्ठभूमि रंग',
    bold: 'बोल्ड',
    italic: 'इटैलिक',
    underline: 'रेखांकित',
    strikethrough: 'स्ट्राइकथ्रू',
    code: 'कोड',
    clearFormatting: 'फ़ॉर्मेटिंग साफ़ करें',
    normal: 'सामान्य',
    heading: (level: number) => `शीर्षक ${level}`,
    bulletList: 'बुलेट सूची',
    orderedList: 'क्रमांकित सूची',
    checkList: 'चेक सूची',
    indent: 'इंडेंट',
    outdent: 'आउटडेंट',
    blockquote: 'उद्धरण',
    codeBlock: 'कोड ब्लॉक',
    horizontalRule: 'क्षैतिज रेखा',
    insertTable: 'तालिका डालें',
    link: 'लिंक',
    undo: 'पूर्ववत करें',
    redo: 'फिर से करें',
    cut: 'काटें',
    copy: 'कॉपी करें',
    paste: 'चिपकाएं',
    defaultOption: 'डिफ़ॉल्ट',
    slashCommands: 'स्लैश कमांड',
    noCommandsFound: 'कोई कमांड नहीं मिला',
    changeBlockType: 'ब्लॉक प्रकार बदलें',
    blockTypes: 'ब्लॉक प्रकार',
    enterUrl: 'URL दर्ज करें:',
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

export default hi
