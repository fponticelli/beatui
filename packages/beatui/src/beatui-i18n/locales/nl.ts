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
    'Het wijzigen van het type wist de huidige waarde. Doorgaan?',
  // Notifications
  notifications: 'Meldingen',
  markAllAsRead: 'Alles als gelezen markeren',
  noNotifications: 'Geen meldingen',
  // JSON Schema
  schemaConflictsDetected: 'Schemaconflicten gedetecteerd',
  schemaViolationsDetected: 'Schemaschendingen gedetecteerd',
  properties: 'Eigenschappen',
  // File upload
  uploading: 'Uploaden...',
  dropFilesOrBrowse: 'Sleep bestanden hierheen of klik om te bladeren',
  acceptedTypes: (types: string) => `Toegestane typen: ${types}`,
  // Rich text
  enterUrlPrompt: 'Voer URL in:',
  exceeded: '(overschreden)',
  // PDF
  pdfPreview: 'PDF-voorbeeld',
  // Lexical editor
  lexical: {
    fontFamily: 'Lettertype',
    fontSize: 'Lettergrootte',
    lineHeight: 'Regelhoogte',
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
    sortAscending: 'Oplopend sorteren',
    sortDescending: 'Aflopend sorteren',
    clearSort: 'Sortering wissen',
    filterPlaceholder: 'Filteren...',
    clearFilter: 'Filter wissen',
    selectAll: 'Alles selecteren',
    deselectAll: 'Alles deselecteren',
    selectedCount: (count: number) => `${count} geselecteerd`,
    resetAll: 'Alles resetten',
    noResults: 'Geen resultaten gevonden',
    loading: 'Laden...',
    // Filter panel
    filterPanelAddCondition: 'Voorwaarde toevoegen',
    filterPanelApply: 'Toepassen',
    filterPanelClear: 'Filters wissen',
    filterPanelAnd: 'EN',
    filterPanelOr: 'OF',
    filterPanelContains: 'Bevat',
    filterPanelNotContains: 'Bevat niet',
    filterPanelEquals: 'Is gelijk aan',
    filterPanelNotEquals: 'Is niet gelijk aan',
    filterPanelStartsWith: 'Begint met',
    filterPanelEndsWith: 'Eindigt met',
    filterPanelIsNull: 'Is leeg',
    filterPanelIsNotNull: 'Is niet leeg',
    filterPanelGt: 'Groter dan',
    filterPanelGte: 'Groter of gelijk',
    filterPanelLt: 'Kleiner dan',
    filterPanelLte: 'Kleiner of gelijk',
    filterPanelBetween: 'Tussen',
    filterPanelValuePlaceholder: 'Waarde...',
    sortMultiHint: 'Houd Shift ingedrukt om meerdere kolommen te sorteren',
    columnVisibility: 'Kolommen',
    showAllColumns: 'Alles weergeven',
    // Column header menu
    menuSortAsc: 'Oplopend sorteren',
    menuSortDesc: 'Aflopend sorteren',
    menuClearSort: 'Sortering wissen',
    menuHideColumn: 'Kolom verbergen',
    menuChooseColumns: 'Kolommen kiezen',
    menuResetColumns: 'Kolommen herstellen',
    menuFilter: 'Filteren',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Rijen: ${filtered}  Totaal rijen: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Waarden selecteren...',
    // Group by
    groupCount: (count: number) => `${count} items`,
    collapseGroup: 'Groep inklappen',
    expandGroup: 'Groep uitklappen',
    // Aggregation labels
    aggregationSum: 'Som',
    aggregationCount: 'Aantal',
    aggregationAvg: 'Gem.',
    aggregationMin: 'Min',
    aggregationMax: 'Max',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} bevat "${val}"`,
      textNotContains: (col: string, val: string) => `${col} bevat niet "${val}"`,
      textEquals: (col: string, val: string) => `${col} is gelijk aan "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} is niet gelijk aan "${val}"`,
      textStartsWith: (col: string, val: string) => `${col} begint met "${val}"`,
      textEndsWith: (col: string, val: string) => `${col} eindigt met "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) => `${col} tussen ${min} en ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} in [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} niet in [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} is ${val}`,
      isNull: (col: string) => `${col} is leeg`,
      isNotNull: (col: string) => `${col} is niet leeg`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' EN '),
      compositeOr: (descriptions: string[]) => descriptions.join(' OF '),
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
