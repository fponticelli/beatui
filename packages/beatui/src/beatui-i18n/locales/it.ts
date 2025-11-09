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

export default it
