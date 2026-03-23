import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const de: BeatUIMessages = {
  loadingExtended: 'Lädt, bitte warten',
  loadingShort: 'Lädt...',
  iconDescription: 'Symbol',
  loadingIcon: 'Ladesymbol',
  locale: 'Landesvariante',
  failedToLoadIcon: 'Symbol konnte nicht geladen werden',
  editLabel: 'Bearbeiten',
  selectOne: 'Eines auswählen',
  selectNone: 'Keines',
  selectMany: 'Mehrere auswählen',
  noResults: 'Keine Ergebnisse',
  passwordPlaceholderText: 'Geheimes Passwort',
  togglePasswordVisibility: 'Passwort-Sichtbarkeit umschalten',
  toggleMenu: 'Menü umschalten',
  toggleAside: 'Seitenleiste umschalten',
  mainNavigation: 'Hauptnavigation',
  sidebar: 'Seitenleiste',
  closeDrawer: 'Schublade schließen',
  closeModal: 'Modal schließen',
  confirm: 'Bestätigen',
  cancel: 'Abbrechen',
  addLabel: 'Hinzufügen',
  removeItem: 'Element entfernen',
  // languages
  currentLocale: 'Deutsch',
  ar: 'Arabisch',
  de: 'Deutsch',
  en: 'Englisch',
  es: 'Spanisch',
  fr: 'Französisch',
  hi: 'Hindi',
  it: 'Italienisch',
  ja: 'Japanisch',
  ko: 'Koreanisch',
  nl: 'Niederländisch',
  pl: 'Polnisch',
  pt: 'Portugiesisch',
  ru: 'Russisch',
  tr: 'Türkisch',
  vi: 'Vietnamesisch',
  zh: 'Chinesisch',
  he: 'Hebräisch',
  fa: 'Persisch',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'E-Mail eingeben',
  incrementValue: 'Wert erhöhen',
  decrementValue: 'Wert verringern',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Klicken zum Auswählen oder Dateien hierher ziehen, oder Enter oder Leertaste drücken, um Dateiauswahl zu öffnen'
      : 'Dateien hierher ziehen',
  // size
  fileSizeUnits: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Datei entfernen',
  clearAllFiles: 'Alle Dateien löschen',
  // inputs reset
  clearValue: 'Wert löschen',
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
  unknownType: 'Unbekannter Typ',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Klicken zum Auswählen oder Dateien hierher ziehen'
        : 'Klicken zum Auswählen oder Datei hierher ziehen'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`bis zu ${maxFiles} Dateien`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`max ${formattedSize} je Datei`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Seitennavigation',
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `Zeilen ${from} bis ${to} von ${filtered} von ${total}`
      : `Zeilen ${from} bis ${to} von ${filtered}`,
  firstPage: 'Erste Seite',
  previousPage: 'Vorherige Seite',
  nextPage: 'Nächste Seite',
  lastPage: 'Letzte Seite',
  // Breadcrumbs
  breadcrumbs: 'Brotkrümelnavigation',
  // Command palette
  commandPalette: 'Befehlspalette',
  typeACommand: 'Befehl eingeben...',
  noResultsFound: 'Keine Ergebnisse gefunden',
  noMatchingCommands: 'Keine passenden Befehle',
  // Appearance
  appearanceSystem: 'System',
  appearanceLight: 'Hell',
  appearanceDark: 'Dunkel',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation: 'Typänderung löscht den aktuellen Wert. Fortfahren?',
  // Notifications
  notifications: 'Benachrichtigungen',
  markAllAsRead: 'Alle als gelesen markieren',
  noNotifications: 'Keine Benachrichtigungen',
  // JSON Schema
  schemaConflictsDetected: 'Schemakonflikte erkannt',
  schemaViolationsDetected: 'Schemaverletzungen erkannt',
  properties: 'Eigenschaften',
  // File upload
  uploading: 'Wird hochgeladen...',
  dropFilesOrBrowse: 'Dateien hierher ziehen oder klicken zum Durchsuchen',
  acceptedTypes: (types: string) => `Akzeptierte Typen: ${types}`,
  // Rich text
  enterUrlPrompt: 'URL eingeben:',
  exceeded: '(überschritten)',
  // PDF
  pdfPreview: 'PDF-Vorschau',
  // Lexical editor
  lexical: {
    fontFamily: 'Schriftart',
    fontSize: 'Schriftgröße',
    lineHeight: 'Zeilenhöhe',
    fontColor: 'Schriftfarbe',
    highlightColor: 'Hervorhebungsfarbe',
    backgroundColor: 'Hintergrundfarbe',
    bold: 'Fett',
    italic: 'Kursiv',
    underline: 'Unterstrichen',
    strikethrough: 'Durchgestrichen',
    code: 'Code',
    clearFormatting: 'Formatierung löschen',
    normal: 'Normal',
    heading: (level: number) => `Überschrift ${level}`,
    bulletList: 'Aufzählung',
    orderedList: 'Nummerierte Liste',
    checkList: 'Checkliste',
    indent: 'Einzug vergrößern',
    outdent: 'Einzug verkleinern',
    blockquote: 'Zitat',
    codeBlock: 'Code-Block',
    horizontalRule: 'Horizontale Linie',
    insertTable: 'Tabelle einfügen',
    link: 'Link',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    cut: 'Ausschneiden',
    copy: 'Kopieren',
    paste: 'Einfügen',
    defaultOption: 'Standard',
    slashCommands: 'Schrägstrich-Befehle',
    noCommandsFound: 'Keine Befehle gefunden',
    changeBlockType: 'Blocktyp ändern',
    blockTypes: 'Blocktypen',
    enterUrl: 'URL eingeben:',
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
    sortAscending: 'Aufsteigend sortieren',
    sortDescending: 'Absteigend sortieren',
    clearSort: 'Sortierung aufheben',
    filterPlaceholder: 'Filtern...',
    clearFilter: 'Filter löschen',
    selectAll: 'Alle auswählen',
    deselectAll: 'Alle abwählen',
    selectedCount: (count: number) => `${count} ausgewählt`,
    resetAll: 'Alles zurücksetzen',
    noResults: 'Keine Ergebnisse gefunden',
    loading: 'Wird geladen...',
    // Filter panel
    filterPanelAddCondition: 'Bedingung hinzufügen',
    filterPanelApply: 'Anwenden',
    filterPanelClear: 'Filter löschen',
    filterPanelAnd: 'UND',
    filterPanelOr: 'ODER',
    filterPanelContains: 'Enthält',
    filterPanelNotContains: 'Enthält nicht',
    filterPanelEquals: 'Gleich',
    filterPanelNotEquals: 'Ungleich',
    filterPanelStartsWith: 'Beginnt mit',
    filterPanelEndsWith: 'Endet mit',
    filterPanelIsNull: 'Ist leer',
    filterPanelIsNotNull: 'Ist nicht leer',
    filterPanelGt: 'Größer als',
    filterPanelGte: 'Größer oder gleich',
    filterPanelLt: 'Kleiner als',
    filterPanelLte: 'Kleiner oder gleich',
    filterPanelBetween: 'Zwischen',
    filterPanelValuePlaceholder: 'Wert...',
    sortMultiHint: 'Shift gedrückt halten, um mehrere Spalten zu sortieren',
    columnVisibility: 'Spalten',
    showAllColumns: 'Alle anzeigen',
    // Column header menu
    menuSortAsc: 'Aufsteigend sortieren',
    menuSortDesc: 'Absteigend sortieren',
    menuClearSort: 'Sortierung aufheben',
    menuHideColumn: 'Spalte ausblenden',
    menuChooseColumns: 'Spalten auswählen',
    menuResetColumns: 'Spalten zurücksetzen',
    menuFilter: 'Filtern',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Zeilen: ${filtered}  Zeilen gesamt: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Werte auswählen...',
    // Group by
    groupCount: (count: number) => `${count} Einträge`,
    collapseGroup: 'Gruppe einklappen',
    expandGroup: 'Gruppe ausklappen',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} enthält "${val}"`,
      textNotContains: (col: string, val: string) =>
        `${col} enthält nicht "${val}"`,
      textEquals: (col: string, val: string) => `${col} ist gleich "${val}"`,
      textNotEquals: (col: string, val: string) =>
        `${col} ist ungleich "${val}"`,
      textStartsWith: (col: string, val: string) =>
        `${col} beginnt mit "${val}"`,
      textEndsWith: (col: string, val: string) => `${col} endet mit "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} zwischen ${min} und ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} in [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} nicht in [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} ist ${val}`,
      isNull: (col: string) => `${col} ist leer`,
      isNotNull: (col: string) => `${col} ist nicht leer`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' UND '),
      compositeOr: (descriptions: string[]) => descriptions.join(' ODER '),
    },
  },
  prosemirror: {
    bold: 'Fett',
    italic: 'Kursiv',
    code: 'Inline-Code',
    link: 'Link einfügen',
    removeLink: 'Link entfernen',
    heading: (level: number) => `Überschrift ${level}`,
    bulletList: 'Aufzählung',
    orderedList: 'Nummerierte Liste',
    blockquote: 'Zitat',
    codeBlock: 'Code-Block',
    horizontalRule: 'Horizontale Linie',
    linkUrlPlaceholder: 'https://beispiel.com',
  },
  // Carousel
  carousel: {
    label: 'Karussell',
    previousSlide: 'Vorherige Folie',
    nextSlide: 'Nächste Folie',
    slideNavigation: 'Foliennavigation',
    slideOfTotal: (index: number, total: number) =>
      `Folie ${index} von ${total}`,
    goToSlide: (index: number) => `Zu Folie ${index}`,
  },
  // Date picker
  datePicker: {
    label: 'Datumsauswahl',
    previousYear: 'Vorheriges Jahr',
    previousMonth: 'Vorheriger Monat',
    selectMonth: 'Monat auswählen',
    selectYear: 'Jahr auswählen',
    nextMonth: 'Nächster Monat',
    nextYear: 'Nächstes Jahr',
    previousYears: (count: number) => `Vorherige ${count} Jahre`,
    nextYears: (count: number) => `Nächste ${count} Jahre`,
    dateRangePickerLabel: 'Datumsbereichsauswahl',
    monthNames: [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ],
    shortMonthNames: [
      'Jan',
      'Feb',
      'Mär',
      'Apr',
      'Mai',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Okt',
      'Nov',
      'Dez',
    ],
    dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  },
  // Time picker
  timePicker: {
    label: 'Zeitauswahl',
    hoursLabel: 'HH',
    minutesLabel: 'MM',
    secondsLabel: 'SS',
    selectHours: 'Stunden auswählen',
    selectMinutes: 'Minuten auswählen',
    selectSeconds: 'Sekunden auswählen',
    selectPeriod: 'AM/PM auswählen',
    nowLabel: 'Jetzt',
  },
  // Time select
  timeSelectTime: 'Zeit auswählen',
  dateTimeSelectDateTime: 'Datum und Uhrzeit auswählen',
  // Color picker
  colorPicker: {
    hue: 'Farbton',
    saturation: 'Sättigung',
    lightness: 'Helligkeit',
    alpha: 'Alpha',
    red: 'Rot',
    green: 'Grün',
    blue: 'Blau',
    hex: 'Hex',
    whiteness: 'Weißanteil',
    blackness: 'Schwarzanteil',
    chroma: 'Chroma',
  },
  // Spotlight
  spotlight: {
    placeholder: 'Suchen...',
    noResults: 'Keine Ergebnisse gefunden',
    recentItems: 'Zuletzt verwendet',
    close: 'Schließen',
  },
  // Virtual list
  virtualList: {
    listLabel: 'Scrollbare Liste',
  },
  // Stepper
  stepper: {
    step: 'Schritt',
    stepOfTotal: (current: number, total: number) =>
      `Schritt ${current} von ${total}`,
    completed: 'Abgeschlossen',
    next: 'Weiter',
    previous: 'Zurück',
    complete: 'Abschließen',
  },
  // Sortable list
  sortableList: {
    dragHandle: 'Zum Neuordnen ziehen',
    dropIndicator: 'Hier ablegen',
  },
  // Transfer list
  transferList: {
    available: 'Verfügbar',
    selected: 'Ausgewählt',
    moveRight: 'Zu ausgewählt verschieben',
    moveLeft: 'Zu verfügbar verschieben',
    moveAllRight: 'Alle zu ausgewählt',
    moveAllLeft: 'Alle zu verfügbar',
    searchAvailable: 'Verfügbare durchsuchen',
    searchSelected: 'Ausgewählte durchsuchen',
  },
  // Copy button
  copyButton: {
    copied: 'Kopiert!',
    copyToClipboard: 'In Zwischenablage kopieren',
  },
  // Number stepper
  numberStepper: {
    increment: 'Erhöhen',
    decrement: 'Verringern',
    value: 'Wert',
  },
  // Stat card
  statCard: {
    trendUp: 'Steigend',
    trendDown: 'Fallend',
    trendFlat: 'Keine Änderung',
  },
  // OTP input
  otpInputLabel: 'Einmalpasswort-Eingabe',
  otpDigitLabel: (index: number, total: number) =>
    `Ziffer ${index} von ${total}`,
  // Nine-slice scroll view
  scrollableGridView: 'Scrollbare Rasteransicht',
  // Onboarding tour
  onboardingTour: {
    label: 'Geführte Tour',
    stepIndicator: (current: number, total: number) =>
      `Schritt ${current} von ${total}`,
    skip: 'Überspringen',
    previous: 'Zurück',
    next: 'Weiter',
    finish: 'Fertig',
  },
  // Combobox
  searchPlaceholder: 'Suchen',
  // PDF Page Viewer
  pdfPageViewer: {
    loading: 'PDF wird geladen...',
    loadFailed: 'PDF konnte nicht geladen werden',
    invalidPdf: 'Ungültige PDF-Datei',
    pageOutOfRange: (page: number, total: number) =>
      `Seite ${page} liegt außerhalb des Bereichs (1-${total})`,
    renderFailed: 'PDF-Seite konnte nicht gerendert werden',
  },
}

export default de
