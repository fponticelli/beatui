import { formatFileSize } from '../../utils'
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
  selectNone: 'Nenhum',
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
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Paginacao',
  firstPage: 'Primeira pagina',
  previousPage: 'Pagina anterior',
  nextPage: 'Proxima pagina',
  lastPage: 'Ultima pagina',
  // Breadcrumbs
  breadcrumbs: 'Breadcrumbs',
  // Command palette
  commandPalette: 'Paleta de comandos',
  typeACommand: 'Digite um comando...',
  noResultsFound: 'Nenhum resultado encontrado',
  noMatchingCommands: 'Nenhum comando correspondente',
  // Appearance
  appearanceSystem: 'Sistema',
  appearanceLight: 'Claro',
  appearanceDark: 'Escuro',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation: 'Alterar o tipo apagará o valor atual. Continuar?',
  // Notifications
  notifications: 'Notificações',
  markAllAsRead: 'Marcar tudo como lido',
  noNotifications: 'Nenhuma notificação',
  // JSON Schema
  schemaConflictsDetected: 'Conflitos de esquema detectados',
  schemaViolationsDetected: 'Violações de esquema detectadas',
  properties: 'Propriedades',
  // File upload
  uploading: 'Enviando...',
  dropFilesOrBrowse: 'Arraste arquivos aqui ou clique para navegar',
  acceptedTypes: (types: string) => `Tipos aceitos: ${types}`,
  // Rich text
  enterUrlPrompt: 'Digite a URL:',
  exceeded: '(excedido)',
  // PDF
  pdfPreview: 'Visualizacao do PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Familia da fonte',
    fontSize: 'Tamanho da fonte',
    fontColor: 'Cor da fonte',
    highlightColor: 'Cor de destaque',
    backgroundColor: 'Cor de fundo',
    bold: 'Negrito',
    italic: 'Italico',
    underline: 'Sublinhado',
    strikethrough: 'Tachado',
    code: 'Codigo',
    clearFormatting: 'Limpar formatacao',
    normal: 'Normal',
    heading: (level: number) => `Titulo ${level}`,
    bulletList: 'Lista com marcadores',
    orderedList: 'Lista numerada',
    checkList: 'Lista de verificacao',
    indent: 'Aumentar recuo',
    outdent: 'Diminuir recuo',
    blockquote: 'Citacao',
    codeBlock: 'Bloco de codigo',
    horizontalRule: 'Linha horizontal',
    insertTable: 'Inserir tabela',
    link: 'Link',
    undo: 'Desfazer',
    redo: 'Refazer',
    cut: 'Recortar',
    copy: 'Copiar',
    paste: 'Colar',
    defaultOption: 'Padrao',
    slashCommands: 'Comandos de barra',
    noCommandsFound: 'Nenhum comando encontrado',
    changeBlockType: 'Alterar tipo de bloco',
    blockTypes: 'Tipos de bloco',
    enterUrl: 'Digite a URL:',
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
  // PDF Page Viewer
  pdfPageViewer: {
    loading: 'Carregando PDF...',
    loadFailed: 'Falha ao carregar PDF',
    invalidPdf: 'Arquivo PDF inválido',
    pageOutOfRange: (page: number, total: number) =>
      `A página ${page} está fora do intervalo (1-${total})`,
    renderFailed: 'Falha ao renderizar página do PDF',
  },
}

export default pt
