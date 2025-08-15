import { formatFileSize } from '@/utils'
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
  unknownType: 'Nieznany typ',
  fileInputInstructions: (
    allowMultiple: boolean,
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction = allowMultiple
      ? 'Kliknij aby wybrać lub przeciągnij pliki tutaj'
      : 'Kliknij aby wybrać lub przeciągnij plik tutaj'

    if (allowMultiple && (maxFiles || maxFileSize)) {
      const constraints: string[] = []

      if (maxFiles) {
        constraints.push(
          maxFiles === 1 ? 'do 1 pliku' : `do ${maxFiles} plików`
        )
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
    } else if (!allowMultiple && maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (maks ${formattedSize})`
    }

    return instruction
  },
}

export default pl
