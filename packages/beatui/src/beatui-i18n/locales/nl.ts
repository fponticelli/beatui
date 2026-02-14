import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

export const nl: BeatUIMessages = {
  loadingExtended: 'Laden, even geduld',
  loadingShort: 'Laden...',
  locale: 'Landinstelling',
  iconDescription: 'Pictogram',
  loadingIcon: 'Laadpictogram',
  failedToLoadIcon: 'Pictogram laden mislukt',
  editLabel: 'Bewerken',
  selectOne: 'Selecteer een',
  selectNone: 'Geen',
  selectMany: 'Selecteer meerdere',
  noResults: 'Geen resultaten',
  passwordPlaceholderText: 'Geheim wachtwoord',
  togglePasswordVisibility: 'Wachtwoord zichtbaarheid wisselen',
  toggleMenu: 'Menu wisselen',
  toggleAside: 'Zijpaneel wisselen',
  mainNavigation: 'Hoofdnavigatie',
  sidebar: 'Zijbalk',
  closeDrawer: 'Lade sluiten',
  closeModal: 'Modaal sluiten',
  confirm: 'Bevestigen',
  cancel: 'Annuleren',
  addLabel: 'Toevoegen',
  removeItem: 'Item verwijderen',
  // languages
  currentLocale: 'Nederlands',
  ar: 'Arabisch',
  de: 'Duits',
  en: 'Engels',
  es: 'Spaans',
  fr: 'Frans',
  hi: 'Hindi',
  it: 'Italiaans',
  ja: 'Japans',
  ko: 'Koreaans',
  nl: 'Nederlands',
  pl: 'Pools',
  pt: 'Portugees',
  ru: 'Russisch',
  tr: 'Turks',
  vi: 'Vietnamees',
  zh: 'Chinees',
  he: 'Hebreeuws',
  fa: 'Perzisch',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'Voer je e-mail in',
  incrementValue: 'Waarde verhogen',
  decrementValue: 'Waarde verlagen',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Klik om te kiezen of sleep bestanden hierheen, of druk op Enter of Spatie om bestandskiezer te openen'
      : 'Sleep bestanden hierheen',
  // size
  fileSizeUnits: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Bestand verwijderen',
  clearAllFiles: 'Alle bestanden wissen',
  // inputs reset
  clearValue: 'Waarde wissen',
  unknownType: 'Onbekend type',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Klik om te kiezen of sleep bestanden hierheen'
        : 'Klik om te kiezen of sleep een bestand hierheen'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`tot ${maxFiles} bestanden`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`max ${formattedSize} elk`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Paginering',
  firstPage: 'Eerste pagina',
  previousPage: 'Vorige pagina',
  nextPage: 'Volgende pagina',
  lastPage: 'Laatste pagina',
  // Breadcrumbs
  breadcrumbs: 'Kruimelpad',
  // Command palette
  commandPalette: 'Opdrachtenpalet',
  typeACommand: 'Typ een opdracht...',
  noResultsFound: 'Geen resultaten gevonden',
  noMatchingCommands: 'Geen overeenkomende opdrachten',
  // Appearance
  appearanceSystem: 'Systeem',
  appearanceLight: 'Licht',
  appearanceDark: 'Donker',
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
  pdfPreview: 'PDF-voorbeeld',
  // Lexical editor
  lexical: {
    fontFamily: 'Lettertype',
    fontSize: 'Lettergrootte',
    fontColor: 'Letterkleur',
    highlightColor: 'Markeringskleur',
    backgroundColor: 'Achtergrondkleur',
    bold: 'Vet',
    italic: 'Cursief',
    underline: 'Onderstrepen',
    strikethrough: 'Doorhalen',
    code: 'Code',
    clearFormatting: 'Opmaak wissen',
    normal: 'Normaal',
    heading: (level: number) => `Kop ${level}`,
    bulletList: 'Opsommingstekens',
    orderedList: 'Genummerde lijst',
    checkList: 'Controlelijst',
    indent: 'Inspringen',
    outdent: 'Uitspringen',
    blockquote: 'Citaat',
    codeBlock: 'Codeblok',
    horizontalRule: 'Horizontale lijn',
    insertTable: 'Tabel invoegen',
    link: 'Link',
    undo: 'Ongedaan maken',
    redo: 'Opnieuw',
    cut: 'Knippen',
    copy: 'Kopiëren',
    paste: 'Plakken',
    defaultOption: 'Standaard',
    slashCommands: 'Schuine-streepopdrachten',
    noCommandsFound: 'Geen opdrachten gevonden',
    changeBlockType: 'Bloktype wijzigen',
    blockTypes: 'Bloktypen',
    enterUrl: 'Voer URL in:',
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
    loading: 'PDF laden...',
    loadFailed: 'PDF laden mislukt',
    invalidPdf: 'Ongeldig PDF-bestand',
    pageOutOfRange: (page: number, total: number) =>
      `Pagina ${page} valt buiten bereik (1-${total})`,
    renderFailed: 'PDF-pagina weergeven mislukt',
  },
}

export default nl
