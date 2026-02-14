import { formatFileSize } from '../../utils'
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
  selectNone: 'Aucun',
  selectMany: 'Sélectionner plusieurs',
  noResults: 'Aucun résultat',
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
  // inputs reset
  clearValue: 'Réinitialiser',

  unknownType: 'Type inconnu',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Cliquez pour choisir ou glissez des fichiers ici'
        : 'Cliquez pour choisir ou glissez un fichier ici'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`jusqu'à ${maxFiles} fichiers`)
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
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Pagination',
  firstPage: 'Première page',
  previousPage: 'Page précédente',
  nextPage: 'Page suivante',
  lastPage: 'Dernière page',
  // Breadcrumbs
  breadcrumbs: "Fil d'Ariane",
  // Command palette
  commandPalette: 'Palette de commandes',
  typeACommand: 'Saisir une commande...',
  noResultsFound: 'Aucun résultat trouvé',
  noMatchingCommands: 'Aucune commande correspondante',
  // Appearance
  appearanceSystem: 'Système',
  appearanceLight: 'Clair',
  appearanceDark: 'Sombre',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    'Changing type will clear the current value. Continue?',
  // Notifications
  notifications: 'Notifications',
  markAllAsRead: 'Mark all as read',
  noNotifications: 'No notifications',
  // JSON Schema
  schemaConflictsDetected: 'Schema Conflicts Detected',
  schemaViolationsDetected: 'Schema Violations Detected',
  properties: 'Properties',
  // File upload
  uploading: 'Uploading...',
  dropFilesOrBrowse: 'Drop files here or click to browse',
  acceptedTypes: (types: string) => `Accepted types: ${types}`,
  // Rich text
  enterUrlPrompt: 'Enter URL:',
  exceeded: '(exceeded)',
  // PDF
  pdfPreview: 'Aperçu PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Police de caractères',
    fontSize: 'Taille de police',
    fontColor: 'Couleur de police',
    highlightColor: 'Couleur de surbrillance',
    backgroundColor: "Couleur d'arrière-plan",
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligné',
    strikethrough: 'Barré',
    code: 'Code',
    clearFormatting: 'Effacer la mise en forme',
    normal: 'Normal',
    heading: (level: number) => `Titre ${level}`,
    bulletList: 'Liste à puces',
    orderedList: 'Liste numérotée',
    checkList: 'Liste de contrôle',
    indent: 'Augmenter le retrait',
    outdent: 'Diminuer le retrait',
    blockquote: 'Citation',
    codeBlock: 'Bloc de code',
    horizontalRule: 'Ligne horizontale',
    insertTable: 'Insérer un tableau',
    link: 'Lien',
    undo: 'Annuler',
    redo: 'Rétablir',
    cut: 'Couper',
    copy: 'Copier',
    paste: 'Coller',
    defaultOption: 'Par défaut',
    slashCommands: 'Commandes barre oblique',
    noCommandsFound: 'Aucune commande trouvée',
    changeBlockType: 'Changer le type de bloc',
    blockTypes: 'Types de bloc',
    enterUrl: "Saisir l'URL :",
  },
  // prosemirror
  prosemirror: {
    bold: 'Gras',
    italic: 'Italique',
    code: 'Code en ligne',
    link: 'Insérer un lien',
    removeLink: 'Supprimer le lien',
    heading: (level: number) => `Titre ${level}`,
    bulletList: 'Liste à puces',
    orderedList: 'Liste numérotée',
    blockquote: 'Citation',
    codeBlock: 'Bloc de code',
    horizontalRule: 'Ligne horizontale',
    linkUrlPlaceholder: 'https://exemple.com',
  },
  // PDF Page Viewer
  pdfPageViewer: {
    loading: 'Chargement du PDF...',
    loadFailed: 'Échec du chargement du PDF',
    invalidPdf: 'Fichier PDF invalide',
    pageOutOfRange: (page: number, total: number) =>
      `La page ${page} est hors limites (1-${total})`,
    renderFailed: 'Échec du rendu de la page PDF',
  },
}

export default fr
