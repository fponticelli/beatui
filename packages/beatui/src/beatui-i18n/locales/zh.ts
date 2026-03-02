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
    lineHeight: '行高',
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
    tableActions: 'Table actions',
    insertRowAbove: 'Insert row above',
    insertRowBelow: 'Insert row below',
    insertColumnLeft: 'Insert column left',
    insertColumnRight: 'Insert column right',
    deleteRow: 'Delete row',
    deleteColumn: 'Delete column',
    deleteTable: 'Delete table',
  },
  // prosemirror
  dataTable: {
    sortAscending: '升序排列',
    sortDescending: '降序排列',
    clearSort: '清除排序',
    filterPlaceholder: '筛选...',
    clearFilter: '清除筛选',
    selectAll: '全选',
    deselectAll: '取消全选',
    selectedCount: (count: number) => `已选择 ${count} 项`,
    resetAll: '重置全部',
    noResults: '未找到结果',
    loading: '加载中...',
    // Filter panel
    filterPanelAddCondition: '添加条件',
    filterPanelApply: '应用',
    filterPanelClear: '清除筛选',
    filterPanelAnd: '且',
    filterPanelOr: '或',
    filterPanelContains: '包含',
    filterPanelNotContains: '不包含',
    filterPanelEquals: '等于',
    filterPanelNotEquals: '不等于',
    filterPanelStartsWith: '开头是',
    filterPanelEndsWith: '结尾是',
    filterPanelIsNull: '为空',
    filterPanelIsNotNull: '不为空',
    filterPanelGt: '大于',
    filterPanelGte: '大于或等于',
    filterPanelLt: '小于',
    filterPanelLte: '小于或等于',
    filterPanelBetween: '介于',
    filterPanelValuePlaceholder: '值...',
    sortMultiHint: '按住 Shift 可对多列排序',
    columnVisibility: '列',
    showAllColumns: '显示全部',
    // Column header menu
    menuSortAsc: '升序排列',
    menuSortDesc: '降序排列',
    menuClearSort: '清除排序',
    menuHideColumn: '隐藏列',
    menuChooseColumns: '选择列',
    menuResetColumns: '重置列',
    menuFilter: '筛选',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `行数：${filtered}  总行数：${total}`,
    // Tags filter
    filterTagsPlaceholder: '选择值...',
    // Group by
    groupCount: (count: number) => `${count} 项`,
    collapseGroup: '收起分组',
    expandGroup: '展开分组',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} 包含 "${val}"`,
      textNotContains: (col: string, val: string) => `${col} 不包含 "${val}"`,
      textEquals: (col: string, val: string) => `${col} 等于 "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} 不等于 "${val}"`,
      textStartsWith: (col: string, val: string) => `${col} 以 "${val}" 开头`,
      textEndsWith: (col: string, val: string) => `${col} 以 "${val}" 结尾`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) => `${col} 在 ${min} 到 ${max} 之间`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} 在 [${vals}] 中`,
      setNotIn: (col: string, vals: string) => `${col} 不在 [${vals}] 中`,
      booleanIs: (col: string, val: string) => `${col} 为 ${val}`,
      isNull: (col: string) => `${col} 为空`,
      isNotNull: (col: string) => `${col} 不为空`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' 且 '),
      compositeOr: (descriptions: string[]) => descriptions.join(' 或 '),
    },
  },
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
