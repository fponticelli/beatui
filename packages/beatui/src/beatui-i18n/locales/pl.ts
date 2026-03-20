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
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
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
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `Wiersze ${from} do ${to} z ${filtered} z ${total}`
      : `Wiersze ${from} do ${to} z ${filtered}`,
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
    lineHeight: 'Wysokość linii',
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
    sortAscending: 'Sortuj rosnąco',
    sortDescending: 'Sortuj malejąco',
    clearSort: 'Wyczyść sortowanie',
    filterPlaceholder: 'Filtruj...',
    clearFilter: 'Wyczyść filtr',
    selectAll: 'Zaznacz wszystko',
    deselectAll: 'Odznacz wszystko',
    selectedCount: (count: number) => `${count} zaznaczonych`,
    resetAll: 'Resetuj wszystko',
    noResults: 'Nie znaleziono wyników',
    loading: 'Ładowanie...',
    // Filter panel
    filterPanelAddCondition: 'Dodaj warunek',
    filterPanelApply: 'Zastosuj',
    filterPanelClear: 'Wyczyść filtry',
    filterPanelAnd: 'I',
    filterPanelOr: 'LUB',
    filterPanelContains: 'Zawiera',
    filterPanelNotContains: 'Nie zawiera',
    filterPanelEquals: 'Równe',
    filterPanelNotEquals: 'Nierówne',
    filterPanelStartsWith: 'Zaczyna się od',
    filterPanelEndsWith: 'Kończy się na',
    filterPanelIsNull: 'Jest pusty',
    filterPanelIsNotNull: 'Nie jest pusty',
    filterPanelGt: 'Większy niż',
    filterPanelGte: 'Większy lub równy',
    filterPanelLt: 'Mniejszy niż',
    filterPanelLte: 'Mniejszy lub równy',
    filterPanelBetween: 'Między',
    filterPanelValuePlaceholder: 'Wartość...',
    sortMultiHint: 'Przytrzymaj Shift, aby sortować według wielu kolumn',
    columnVisibility: 'Kolumny',
    showAllColumns: 'Pokaż wszystkie',
    // Column header menu
    menuSortAsc: 'Sortuj rosnąco',
    menuSortDesc: 'Sortuj malejąco',
    menuClearSort: 'Wyczyść sortowanie',
    menuHideColumn: 'Ukryj kolumnę',
    menuChooseColumns: 'Wybierz kolumny',
    menuResetColumns: 'Resetuj kolumny',
    menuFilter: 'Filtruj',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Wiersze: ${filtered}  Łącznie wierszy: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Wybierz wartości...',
    // Group by
    groupCount: (count: number) => `${count} elementów`,
    collapseGroup: 'Zwiń grupę',
    expandGroup: 'Rozwiń grupę',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} zawiera "${val}"`,
      textNotContains: (col: string, val: string) =>
        `${col} nie zawiera "${val}"`,
      textEquals: (col: string, val: string) => `${col} równe "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} nierówne "${val}"`,
      textStartsWith: (col: string, val: string) =>
        `${col} zaczyna się od "${val}"`,
      textEndsWith: (col: string, val: string) =>
        `${col} kończy się na "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} między ${min} a ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} w [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} nie w [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} jest ${val}`,
      isNull: (col: string) => `${col} jest puste`,
      isNotNull: (col: string) => `${col} nie jest puste`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' I '),
      compositeOr: (descriptions: string[]) => descriptions.join(' LUB '),
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
    label: 'Karuzela',
    previousSlide: 'Poprzedni slajd',
    nextSlide: 'Następny slajd',
    slideNavigation: 'Nawigacja slajdów',
    slideOfTotal: (index: number, total: number) => `Slajd ${index} z ${total}`,
    goToSlide: (index: number) => `Przejdź do slajdu ${index}`,
  },
  // Date picker
  datePicker: {
    label: 'Wybór daty',
    previousYear: 'Poprzedni rok',
    previousMonth: 'Poprzedni miesiąc',
    selectMonth: 'Wybierz miesiąc',
    selectYear: 'Wybierz rok',
    nextMonth: 'Następny miesiąc',
    nextYear: 'Następny rok',
    previousYears: (count: number) => `Poprzednie ${count} lat`,
    nextYears: (count: number) => `Następne ${count} lat`,
    dateRangePickerLabel: 'Wybór zakresu dat',
    monthNames: [
      'Styczeń',
      'Luty',
      'Marzec',
      'Kwiecień',
      'Maj',
      'Czerwiec',
      'Lipiec',
      'Sierpień',
      'Wrzesień',
      'Październik',
      'Listopad',
      'Grudzień',
    ],
    shortMonthNames: [
      'Sty',
      'Lut',
      'Mar',
      'Kwi',
      'Maj',
      'Cze',
      'Lip',
      'Sie',
      'Wrz',
      'Paź',
      'Lis',
      'Gru',
    ],
    dayNames: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
  },
  // Time picker
  timePicker: {
    label: 'Wybór czasu',
    hoursLabel: 'HH',
    minutesLabel: 'MM',
    secondsLabel: 'SS',
    selectHours: 'Wybierz godziny',
    selectMinutes: 'Wybierz minuty',
    selectSeconds: 'Wybierz sekundy',
    selectPeriod: 'Wybierz AM/PM',
    nowLabel: 'Teraz',
  },
  // Time select
  timeSelectTime: 'Wybierz czas',
  // OTP input
  otpInputLabel: 'Pole jednorazowego hasła',
  otpDigitLabel: (index: number, total: number) => `Cyfra ${index} z ${total}`,
  // Nine-slice scroll view
  scrollableGridView: 'Przewijalny widok siatki',
  // Onboarding tour
  onboardingTour: {
    label: 'Przewodnik',
    stepIndicator: (current: number, total: number) =>
      `Krok ${current} z ${total}`,
    skip: 'Pomiń',
    previous: 'Wstecz',
    next: 'Dalej',
    finish: 'Zakończ',
  },
  // Combobox
  searchPlaceholder: 'Szukaj',
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
