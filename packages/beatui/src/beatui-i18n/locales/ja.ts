import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

export const ja: BeatUIMessages = {
  loadingExtended: '読み込み中です、お待ちください',
  loadingShort: '読み込み中...',
  locale: 'ロケール',
  iconDescription: 'アイコン',
  loadingIcon: '読み込みアイコン',
  failedToLoadIcon: 'アイコンの読み込みに失敗しました',
  editLabel: '編集',
  selectOne: '一つ選択',
  selectNone: 'なし',
  selectMany: '複数選択',
  noResults: '結果なし',
  passwordPlaceholderText: 'パスワード',
  togglePasswordVisibility: 'パスワードの表示を切り替え',
  toggleMenu: 'メニューを切り替え',
  toggleAside: 'サイドパネルを切り替え',
  mainNavigation: 'メインナビゲーション',
  sidebar: 'サイドバー',
  closeDrawer: 'ドロワーを閉じる',
  closeModal: 'モーダルを閉じる',
  confirm: '確認',
  cancel: 'キャンセル',
  addLabel: '追加',
  removeItem: '項目を削除',
  // languages
  currentLocale: '日本語',
  ar: 'アラビア語',
  de: 'ドイツ語',
  en: '英語',
  es: 'スペイン語',
  fr: 'フランス語',
  hi: 'ヒンディー語',
  it: 'イタリア語',
  ja: '日本語',
  ko: '韓国語',
  nl: 'オランダ語',
  pl: 'ポーランド語',
  pt: 'ポルトガル語',
  ru: 'ロシア語',
  tr: 'トルコ語',
  vi: 'ベトナム語',
  zh: '中国語',
  he: 'ヘブライ語',
  fa: 'ペルシア語',
  ur: 'ウルドゥー語',
  // input
  emailPlaceholderText: 'メールアドレスを入力',
  incrementValue: '値を増加',
  decrementValue: '値を減少',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'クリックして選択するか、ファイルをここにドラッグ、またはEnterキーまたはSpaceキーを押してファイル選択を開く'
      : 'ファイルをここにドラッグ',
  // size
  fileSizeUnits: ['バイト', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'ファイルを削除',
  clearAllFiles: 'すべてのファイルを削除',
  // inputs reset
  clearValue: 'リセット',
  unknownType: '不明なタイプ',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'クリックして選択するか、ファイルをここにドラッグ'
        : 'クリックして選択するか、ファイルをここにドラッグ'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`最大${maxFiles}ファイル`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`各${formattedSize}以下`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join('、')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'ページネーション',
  firstPage: '最初のページ',
  previousPage: '前のページ',
  nextPage: '次のページ',
  lastPage: '最後のページ',
  // Breadcrumbs
  breadcrumbs: 'パンくずリスト',
  // Command palette
  commandPalette: 'コマンドパレット',
  typeACommand: 'コマンドを入力...',
  noResultsFound: '結果が見つかりません',
  noMatchingCommands: '一致するコマンドがありません',
  // Appearance
  appearanceSystem: 'システム',
  appearanceLight: 'ライト',
  appearanceDark: 'ダーク',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    '型を変更すると現在の値がクリアされます。続行しますか？',
  // Notifications
  notifications: '通知',
  markAllAsRead: 'すべて既読にする',
  noNotifications: '通知はありません',
  // JSON Schema
  schemaConflictsDetected: 'スキーマの競合が検出されました',
  schemaViolationsDetected: 'スキーマ違反が検出されました',
  properties: 'プロパティ',
  // File upload
  uploading: 'アップロード中...',
  dropFilesOrBrowse: 'ファイルをここにドロップするか、クリックして参照',
  acceptedTypes: (types: string) => `対応形式: ${types}`,
  // Rich text
  enterUrlPrompt: 'URLを入力:',
  exceeded: '(超過)',
  // PDF
  pdfPreview: 'PDFプレビュー',
  // Lexical editor
  lexical: {
    fontFamily: 'フォントファミリー',
    fontSize: 'フォントサイズ',
    lineHeight: '行の高さ',
    fontColor: 'フォントの色',
    highlightColor: 'ハイライトの色',
    backgroundColor: '背景色',
    bold: '太字',
    italic: '斜体',
    underline: '下線',
    strikethrough: '取り消し線',
    code: 'コード',
    clearFormatting: '書式をクリア',
    normal: '標準',
    heading: (level: number) => `見出し ${level}`,
    bulletList: '箇条書き',
    orderedList: '番号付きリスト',
    checkList: 'チェックリスト',
    indent: 'インデントを増やす',
    outdent: 'インデントを減らす',
    blockquote: '引用',
    codeBlock: 'コードブロック',
    horizontalRule: '水平線',
    insertTable: '表を挿入',
    link: 'リンク',
    undo: '元に戻す',
    redo: 'やり直し',
    cut: '切り取り',
    copy: 'コピー',
    paste: '貼り付け',
    defaultOption: 'デフォルト',
    slashCommands: 'スラッシュコマンド',
    noCommandsFound: 'コマンドが見つかりません',
    changeBlockType: 'ブロックタイプを変更',
    blockTypes: 'ブロックタイプ',
    enterUrl: 'URLを入力:',
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
  prosemirror: {
    bold: '太字',
    italic: '斜体',
    code: 'インラインコード',
    link: 'リンクを挿入',
    removeLink: 'リンクを削除',
    heading: (level: number) => `見出し ${level}`,
    bulletList: '箇条書き',
    orderedList: '番号付きリスト',
    blockquote: '引用',
    codeBlock: 'コードブロック',
    horizontalRule: '水平線',
    linkUrlPlaceholder: 'https://example.com',
  },
  // PDF Page Viewer
  pdfPageViewer: {
    loading: 'PDFを読み込み中...',
    loadFailed: 'PDFの読み込みに失敗しました',
    invalidPdf: '無効なPDFファイル',
    pageOutOfRange: (page: number, total: number) =>
      `ページ ${page} は範囲外です (1-${total})`,
    renderFailed: 'PDFページのレンダリングに失敗しました',
  },
}

export default ja
