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
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
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
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `${total}件中${filtered}件の${from}〜${to}行`
      : `${filtered}件中${from}〜${to}行`,
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
  dataTable: {
    sortAscending: '昇順で並べ替え',
    sortDescending: '降順で並べ替え',
    clearSort: '並べ替えを解除',
    filterPlaceholder: 'フィルター...',
    clearFilter: 'フィルターを解除',
    selectAll: 'すべて選択',
    deselectAll: 'すべて選択解除',
    selectedCount: (count: number) => `${count}件選択中`,
    resetAll: 'すべてリセット',
    noResults: '結果が見つかりません',
    loading: '読み込み中...',
    // Filter panel
    filterPanelAddCondition: '条件を追加',
    filterPanelApply: '適用',
    filterPanelClear: 'フィルターをクリア',
    filterPanelAnd: 'かつ',
    filterPanelOr: 'または',
    filterPanelContains: '含む',
    filterPanelNotContains: '含まない',
    filterPanelEquals: '等しい',
    filterPanelNotEquals: '等しくない',
    filterPanelStartsWith: 'で始まる',
    filterPanelEndsWith: 'で終わる',
    filterPanelIsNull: '空である',
    filterPanelIsNotNull: '空でない',
    filterPanelGt: 'より大きい',
    filterPanelGte: '以上',
    filterPanelLt: 'より小さい',
    filterPanelLte: '以下',
    filterPanelBetween: '範囲',
    filterPanelValuePlaceholder: '値...',
    sortMultiHint: 'Shiftキーを押しながら複数列をソート',
    columnVisibility: '列',
    showAllColumns: 'すべて表示',
    // Column header menu
    menuSortAsc: '昇順で並び替え',
    menuSortDesc: '降順で並び替え',
    menuClearSort: '並び替えをクリア',
    menuHideColumn: '列を非表示',
    menuChooseColumns: '列を選択',
    menuResetColumns: '列をリセット',
    menuFilter: 'フィルター',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `行数: ${filtered}  合計行数: ${total}`,
    // Tags filter
    filterTagsPlaceholder: '値を選択...',
    // Group by
    groupCount: (count: number) => `${count} 件`,
    collapseGroup: 'グループを折りたたむ',
    expandGroup: 'グループを展開',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} が "${val}" を含む`,
      textNotContains: (col: string, val: string) =>
        `${col} が "${val}" を含まない`,
      textEquals: (col: string, val: string) => `${col} が "${val}" に等しい`,
      textNotEquals: (col: string, val: string) =>
        `${col} が "${val}" に等しくない`,
      textStartsWith: (col: string, val: string) =>
        `${col} が "${val}" で始まる`,
      textEndsWith: (col: string, val: string) => `${col} が "${val}" で終わる`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} が ${min} ～ ${max} の間`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} が [${vals}] に含まれる`,
      setNotIn: (col: string, vals: string) =>
        `${col} が [${vals}] に含まれない`,
      booleanIs: (col: string, val: string) => `${col} は ${val}`,
      isNull: (col: string) => `${col} が空`,
      isNotNull: (col: string) => `${col} が空でない`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' かつ '),
      compositeOr: (descriptions: string[]) => descriptions.join(' または '),
    },
  },
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
  // Carousel
  carousel: {
    label: 'カルーセル',
    previousSlide: '前のスライド',
    nextSlide: '次のスライド',
    slideNavigation: 'スライドナビゲーション',
    slideOfTotal: (index: number, total: number) =>
      `スライド ${index} / ${total}`,
    goToSlide: (index: number) => `スライド ${index} へ移動`,
  },
  // Date picker
  datePicker: {
    label: '日付選択',
    previousYear: '前の年',
    previousMonth: '前の月',
    selectMonth: '月を選択',
    selectYear: '年を選択',
    nextMonth: '次の月',
    nextYear: '次の年',
    previousYears: (count: number) => `前の${count}年`,
    nextYears: (count: number) => `次の${count}年`,
    dateRangePickerLabel: '日付範囲選択',
    monthNames: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    shortMonthNames: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    dayNames: ['日', '月', '火', '水', '木', '金', '土'],
  },
  // Time picker
  timePicker: {
    label: '時刻選択',
    hoursLabel: 'HH',
    minutesLabel: 'MM',
    secondsLabel: 'SS',
    selectHours: '時間を選択',
    selectMinutes: '分を選択',
    selectSeconds: '秒を選択',
    selectPeriod: '午前/午後を選択',
    nowLabel: '現在',
  },
  // Time select
  timeSelectTime: '時刻を選択',
  dateTimeSelectDateTime: '日時を選択',
  // OTP input
  otpInputLabel: 'ワンタイムパスワード入力',
  otpDigitLabel: (index: number, total: number) => `${total}桁中${index}桁目`,
  // Nine-slice scroll view
  scrollableGridView: 'スクロール可能なグリッドビュー',
  // Onboarding tour
  onboardingTour: {
    label: 'ガイドツアー',
    stepIndicator: (current: number, total: number) =>
      `ステップ ${current} / ${total}`,
    skip: 'スキップ',
    previous: '前へ',
    next: '次へ',
    finish: '完了',
  },
  // Combobox
  searchPlaceholder: '検索',
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
