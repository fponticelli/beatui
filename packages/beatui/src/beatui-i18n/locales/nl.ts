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

export default nl
