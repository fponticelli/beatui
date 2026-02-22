import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const tr: BeatUIMessages = {
  loadingExtended: 'Yükleniyor, lütfen bekleyin',
  loadingShort: 'Yükleniyor...',
  locale: 'Yerel',
  iconDescription: 'Simge',
  loadingIcon: 'Yükleme simgesi',
  failedToLoadIcon: 'Simge yüklenemedi',
  editLabel: 'Düzenle',
  selectOne: 'Birini seç',
  selectNone: 'Hiçbiri',
  selectMany: 'Birden fazlasını seç',
  noResults: 'Sonuç yok',
  passwordPlaceholderText: 'Gizli Şifre',
  togglePasswordVisibility: 'Şifre görünürlüğünü değiştir',
  toggleMenu: 'Menüyü değiştir',
  toggleAside: 'Yan paneli değiştir',
  mainNavigation: 'Ana navigasyon',
  sidebar: 'Kenar çubuğu',
  closeDrawer: 'Çekmeceyi kapat',
  closeModal: 'Modalı kapat',
  confirm: 'Onayla',
  cancel: 'İptal',
  addLabel: 'Ekle',
  removeItem: 'Öğeyi kaldır',
  // languages
  currentLocale: 'Türkçe',
  ar: 'Arapça',
  de: 'Almanca',
  en: 'İngilizce',
  es: 'İspanyolca',
  fr: 'Fransızca',
  hi: 'Hintçe',
  it: 'İtalyanca',
  ja: 'Japonca',
  ko: 'Korece',
  nl: 'Flemenkçe',
  pl: 'Lehçe',
  pt: 'Portekizce',
  ru: 'Rusça',
  tr: 'Türkçe',
  vi: 'Vietnamca',
  zh: 'Çince',
  he: 'İbranice',
  fa: 'Farsça',
  ur: 'Urduca',
  // input
  emailPlaceholderText: 'E-postanızı girin',
  incrementValue: 'Değer artır',
  decrementValue: 'Değer azalt',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Seçmek için tıklayın veya dosyaları buraya sürükleyin, veya dosya seçiciyi açmak için Enter veya Boşluk tuşuna basın'
      : 'Dosyaları buraya sürükleyin',
  // size
  fileSizeUnits: ['Bayt', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Dosyayı kaldır',
  clearAllFiles: 'Tüm dosyaları temizle',
  // inputs reset
  clearValue: 'Değeri temizle',
  unknownType: 'Bilinmeyen tür',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Seçmek için tıklayın veya dosyaları buraya sürükleyin'
        : 'Seçmek için tıklayın veya dosyayı buraya sürükleyin'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`en fazla ${maxFiles} dosya`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`her biri en fazla ${formattedSize}`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Sayfalama',
  firstPage: 'İlk sayfa',
  previousPage: 'Önceki sayfa',
  nextPage: 'Sonraki sayfa',
  lastPage: 'Son sayfa',
  // Breadcrumbs
  breadcrumbs: 'İçerik haritası',
  // Command palette
  commandPalette: 'Komut paleti',
  typeACommand: 'Bir komut yazın...',
  noResultsFound: 'Sonuç bulunamadı',
  noMatchingCommands: 'Eşleşen komut yok',
  // Appearance
  appearanceSystem: 'Sistem',
  appearanceLight: 'Açık',
  appearanceDark: 'Koyu',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    'Tür değiştirmek mevcut değeri silecektir. Devam edilsin mi?',
  // Notifications
  notifications: 'Bildirimler',
  markAllAsRead: 'Tümünü okundu olarak işaretle',
  noNotifications: 'Bildirim yok',
  // JSON Schema
  schemaConflictsDetected: 'Şema Çakışmaları Tespit Edildi',
  schemaViolationsDetected: 'Şema İhlalleri Tespit Edildi',
  properties: 'Özellikler',
  // File upload
  uploading: 'Yükleniyor...',
  dropFilesOrBrowse: 'Dosyaları buraya bırakın veya göz atmak için tıklayın',
  acceptedTypes: (types: string) => `Kabul edilen türler: ${types}`,
  // Rich text
  enterUrlPrompt: 'URL girin:',
  exceeded: '(aşıldı)',
  // PDF
  pdfPreview: 'PDF Önizleme',
  // Lexical editor
  lexical: {
    fontFamily: 'Yazı Tipi',
    fontSize: 'Yazı Boyutu',
    fontColor: 'Yazı Rengi',
    highlightColor: 'Vurgu Rengi',
    backgroundColor: 'Arka Plan Rengi',
    bold: 'Kalın',
    italic: 'İtalik',
    underline: 'Altı Çizili',
    strikethrough: 'Üstü Çizili',
    code: 'Kod',
    clearFormatting: 'Biçimlendirmeyi Temizle',
    normal: 'Normal',
    heading: (level: number) => `Başlık ${level}`,
    bulletList: 'Madde İşaretli Liste',
    orderedList: 'Numaralı Liste',
    checkList: 'Kontrol Listesi',
    indent: 'Girintiyi Artır',
    outdent: 'Girintiyi Azalt',
    blockquote: 'Alıntı',
    codeBlock: 'Kod Bloğu',
    horizontalRule: 'Yatay Çizgi',
    insertTable: 'Tablo Ekle',
    link: 'Bağlantı',
    undo: 'Geri Al',
    redo: 'Yinele',
    cut: 'Kes',
    copy: 'Kopyala',
    paste: 'Yapıştır',
    defaultOption: 'Varsayılan',
    slashCommands: 'Eğik çizgi komutları',
    noCommandsFound: 'Komut bulunamadı',
    changeBlockType: 'Blok türünü değiştir',
    blockTypes: 'Blok türleri',
    enterUrl: 'URL girin:',
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
    loading: 'PDF yükleniyor...',
    loadFailed: 'PDF yüklenemedi',
    invalidPdf: 'Geçersiz PDF dosyası',
    pageOutOfRange: (page: number, total: number) =>
      `Sayfa ${page} aralık dışında (1-${total})`,
    renderFailed: 'PDF sayfası oluşturulamadı',
  },
}

export default tr
