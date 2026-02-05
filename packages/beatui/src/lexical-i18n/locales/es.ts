const es = {
  // Toolbar actions
  bold: 'Negrita',
  italic: 'Cursiva',
  underline: 'Subrayado',
  strikethrough: 'Tachado',
  code: 'Código',
  heading1: 'Título 1',
  heading2: 'Título 2',
  heading3: 'Título 3',
  heading4: 'Título 4',
  heading5: 'Título 5',
  heading6: 'Título 6',
  bulletList: 'Lista con viñetas',
  orderedList: 'Lista numerada',
  checkList: 'Lista de verificación',
  quote: 'Cita',
  codeBlock: 'Bloque de código',
  divider: 'Separador',
  link: 'Enlace',
  table: 'Tabla',
  undo: 'Deshacer',
  redo: 'Rehacer',
  cut: 'Cortar',
  copy: 'Copiar',
  paste: 'Pegar',
  insertTable: 'Insertar tabla',
  indent: 'Aumentar sangría',
  outdent: 'Reducir sangría',
  fontFamily: 'Familia tipográfica',
  fontSize: 'Tamaño de fuente',
  fontColor: 'Color de fuente',
  highlightColor: 'Color de resaltado',
  backgroundColor: 'Color de fondo',
  clearFormatting: 'Borrar formato',

  // Slash commands
  slashCommandsTitle: 'Comandos',
  slashCommandsEmpty: 'No se encontraron comandos',
  slashCommandHeading1: 'Título 1',
  slashCommandHeading1Desc: 'Encabezado de sección grande',
  slashCommandHeading2: 'Título 2',
  slashCommandHeading2Desc: 'Encabezado de sección mediano',
  slashCommandHeading3: 'Título 3',
  slashCommandHeading3Desc: 'Encabezado de sección pequeño',
  slashCommandBulletList: 'Lista con viñetas',
  slashCommandBulletListDesc: 'Crear una lista con viñetas',
  slashCommandOrderedList: 'Lista numerada',
  slashCommandOrderedListDesc: 'Crear una lista numerada',
  slashCommandQuote: 'Cita',
  slashCommandQuoteDesc: 'Insertar una cita',
  slashCommandCodeBlock: 'Bloque de código',
  slashCommandCodeBlockDesc: 'Insertar un bloque de código',
  slashCommandDivider: 'Separador',
  slashCommandDividerDesc: 'Insertar una línea horizontal',
  slashCommandTable: 'Tabla',
  slashCommandTableDesc: 'Insertar una tabla',

  // Table actions
  insertRowAbove: 'Insertar fila arriba',
  insertRowBelow: 'Insertar fila abajo',
  insertColumnLeft: 'Insertar columna izquierda',
  insertColumnRight: 'Insertar columna derecha',
  deleteRow: 'Eliminar fila',
  deleteColumn: 'Eliminar columna',
  deleteTable: 'Eliminar tabla',

  // Link actions
  linkUrl: 'URL',
  linkUrlPlaceholder: 'https://ejemplo.com',
  linkText: 'Texto',
  linkTextPlaceholder: 'Texto del enlace',
  linkInsert: 'Insertar enlace',
  linkEdit: 'Editar enlace',
  linkRemove: 'Eliminar enlace',
  linkOpen: 'Abrir enlace',

  // Code block
  codeLanguage: 'Idioma',
  codeLanguagePlaceholder: 'Seleccionar idioma',

  // File operations
  exportMarkdown: 'Exportar como Markdown',
  exportHtml: 'Exportar como HTML',
  exportJson: 'Exportar como JSON',
  importFile: 'Importar archivo',

  // Character count
  characterCount: (count: number) => `${count} caracteres`,
  characterCountWithMax: (count: number, max: number) =>
    `${count} / ${max} caracteres`,
  characterCountExceeded: 'Límite de caracteres excedido',

  // Errors
  errorGeneric: 'Ocurrió un error',
  errorLoadFailed: 'Error al cargar el editor',
  errorSaveFailed: 'Error al guardar el contenido',

  // Placeholder
  placeholder: 'Comienza a escribir...',
  placeholderEmpty: 'Escribe / para comandos',

  // Accessibility
  a11yEditor: 'Editor de texto enriquecido',
  a11yToolbar: 'Barra de herramientas del editor',
  a11yFloatingToolbar: 'Barra de herramientas flotante',
  a11ySlashCommands: 'Menú de comandos',
  a11yTableControls: 'Menú de controles de tabla',
  a11yCodeLanguage: 'Selector de lenguaje de código',
}

export default es
