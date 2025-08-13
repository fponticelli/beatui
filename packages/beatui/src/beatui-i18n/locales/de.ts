import { BeatUIMessages } from '../default'

const de: BeatUIMessages = {
  loadingExtended: () => 'Lädt, bitte warten',
  loadingShort: () => 'Lädt...',
  iconDescription: () => 'Symbol',
  loadingIcon: () => 'Ladesymbol',
  locale: () => 'Landesvariante',
  failedToLoadIcon: () => 'Symbol konnte nicht geladen werden',
  editLabel: () => 'Bearbeiten',
  selectOne: () => 'Eines auswählen',
  passwordPlaceholderText: () => 'Geheimes Passwort',
  togglePasswordVisibility: () => 'Passwort-Sichtbarkeit umschalten',
  toggleMenu: () => 'Menü umschalten',
  toggleAside: () => 'Seitenleiste umschalten',
  mainNavigation: () => 'Hauptnavigation',
  sidebar: () => 'Seitenleiste',
  closeDrawer: () => 'Schublade schließen',
  closeModal: () => 'Modal schließen',
  confirm: () => 'Bestätigen',
  cancel: () => 'Abbrechen',
  // languages
  currentLocale: () => 'Deutsch',
  ar: () => 'Arabisch',
  de: () => 'Deutsch',
  en: () => 'Englisch',
  es: () => 'Spanisch',
  fr: () => 'Französisch',
  hi: () => 'Hindi',
  it: () => 'Italienisch',
  ja: () => 'Japanisch',
  ko: () => 'Koreanisch',
  nl: () => 'Niederländisch',
  pl: () => 'Polnisch',
  pt: () => 'Portugiesisch',
  ru: () => 'Russisch',
  tr: () => 'Türkisch',
  vi: () => 'Vietnamesisch',
  zh: () => 'Chinesisch',
  he: () => 'Hebräisch',
  fa: () => 'Persisch',
  ur: () => 'Urdu',
  // input
  emailPlaceholderText: () => 'E-Mail eingeben',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Klicken zum Auswählen oder Dateien hierher ziehen, oder Enter oder Leertaste drücken, um Dateiauswahl zu öffnen'
      : 'Dateien hierher ziehen',
  // size
  fileSizeUnits: () => ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: () => 'Datei entfernen',
  clearAllFiles: () => 'Alle Dateien löschen',
  unknownType: () => 'Unbekannter Typ',
  fileInputInstructions: () =>
    'Klicken zum Auswählen oder Dateien hierher ziehen',
}

export default de
