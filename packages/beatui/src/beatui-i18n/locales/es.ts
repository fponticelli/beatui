import { formatFileSize } from '@/utils'
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
  unknownType: 'Tipo desconocido',
  fileInputInstructions: (
    allowMultiple: boolean,
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction = allowMultiple
      ? 'Haz clic para elegir o arrastra archivos aquí'
      : 'Haz clic para elegir o arrastra un archivo aquí'

    if (allowMultiple && (maxFiles || maxFileSize)) {
      const constraints: string[] = []

      if (maxFiles) {
        constraints.push(
          maxFiles === 1 ? 'hasta 1 archivo' : `hasta ${maxFiles} archivos`
        )
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
    } else if (!allowMultiple && maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (máx ${formattedSize})`
    }

    return instruction
  },
}

export default es
