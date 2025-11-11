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
