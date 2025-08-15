import { formatFileSize } from '@/utils'
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
  unknownType: 'Onbekend type',
  fileInputInstructions: (
    allowMultiple: boolean,
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction = allowMultiple
      ? 'Klik om te kiezen of sleep bestanden hierheen'
      : 'Klik om te kiezen of sleep een bestand hierheen'

    if (allowMultiple && (maxFiles || maxFileSize)) {
      const constraints: string[] = []

      if (maxFiles) {
        constraints.push(
          maxFiles === 1 ? 'tot 1 bestand' : `tot ${maxFiles} bestanden`
        )
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
    } else if (!allowMultiple && maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (max ${formattedSize})`
    }

    return instruction
  },
}

export default nl
