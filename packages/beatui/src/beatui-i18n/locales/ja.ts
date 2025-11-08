import { formatFileSize } from '@/utils'
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
}

export default ja
