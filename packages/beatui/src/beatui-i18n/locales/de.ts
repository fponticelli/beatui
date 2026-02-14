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
  },
  // prosemirror
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
