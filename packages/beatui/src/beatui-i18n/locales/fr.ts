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
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `Lignes ${from} à ${to} sur ${filtered} sur ${total}`
      : `Lignes ${from} à ${to} sur ${filtered}`,
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
    'Changer le type effacera la valeur actuelle. Continuer ?',
  // Notifications
  notifications: 'Notifications',
  markAllAsRead: 'Tout marquer comme lu',
  noNotifications: 'Aucune notification',
  // JSON Schema
  schemaConflictsDetected: 'Conflits de schéma détectés',
  schemaViolationsDetected: 'Violations de schéma détectées',
  properties: 'Propriétés',
  // File upload
  uploading: 'Téléversement...',
  dropFilesOrBrowse: 'Déposez les fichiers ici ou cliquez pour parcourir',
  acceptedTypes: (types: string) => `Types acceptés : ${types}`,
  // Rich text
  enterUrlPrompt: "Saisir l'URL :",
  exceeded: '(dépassé)',
  // PDF
  pdfPreview: 'Aperçu PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Police de caractères',
    fontSize: 'Taille de police',
    lineHeight: 'Hauteur de ligne',
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
    tableActions: 'Actions du tableau',
    insertRowAbove: 'Insérer une ligne au-dessus',
    insertRowBelow: 'Insérer une ligne en-dessous',
    insertColumnLeft: 'Insérer une colonne à gauche',
    insertColumnRight: 'Insérer une colonne à droite',
    deleteRow: 'Supprimer la ligne',
    deleteColumn: 'Supprimer la colonne',
    deleteTable: 'Supprimer le tableau',
  },
  // prosemirror
  dataTable: {
    sortAscending: 'Tri croissant',
    sortDescending: 'Tri décroissant',
    clearSort: 'Effacer le tri',
    filterPlaceholder: 'Filtrer...',
    clearFilter: 'Effacer le filtre',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    selectedCount: (count: number) => `${count} sélectionnés`,
    resetAll: 'Tout réinitialiser',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    // Filter panel
    filterPanelAddCondition: 'Ajouter une condition',
    filterPanelApply: 'Appliquer',
    filterPanelClear: 'Effacer les filtres',
    filterPanelAnd: 'ET',
    filterPanelOr: 'OU',
    filterPanelContains: 'Contient',
    filterPanelNotContains: 'Ne contient pas',
    filterPanelEquals: 'Est égal à',
    filterPanelNotEquals: "N'est pas égal à",
    filterPanelStartsWith: 'Commence par',
    filterPanelEndsWith: 'Se termine par',
    filterPanelIsNull: 'Est vide',
    filterPanelIsNotNull: "N'est pas vide",
    filterPanelGt: 'Supérieur à',
    filterPanelGte: 'Supérieur ou égal',
    filterPanelLt: 'Inférieur à',
    filterPanelLte: 'Inférieur ou égal',
    filterPanelBetween: 'Entre',
    filterPanelValuePlaceholder: 'Valeur...',
    sortMultiHint: 'Maintenez Shift pour trier plusieurs colonnes',
    columnVisibility: 'Colonnes',
    showAllColumns: 'Tout afficher',
    // Column header menu
    menuSortAsc: 'Tri croissant',
    menuSortDesc: 'Tri décroissant',
    menuClearSort: 'Supprimer le tri',
    menuHideColumn: 'Masquer la colonne',
    menuChooseColumns: 'Choisir les colonnes',
    menuResetColumns: 'Réinitialiser les colonnes',
    menuFilter: 'Filtrer',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Lignes : ${filtered}  Total des lignes : ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Sélectionner des valeurs...',
    // Group by
    groupCount: (count: number) => `${count} éléments`,
    collapseGroup: 'Réduire le groupe',
    expandGroup: 'Développer le groupe',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} contient "${val}"`,
      textNotContains: (col: string, val: string) =>
        `${col} ne contient pas "${val}"`,
      textEquals: (col: string, val: string) => `${col} est égal à "${val}"`,
      textNotEquals: (col: string, val: string) =>
        `${col} n'est pas égal à "${val}"`,
      textStartsWith: (col: string, val: string) =>
        `${col} commence par "${val}"`,
      textEndsWith: (col: string, val: string) =>
        `${col} se termine par "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} entre ${min} et ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} dans [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} pas dans [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} est ${val}`,
      isNull: (col: string) => `${col} est vide`,
      isNotNull: (col: string) => `${col} n'est pas vide`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' ET '),
      compositeOr: (descriptions: string[]) => descriptions.join(' OU '),
    },
  },
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
