import { formatFileSize } from '../../utils'
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
  selectNone: 'Brak',
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
  // Pagination
  paginationLabel: 'Paginacja',
  firstPage: 'Pierwsza strona',
  previousPage: 'Poprzednia strona',
  nextPage: 'Następna strona',
  lastPage: 'Ostatnia strona',
  // Breadcrumbs
  breadcrumbs: 'Nawigacja okruszkowa',
  // Command palette
  commandPalette: 'Paleta poleceń',
  typeACommand: 'Wpisz polecenie...',
  noResultsFound: 'Nie znaleziono wyników',
  noMatchingCommands: 'Brak pasujących poleceń',
  // Appearance
  appearanceSystem: 'Systemowy',
  appearanceLight: 'Jasny',
  appearanceDark: 'Ciemny',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation: 'Zmiana typu wyczyści bieżącą wartość. Kontynuować?',
  // Notifications
  notifications: 'Powiadomienia',
  markAllAsRead: 'Oznacz wszystkie jako przeczytane',
  noNotifications: 'Brak powiadomień',
  // JSON Schema
  schemaConflictsDetected: 'Wykryto konflikty schematu',
  schemaViolationsDetected: 'Wykryto naruszenia schematu',
  properties: 'Właściwości',
  // File upload
  uploading: 'Przesyłanie...',
  dropFilesOrBrowse: 'Upuść pliki tutaj lub kliknij, aby przeglądać',
  acceptedTypes: (types: string) => `Akceptowane typy: ${types}`,
  // Rich text
  enterUrlPrompt: 'Wprowadź URL:',
  exceeded: '(przekroczono)',
  // PDF
  pdfPreview: 'Podgląd PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Krój czcionki',
    fontSize: 'Rozmiar czcionki',
    fontColor: 'Kolor czcionki',
    highlightColor: 'Kolor wyróżnienia',
    backgroundColor: 'Kolor tła',
    bold: 'Pogrubienie',
    italic: 'Kursywa',
    underline: 'Podkreślenie',
    strikethrough: 'Przekreślenie',
    code: 'Kod',
    clearFormatting: 'Wyczyść formatowanie',
    normal: 'Normalny',
    heading: (level: number) => `Nagłówek ${level}`,
    bulletList: 'Lista punktowana',
    orderedList: 'Lista numerowana',
    checkList: 'Lista kontrolna',
    indent: 'Zwiększ wcięcie',
    outdent: 'Zmniejsz wcięcie',
    blockquote: 'Cytat blokowy',
    codeBlock: 'Blok kodu',
    horizontalRule: 'Linia pozioma',
    insertTable: 'Wstaw tabelę',
    link: 'Link',
    undo: 'Cofnij',
    redo: 'Ponów',
    cut: 'Wytnij',
    copy: 'Kopiuj',
    paste: 'Wklej',
    defaultOption: 'Domyślny',
    slashCommands: 'Polecenia ukośnikowe',
    noCommandsFound: 'Nie znaleziono poleceń',
    changeBlockType: 'Zmień typ bloku',
    blockTypes: 'Typy bloków',
    enterUrl: 'Wprowadź URL:',
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
    loading: 'Ładowanie PDF...',
    loadFailed: 'Nie udało się załadować PDF',
    invalidPdf: 'Nieprawidłowy plik PDF',
    pageOutOfRange: (page: number, total: number) =>
      `Strona ${page} jest poza zakresem (1-${total})`,
    renderFailed: 'Nie udało się wyrenderować strony PDF',
  },
}

export default pl
