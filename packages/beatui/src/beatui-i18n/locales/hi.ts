import { formatFileSize } from '@/utils'
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
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (अधिकतम ${formattedSize})`
    }

    return instruction
  },
}

export default hi
