import { formatFileSize } from '@/utils'
import { BeatUIMessages } from '../default'

const pt: BeatUIMessages = {
  loadingExtended: 'Carregando, por favor aguarde',
  loadingShort: 'Carregando...',
  locale: 'Idioma',
  iconDescription: 'Ícone',
  loadingIcon: 'Ícone de carregamento',
  failedToLoadIcon: 'Falha ao carregar ícone',
  editLabel: 'Editar',
  selectOne: 'Selecionar um',
  selectMany: 'Selecionar vários',
  noResults: 'Sem resultados',
  passwordPlaceholderText: 'Senha Secreta',
  togglePasswordVisibility: 'Alternar visibilidade da senha',
  toggleMenu: 'Alternar menu',
  toggleAside: 'Alternar painel lateral',
  mainNavigation: 'Navegação principal',
  sidebar: 'Barra lateral',
  closeDrawer: 'Fechar gaveta',
  closeModal: 'Fechar modal',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  addLabel: 'Adicionar',
  removeItem: 'Remover item',
  // languages
  currentLocale: 'Português',
  ar: 'Árabe',
  de: 'Alemão',
  en: 'Inglês',
  es: 'Espanhol',
  fr: 'Francês',
  hi: 'Hindi',
  it: 'Italiano',
  ja: 'Japonês',
  ko: 'Coreano',
  nl: 'Holandês',
  pl: 'Polonês',
  pt: 'Português',
  ru: 'Russo',
  tr: 'Turco',
  vi: 'Vietnamita',
  zh: 'Chinês',
  he: 'Hebraico',
  fa: 'Persa',
  ur: 'Urdu',
  // input
  emailPlaceholderText: 'Digite seu e-mail',
  incrementValue: 'Incrementar valor',
  decrementValue: 'Decrementar valor',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Clique para escolher ou arraste arquivos aqui, ou pressione Enter ou Espaço para abrir o seletor de arquivos'
      : 'Arraste arquivos aqui',
  // size
  fileSizeUnits: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Remover arquivo',
  clearAllFiles: 'Limpar todos os arquivos',
  // inputs reset
  clearValue: 'Limpar valor',
  unknownType: 'Tipo desconhecido',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Clique para escolher ou arraste arquivos aqui'
        : 'Clique para escolher ou arraste um arquivo aqui'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`até ${maxFiles} arquivos`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`máx ${formattedSize} cada`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (máx ${formattedSize})`
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
    linkDialogTitle: 'Edit Link',
    linkDialogUrl: 'URL',
    linkDialogUrlPlaceholder: 'https://example.com',
    linkDialogSave: 'Save',
    linkDialogCancel: 'Cancel',
    linkDialogRemoveLink: 'Remove link',
  },
}

export default pt
