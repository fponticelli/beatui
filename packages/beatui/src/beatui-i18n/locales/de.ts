import { formatFileSize } from '@/utils'
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
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (max ${formattedSize})`
    }

    return instruction
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
    linkDialogTitle: 'Link bearbeiten',
    linkDialogUrl: 'URL',
    linkUrlPlaceholder: 'https://beispiel.com',
    linkDialogSave: 'Speichern',
    linkDialogCancel: 'Abbrechen',
    linkDialogRemoveLink: 'Link entfernen',
  },
}

export default de
