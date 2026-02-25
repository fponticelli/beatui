const fr = {
  // Toolbar actions
  bold: 'Gras',
  italic: 'Italique',
  underline: 'Souligné',
  strikethrough: 'Barré',
  code: 'Code',
  heading1: 'Titre 1',
  heading2: 'Titre 2',
  heading3: 'Titre 3',
  heading4: 'Titre 4',
  heading5: 'Titre 5',
  heading6: 'Titre 6',
  bulletList: 'Liste à puces',
  orderedList: 'Liste numérotée',
  checkList: 'Liste de contrôle',
  quote: 'Citation',
  codeBlock: 'Bloc de code',
  divider: 'Séparateur',
  link: 'Lien',
  table: 'Tableau',
  undo: 'Annuler',
  redo: 'Refaire',
  cut: 'Couper',
  copy: 'Copier',
  paste: 'Coller',
  insertTable: 'Insérer un tableau',
  indent: 'Augmenter le retrait',
  outdent: 'Réduire le retrait',
  fontFamily: 'Police',
  fontSize: 'Taille de police',
  lineHeight: 'Hauteur de ligne',
  fontColor: 'Couleur de police',
  highlightColor: 'Couleur de surlignage',
  backgroundColor: 'Couleur de fond',
  clearFormatting: 'Effacer le formatage',

  // Slash commands
  slashCommandsTitle: 'Commandes',
  slashCommandsEmpty: 'Aucune commande trouvée',
  slashCommandHeading1: 'Titre 1',
  slashCommandHeading1Desc: 'Grand titre de section',
  slashCommandHeading2: 'Titre 2',
  slashCommandHeading2Desc: 'Titre de section moyen',
  slashCommandHeading3: 'Titre 3',
  slashCommandHeading3Desc: 'Petit titre de section',
  slashCommandBulletList: 'Liste à puces',
  slashCommandBulletListDesc: 'Créer une liste à puces',
  slashCommandOrderedList: 'Liste numérotée',
  slashCommandOrderedListDesc: 'Créer une liste numérotée',
  slashCommandQuote: 'Citation',
  slashCommandQuoteDesc: 'Insérer une citation',
  slashCommandCodeBlock: 'Bloc de code',
  slashCommandCodeBlockDesc: 'Insérer un bloc de code',
  slashCommandDivider: 'Séparateur',
  slashCommandDividerDesc: 'Insérer une ligne horizontale',
  slashCommandTable: 'Tableau',
  slashCommandTableDesc: 'Insérer un tableau',

  // Table actions
  insertRowAbove: 'Insérer une ligne au-dessus',
  insertRowBelow: 'Insérer une ligne en-dessous',
  insertColumnLeft: 'Insérer une colonne à gauche',
  insertColumnRight: 'Insérer une colonne à droite',
  deleteRow: 'Supprimer la ligne',
  deleteColumn: 'Supprimer la colonne',
  deleteTable: 'Supprimer le tableau',

  // Link actions
  linkUrl: 'URL',
  linkUrlPlaceholder: 'https://exemple.com',
  linkText: 'Texte',
  linkTextPlaceholder: 'Texte du lien',
  linkInsert: 'Insérer un lien',
  linkEdit: 'Modifier le lien',
  linkRemove: 'Supprimer le lien',
  linkOpen: 'Ouvrir le lien',

  // Code block
  codeLanguage: 'Langue',
  codeLanguagePlaceholder: 'Sélectionner la langue',

  // File operations
  exportMarkdown: 'Exporter en Markdown',
  exportHtml: 'Exporter en HTML',
  exportJson: 'Exporter en JSON',
  importFile: 'Importer un fichier',

  // Character count
  characterCount: (count: number) => `${count} caractères`,
  characterCountWithMax: (count: number, max: number) =>
    `${count} / ${max} caractères`,
  characterCountExceeded: 'Limite de caractères dépassée',

  // Errors
  errorGeneric: 'Une erreur est survenue',
  errorLoadFailed: "Échec du chargement de l'éditeur",
  errorSaveFailed: 'Échec de la sauvegarde du contenu',

  // Placeholder
  placeholder: 'Commencez à taper...',
  placeholderEmpty: 'Tapez / pour les commandes',

  // Accessibility
  a11yEditor: 'Éditeur de texte riche',
  a11yToolbar: "Barre d'outils de l'éditeur",
  a11yFloatingToolbar: "Barre d'outils flottante",
  a11ySlashCommands: 'Menu des commandes',
  a11yTableControls: 'Menu des contrôles de tableau',
  a11yCodeLanguage: 'Sélecteur de langage de code',
}

export default fr
