import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const zh: BeatUIMessages = {
  loadingExtended: '正在加载，请稍候',
  loadingShort: '加载中...',
  locale: '语言',
  iconDescription: '图标',
  loadingIcon: '加载图标',
  failedToLoadIcon: '图标加载失败',
  editLabel: '编辑',
  selectOne: '选择一个',
  selectNone: '无',
  selectMany: '选择多个',
  noResults: '无结果',
  passwordPlaceholderText: '密码',
  togglePasswordVisibility: '切换密码可见性',
  toggleMenu: '切换菜单',
  toggleAside: '切换侧边栏',
  mainNavigation: '主导航',
  sidebar: '侧边栏',
  closeDrawer: '关闭抽屉',
  closeModal: '关闭模态框',
  confirm: '确认',
  cancel: '取消',
  addLabel: '添加',
  removeItem: '删除项目',
  // languages
  currentLocale: '简体中文',
  ar: '阿拉伯语',
  de: '德语',
  en: '英语',
  es: '西班牙语',
  fr: '法语',
  hi: ' Hindi',
  it: '意大利语',
  ja: '日语',
  ko: '韩语',
  nl: '荷兰语',
  pl: '波兰语',
  pt: '葡萄牙语',
  ru: '俄语',
  tr: '土耳其语',
  vi: '越南语',
  zh: '简体中文',
  he: '希伯来语',
  fa: '波斯语',
  ur: '乌尔都语',
  // input
  emailPlaceholderText: '请输入邮箱',
  incrementValue: '增加值',
  decrementValue: '减少值',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? '点击选择或将文件拖拽到此处，或按 Enter 或空格键打开文件选择器'
      : '将文件拖拽到此处',
  // size
  fileSizeUnits: ['字节', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: '删除文件',
  clearAllFiles: '清除所有文件',
  // inputs reset
  clearValue: '清除值',
  unknownType: '未知类型',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? '点击选择或将文件拖拽到此处'
        : '点击选择或将文件拖拽到此处'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`最多${maxFiles}个文件`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`每个最大${formattedSize}`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join('，')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: '分页',
  firstPage: '第一页',
  previousPage: '上一页',
  nextPage: '下一页',
  lastPage: '最后一页',
  // Breadcrumbs
  breadcrumbs: '面包屑导航',
  // Command palette
  commandPalette: '命令面板',
  typeACommand: '输入命令...',
  noResultsFound: '未找到结果',
  noMatchingCommands: '没有匹配的命令',
  // Appearance
  appearanceSystem: '跟随系统',
  appearanceLight: '浅色',
  appearanceDark: '深色',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation: '更改类型将清除当前值。是否继续？',
  // Notifications
  notifications: '通知',
  markAllAsRead: '全部标为已读',
  noNotifications: '没有通知',
  // JSON Schema
  schemaConflictsDetected: '检测到架构冲突',
  schemaViolationsDetected: '检测到架构违规',
  properties: '属性',
  // File upload
  uploading: '上传中...',
  dropFilesOrBrowse: '将文件拖放到此处或点击浏览',
  acceptedTypes: (types: string) => `支持的类型：${types}`,
  // Rich text
  enterUrlPrompt: '请输入网址：',
  exceeded: '(已超出)',
  // PDF
  pdfPreview: 'PDF 预览',
  // Lexical editor
  lexical: {
    fontFamily: '字体',
    fontSize: '字号',
    fontColor: '字体颜色',
    highlightColor: '高亮颜色',
    backgroundColor: '背景颜色',
    bold: '粗体',
    italic: '斜体',
    underline: '下划线',
    strikethrough: '删除线',
    code: '代码',
    clearFormatting: '清除格式',
    normal: '正文',
    heading: (level: number) => `标题 ${level}`,
    bulletList: '无序列表',
    orderedList: '有序列表',
    checkList: '任务列表',
    indent: '增加缩进',
    outdent: '减少缩进',
    blockquote: '引用',
    codeBlock: '代码块',
    horizontalRule: '水平分割线',
    insertTable: '插入表格',
    link: '链接',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    defaultOption: '默认',
    slashCommands: '斜杠命令',
    noCommandsFound: '未找到命令',
    changeBlockType: '更改块类型',
    blockTypes: '块类型',
    enterUrl: '输入网址：',
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
    loading: '正在加载PDF...',
    loadFailed: '加载PDF失败',
    invalidPdf: '无效的PDF文件',
    pageOutOfRange: (page: number, total: number) =>
      `页面 ${page} 超出范围 (1-${total})`,
    renderFailed: '渲染PDF页面失败',
  },
}

export default zh
