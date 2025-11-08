import { formatFileSize } from '@/utils'
import { BeatUIMessages } from '../default'

export const pl: BeatUIMessages = {
  loadingExtended: 'Ładowanie, proszę czekać',
  loadingShort: 'Ładowanie...',
  locale: 'Język',
  iconDescription: 'Ikona',
  loadingIcon: 'Ikona ładowania',
  failedToLoadIcon: 'Nie udało się załadować ikony',
  editLabel: 'Edytuj',
  selectOne: 'Wybierz jeden',
  selectMany: 'Wybierz wiele',
  noResults: 'Brak wyników',
  passwordPlaceholderText: 'Tajne hasło',
  togglePasswordVisibility: 'Przełącz widoczność hasła',
  toggleMenu: 'Przełącz menu',
  toggleAside: 'Przełącz panel boczny',
  mainNavigation: 'Główna nawigacja',
  sidebar: 'Pasek boczny',
  closeDrawer: 'Zamknij szufladę',
  closeModal: 'Zamknij modal',
  confirm: 'Potwierdź',
  cancel: 'Anuluj',
  addLabel: 'Dodaj',
  removeItem: 'Usuń element',
  // languages
  currentLocale: 'Polski',
  ar: 'Arabski',
  de: 'Niemiecki',
  en: 'Angielski',
  es: 'Hiszpański',
  fr: 'Francuski',
  hi: 'Hindi',
  it: 'Włoski',
  ja: 'Japoński',
  ko: 'Koreański',
  nl: 'Holenderski',
  pl: 'Polski',
  pt: 'Portugalski',
  ru: 'Rosyjski',
  tr: 'Turecki',
  vi: 'Wietnamski',
  zh: 'Chiński',
  he: 'Hebrajski',
  fa: 'Perski',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'Wprowadź adres e-mail',
  incrementValue: 'Zwiększ wartość',
  decrementValue: 'Zmniejsz wartość',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Kliknij aby wybrać lub przeciągnij pliki tutaj, lub naciśnij Enter lub Spację, aby otworzyć selektor plików'
      : 'Przeciągnij pliki tutaj',
  // size
  fileSizeUnits: ['Bajty', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Usuń plik',
  clearAllFiles: 'Usuń wszystkie pliki',
  // inputs reset
  clearValue: 'Wyczyść wartość',
  unknownType: 'Nieznany typ',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Kliknij aby wybrać lub przeciągnij pliki tutaj'
        : 'Kliknij aby wybrać lub przeciągnij plik tutaj'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`do ${maxFiles} plików`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`maks ${formattedSize} każdy`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
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

export default pl
