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
    loading: 'Caricamento PDF...',
    loadFailed: 'Impossibile caricare il PDF',
    invalidPdf: 'File PDF non valido',
    pageOutOfRange: (page: number, total: number) =>
      `La pagina ${page} è fuori intervallo (1-${total})`,
    renderFailed: 'Impossibile renderizzare la pagina PDF',
  },
}

export default it
