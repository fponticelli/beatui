import { formatFileSize } from '@/utils'

const en = {
  loadingExtended: 'Loading, please wait',
  loadingShort: 'Loading...',
  locale: 'Locale',
  iconDescription: 'Icon',
  loadingIcon: 'Loading icon',
  failedToLoadIcon: 'Failed to load icon',
  editLabel: 'Edit',
  selectOne: 'Select one',
  passwordPlaceholderText: 'Secret Password',
  togglePasswordVisibility: 'Toggle password visibility',
  toggleMenu: 'Toggle menu',
  toggleAside: 'Toggle aside',
  mainNavigation: 'Main navigation',
  sidebar: 'Sidebar',
  closeDrawer: 'Close drawer',
  closeModal: 'Close modal',
  confirm: 'Confirm',
  cancel: 'Cancel',
  addLabel: 'Add',
  removeItem: 'Remove item',
  // languages
  currentLocale: 'English',
  ar: 'Arabic',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  nl: 'Dutch',
  pl: 'Polish',
  pt: 'Portuguese',
  ru: 'Russian',
  tr: 'Turkish',
  vi: 'Vietnamese',
  zh: 'Chinese',
  he: 'Hebrew',
  fa: 'Persian',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'Enter your email',
  incrementValue: 'Increment value',
  decrementValue: 'Decrement value',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean): string =>
    clickEnabled
      ? 'Click to choose or drag files here, or press Enter or Space to open file selector'
      : 'Drag files here',
  // size
  fileSizeUnits: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Remove file',
  clearAllFiles: 'Clear all files',
  // inputs reset
  clearValue: 'Reset',
  unknownType: 'Unknown type',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Click to choose or drag files here'
        : 'Click to choose or drag a file here'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`up to ${maxFiles} files`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`max ${formattedSize} each`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (max ${formattedSize})`
    }

    return instruction
  },
}

export default en
