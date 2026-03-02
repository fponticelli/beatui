import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const it: BeatUIMessages = {
  loadingExtended: 'Caricamento, attendere prego...',
  loadingShort: 'Caricamento...',
  locale: 'Lingua',
  iconDescription: 'Icona',
  loadingIcon: 'Icona di caricamento',
  failedToLoadIcon: "Impossibile caricare l'icona",
  editLabel: 'Modifica',
  selectOne: 'Seleziona uno',
  selectNone: 'Nessuno',
  selectMany: 'Seleziona più elementi',
  noResults: 'Nessun risultato',
  passwordPlaceholderText: 'Password Segreta',
  togglePasswordVisibility: 'Attiva/disattiva visibilità password',
  toggleMenu: 'Attiva/disattiva menu',
  toggleAside: 'Attiva/disattiva pannello laterale',
  mainNavigation: 'Navigazione principale',
  sidebar: 'Barra laterale',
  closeDrawer: 'Chiudi cassetto',
  closeModal: 'Chiudi modale',
  confirm: 'Conferma',
  cancel: 'Annulla',
  addLabel: 'Aggiungi',
  removeItem: 'Rimuovi elemento',
  // languages
  currentLocale: 'Italiano',
  ar: 'Arabo',
  de: 'Tedesco',
  en: 'Inglese',
  es: 'Spagnolo',
  fr: 'Francese',
  hi: 'Hindi',
  it: 'Italiano',
  ja: 'Giapponese',
  ko: 'Coreano',
  nl: 'Olandese',
  pl: 'Polacco',
  pt: 'Portoghese',
  ru: 'Russo',
  tr: 'Turco',
  vi: 'Vietnamita',
  zh: 'Cinese',
  he: 'Ebraico',
  fa: 'Persiano',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'Inserisci la tua email',
  incrementValue: 'Incrementa valore',
  decrementValue: 'Decrementa valore',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Clicca per scegliere o trascina i file qui, o premi Invio o Spazio per aprire il selettore file'
      : 'Trascina i file qui',
  // size
  fileSizeUnits: ['Byte', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Rimuovi file',
  clearAllFiles: 'Cancella tutti i file',
  // inputs reset
  clearValue: 'Cancella valore',
  unknownType: 'Tipo sconosciuto',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Clicca per scegliere o trascina i file qui'
        : 'Clicca per scegliere o trascina un file qui'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`fino a ${maxFiles} file`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`max ${formattedSize} ciascuno`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Paginazione',
  firstPage: 'Prima pagina',
  previousPage: 'Pagina precedente',
  nextPage: 'Pagina successiva',
  lastPage: 'Ultima pagina',
  // Breadcrumbs
  breadcrumbs: 'Breadcrumb',
  // Command palette
  commandPalette: 'Tavolozza comandi',
  typeACommand: 'Digita un comando...',
  noResultsFound: 'Nessun risultato trovato',
  noMatchingCommands: 'Nessun comando corrispondente',
  // Appearance
  appearanceSystem: 'Sistema',
  appearanceLight: 'Chiaro',
  appearanceDark: 'Scuro',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    'La modifica del tipo cancellerà il valore attuale. Continuare?',
  // Notifications
  notifications: 'Notifiche',
  markAllAsRead: 'Segna tutto come letto',
  noNotifications: 'Nessuna notifica',
  // JSON Schema
  schemaConflictsDetected: 'Conflitti di schema rilevati',
  schemaViolationsDetected: 'Violazioni di schema rilevate',
  properties: 'Proprietà',
  // File upload
  uploading: 'Caricamento...',
  dropFilesOrBrowse: 'Trascina i file qui o clicca per sfogliare',
  acceptedTypes: (types: string) => `Tipi accettati: ${types}`,
  // Rich text
  enterUrlPrompt: 'Inserisci URL:',
  exceeded: '(superato)',
  // PDF
  pdfPreview: 'Anteprima PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Famiglia di caratteri',
    fontSize: 'Dimensione carattere',
    lineHeight: 'Altezza riga',
    fontColor: 'Colore carattere',
    highlightColor: 'Colore evidenziazione',
    backgroundColor: 'Colore sfondo',
    bold: 'Grassetto',
    italic: 'Corsivo',
    underline: 'Sottolineato',
    strikethrough: 'Barrato',
    code: 'Codice',
    clearFormatting: 'Cancella formattazione',
    normal: 'Normale',
    heading: (level: number) => `Titolo ${level}`,
    bulletList: 'Elenco puntato',
    orderedList: 'Elenco numerato',
    checkList: 'Elenco di controllo',
    indent: 'Aumenta rientro',
    outdent: 'Riduci rientro',
    blockquote: 'Citazione',
    codeBlock: 'Blocco di codice',
    horizontalRule: 'Linea orizzontale',
    insertTable: 'Inserisci tabella',
    link: 'Collegamento',
    undo: 'Annulla',
    redo: 'Ripristina',
    cut: 'Taglia',
    copy: 'Copia',
    paste: 'Incolla',
    defaultOption: 'Predefinito',
    slashCommands: 'Comandi slash',
    noCommandsFound: 'Nessun comando trovato',
    changeBlockType: 'Cambia tipo di blocco',
    blockTypes: 'Tipi di blocco',
    enterUrl: 'Inserisci URL:',
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
    sortAscending: 'Ordine crescente',
    sortDescending: 'Ordine decrescente',
    clearSort: 'Rimuovi ordinamento',
    filterPlaceholder: 'Filtra...',
    clearFilter: 'Rimuovi filtro',
    selectAll: 'Seleziona tutto',
    deselectAll: 'Deseleziona tutto',
    selectedCount: (count: number) => `${count} selezionati`,
    resetAll: 'Ripristina tutto',
    noResults: 'Nessun risultato trovato',
    loading: 'Caricamento...',
    // Filter panel
    filterPanelAddCondition: 'Aggiungi condizione',
    filterPanelApply: 'Applica',
    filterPanelClear: 'Cancella filtri',
    filterPanelAnd: 'E',
    filterPanelOr: 'O',
    filterPanelContains: 'Contiene',
    filterPanelNotContains: 'Non contiene',
    filterPanelEquals: 'Uguale a',
    filterPanelNotEquals: 'Diverso da',
    filterPanelStartsWith: 'Inizia con',
    filterPanelEndsWith: 'Finisce con',
    filterPanelIsNull: 'È vuoto',
    filterPanelIsNotNull: 'Non è vuoto',
    filterPanelGt: 'Maggiore di',
    filterPanelGte: 'Maggiore o uguale',
    filterPanelLt: 'Minore di',
    filterPanelLte: 'Minore o uguale',
    filterPanelBetween: 'Tra',
    filterPanelValuePlaceholder: 'Valore...',
    sortMultiHint: 'Tieni premuto Shift per ordinare per più colonne',
    columnVisibility: 'Colonne',
    showAllColumns: 'Mostra tutto',
    // Column header menu
    menuSortAsc: 'Ordina crescente',
    menuSortDesc: 'Ordina decrescente',
    menuClearSort: 'Rimuovi ordinamento',
    menuHideColumn: 'Nascondi colonna',
    menuChooseColumns: 'Scegli colonne',
    menuResetColumns: 'Ripristina colonne',
    menuFilter: 'Filtra',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Righe: ${filtered}  Righe totali: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Seleziona valori...',
    // Group by
    groupCount: (count: number) => `${count} elementi`,
    collapseGroup: 'Comprimi gruppo',
    expandGroup: 'Espandi gruppo',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} contiene "${val}"`,
      textNotContains: (col: string, val: string) => `${col} non contiene "${val}"`,
      textEquals: (col: string, val: string) => `${col} uguale a "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} diverso da "${val}"`,
      textStartsWith: (col: string, val: string) => `${col} inizia con "${val}"`,
      textEndsWith: (col: string, val: string) => `${col} finisce con "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) => `${col} tra ${min} e ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} in [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} non in [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} è ${val}`,
      isNull: (col: string) => `${col} è vuoto`,
      isNotNull: (col: string) => `${col} non è vuoto`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' E '),
      compositeOr: (descriptions: string[]) => descriptions.join(' O '),
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
    loading: 'Caricamento PDF...',
    loadFailed: 'Impossibile caricare il PDF',
    invalidPdf: 'File PDF non valido',
    pageOutOfRange: (page: number, total: number) =>
      `La pagina ${page} è fuori intervallo (1-${total})`,
    renderFailed: 'Impossibile renderizzare la pagina PDF',
  },
}

export default it
