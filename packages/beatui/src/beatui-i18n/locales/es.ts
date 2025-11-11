import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const es: BeatUIMessages = {
  loadingExtended: 'Cargando, por favor espere',
  loadingShort: 'Cargando...',
  locale: 'Idioma',
  iconDescription: 'Icono',
  loadingIcon: 'Icono de carga',
  failedToLoadIcon: 'Error al cargar el icono',
  editLabel: 'Editar',
  selectOne: 'Seleccionar uno',
  selectMany: 'Seleccionar varios',
  noResults: 'Sin resultados',
  passwordPlaceholderText: 'Contraseña Secreta',
  togglePasswordVisibility: 'Alternar visibilidad de contraseña',
  toggleMenu: 'Alternar menú',
  toggleAside: 'Alternar panel lateral',
  mainNavigation: 'Navegación principal',
  sidebar: 'Barra lateral',
  closeDrawer: 'Cerrar cajón',
  closeModal: 'Cerrar modal',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  addLabel: 'Agregar',
  removeItem: 'Eliminar elemento',
  // languages
  currentLocale: 'Español',
  ar: 'Árabe',
  de: 'Alemán',
  en: 'Inglés',
  es: 'Español',
  fr: 'Francés',
  hi: 'Hindi',
  it: 'Italiano',
  ja: 'Japonés',
  ko: 'Coreano',
  nl: 'Neerlandés',
  pl: 'Polaco',
  pt: 'Portugués',
  ru: 'Ruso',
  tr: 'Turco',
  vi: 'Vietnamita',
  zh: 'Chino',
  he: 'Hebreo',
  fa: 'Persa',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'Correo electrónico',
  incrementValue: 'Incrementar valor',
  decrementValue: 'Decrementar valor',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Haz clic para elegir o arrastra archivos aquí, o presiona Enter o Espacio para abrir el selector de archivos'
      : 'Arrastra archivos aquí',
  // size
  fileSizeUnits: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Eliminar archivo',
  clearAllFiles: 'Borrar todos los archivos',
  // inputs reset
  clearValue: 'Borrar valor',
  unknownType: 'Tipo desconocido',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Haz clic para elegir o arrastra archivos aquí'
        : 'Haz clic para elegir o arrastra un archivo aquí'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`hasta ${maxFiles} archivos`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`máx ${formattedSize} cada uno`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // prosemirror
  prosemirror: {
    bold: 'Negrita',
    italic: 'Cursiva',
    code: 'Código en línea',
    link: 'Insertar enlace',
    removeLink: 'Eliminar enlace',
    heading: (level: number) => `Encabezado ${level}`,
    bulletList: 'Lista con viñetas',
    orderedList: 'Lista numerada',
    blockquote: 'Cita',
    codeBlock: 'Bloque de código',
    horizontalRule: 'Línea horizontal',
    linkUrlPlaceholder: 'https://ejemplo.com',
  },
  // PDF Page Viewer
  pdfPageViewer: {
    loading: 'Cargando PDF...',
    loadFailed: 'Error al cargar el PDF',
    invalidPdf: 'Archivo PDF inválido',
    pageOutOfRange: (page: number, total: number) =>
      `La página ${page} está fuera de rango (1-${total})`,
    renderFailed: 'Error al renderizar la página del PDF',
  },
}

export default es
