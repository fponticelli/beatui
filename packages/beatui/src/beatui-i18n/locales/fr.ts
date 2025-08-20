import { formatFileSize } from '@/utils'
import { BeatUIMessages } from '../default'

const fr: BeatUIMessages = {
  loadingExtended: 'Chargement, veuillez patienter',
  loadingShort: 'Chargement...',
  locale: 'Langue',
  iconDescription: 'Icône',
  loadingIcon: 'Icône de chargement',
  failedToLoadIcon: "Échec du chargement de l'icône",
  editLabel: 'Modifier',
  selectOne: 'Sélectionner un',
  passwordPlaceholderText: 'Mot de passe secret',
  togglePasswordVisibility: 'Basculer la visibilité du mot de passe',
  toggleMenu: 'Basculer le menu',
  toggleAside: 'Basculer le panneau latéral',
  mainNavigation: 'Navigation principale',
  sidebar: 'Barre latérale',
  closeDrawer: 'Fermer le tiroir',
  closeModal: 'Fermer la modale',
  confirm: 'Confirmer',
  cancel: 'Annuler',
  addLabel: 'Ajouter',
  removeItem: 'Supprimer l’élément',
  // languages
  currentLocale: 'Français',
  ar: 'Arabe',
  de: 'Allemand',
  en: 'Anglais',
  es: 'Espagnol',
  fr: 'Français',
  hi: 'Hindi',
  it: 'Italien',
  ja: 'Japonais',
  ko: 'Coréen',
  nl: 'Néerlandais',
  pl: 'Polonais',
  pt: 'Portuguais',
  ru: 'Russe',
  tr: 'Turc',
  vi: 'Vietnamien',
  zh: 'Chinois',
  he: 'Hébreu',
  fa: 'Persan',
  ur: 'Ourdou',
  // input
  emailPlaceholderText: 'Entrez votre e-mail',
  incrementValue: 'Incrémenter la valeur',
  decrementValue: 'Décrémenter la valeur',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Cliquez pour choisir ou glissez des fichiers ici, ou appuyez sur Entrée ou Espace pour ouvrir le sélecteur de fichiers'
      : 'Glissez des fichiers ici',
  // size
  fileSizeUnits: ['Octets', 'Ko', 'Mo', 'Go', 'To'],
  // file input
  removeFile: 'Supprimer le fichier',
  clearAllFiles: 'Effacer tous les fichiers',
  unknownType: 'Type inconnu',
  fileInputInstructions: (
    allowMultiple: boolean,
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction = allowMultiple
      ? 'Cliquez pour choisir ou glissez des fichiers ici'
      : 'Cliquez pour choisir ou glissez un fichier ici'

    if (allowMultiple && (maxFiles || maxFileSize)) {
      const constraints: string[] = []

      if (maxFiles) {
        constraints.push(
          maxFiles === 1 ? "jusqu'à 1 fichier" : `jusqu'à ${maxFiles} fichiers`
        )
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`max ${formattedSize} chacun`)
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

export default fr
