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
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
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
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `${total} içinden ${filtered} sonucun ${from} - ${to} satırları`
      : `${filtered} sonucun ${from} - ${to} satırları`,
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
    lineHeight: 'Satır yüksekliği',
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
  dataTable: {
    sortAscending: 'Artan sıralama',
    sortDescending: 'Azalan sıralama',
    clearSort: 'Sıralamayı temizle',
    filterPlaceholder: 'Filtrele...',
    clearFilter: 'Filtreyi temizle',
    selectAll: 'Tümünü seç',
    deselectAll: 'Tümünü kaldır',
    selectedCount: (count: number) => `${count} seçildi`,
    resetAll: 'Tümünü sıfırla',
    noResults: 'Sonuç bulunamadı',
    loading: 'Yükleniyor...',
    // Filter panel
    filterPanelAddCondition: 'Koşul ekle',
    filterPanelApply: 'Uygula',
    filterPanelClear: 'Filtreleri temizle',
    filterPanelAnd: 'VE',
    filterPanelOr: 'VEYA',
    filterPanelContains: 'İçerir',
    filterPanelNotContains: 'İçermez',
    filterPanelEquals: 'Eşittir',
    filterPanelNotEquals: 'Eşit değildir',
    filterPanelStartsWith: 'İle başlar',
    filterPanelEndsWith: 'İle biter',
    filterPanelIsNull: 'Boş',
    filterPanelIsNotNull: 'Boş değil',
    filterPanelGt: 'Büyüktür',
    filterPanelGte: 'Büyük veya eşit',
    filterPanelLt: 'Küçüktür',
    filterPanelLte: 'Küçük veya eşit',
    filterPanelBetween: 'Arasında',
    filterPanelValuePlaceholder: 'Değer...',
    sortMultiHint:
      'Birden fazla sütunu sıralamak için Shift tuşunu basılı tutun',
    columnVisibility: 'Sütunlar',
    showAllColumns: 'Tümünü göster',
    // Column header menu
    menuSortAsc: 'Artan sırada sırala',
    menuSortDesc: 'Azalan sırada sırala',
    menuClearSort: 'Sıralamayı temizle',
    menuHideColumn: 'Sütunu gizle',
    menuChooseColumns: 'Sütun seç',
    menuResetColumns: 'Sütunları sıfırla',
    menuFilter: 'Filtrele',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Satırlar: ${filtered}  Toplam satır: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Değer seçin...',
    // Group by
    groupCount: (count: number) => `${count} öğe`,
    collapseGroup: 'Grubu daralt',
    expandGroup: 'Grubu genişlet',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} "${val}" içerir`,
      textNotContains: (col: string, val: string) => `${col} "${val}" içermez`,
      textEquals: (col: string, val: string) => `${col} "${val}" eşittir`,
      textNotEquals: (col: string, val: string) =>
        `${col} "${val}" eşit değildir`,
      textStartsWith: (col: string, val: string) =>
        `${col} "${val}" ile başlar`,
      textEndsWith: (col: string, val: string) => `${col} "${val}" ile biter`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} ${min} ile ${max} arasında`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} [${vals}] içinde`,
      setNotIn: (col: string, vals: string) => `${col} [${vals}] içinde değil`,
      booleanIs: (col: string, val: string) => `${col} ${val}`,
      isNull: (col: string) => `${col} boş`,
      isNotNull: (col: string) => `${col} boş değil`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' VE '),
      compositeOr: (descriptions: string[]) => descriptions.join(' VEYA '),
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
  // Carousel
  carousel: {
    label: 'Döngü',
    previousSlide: 'Önceki slayt',
    nextSlide: 'Sonraki slayt',
    slideNavigation: 'Slayt navigasyonu',
    slideOfTotal: (index: number, total: number) => `Slayt ${index} / ${total}`,
    goToSlide: (index: number) => `Slayt ${index}'e git`,
  },
  // Date picker
  datePicker: {
    label: 'Tarih seçici',
    previousYear: 'Önceki yıl',
    previousMonth: 'Önceki ay',
    selectMonth: 'Ay seç',
    selectYear: 'Yıl seç',
    nextMonth: 'Sonraki ay',
    nextYear: 'Sonraki yıl',
    previousYears: (count: number) => `Önceki ${count} yıl`,
    nextYears: (count: number) => `Sonraki ${count} yıl`,
    dateRangePickerLabel: 'Tarih aralığı seçici',
    monthNames: [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ],
    shortMonthNames: [
      'Oca',
      'Şub',
      'Mar',
      'Nis',
      'May',
      'Haz',
      'Tem',
      'Ağu',
      'Eyl',
      'Eki',
      'Kas',
      'Ara',
    ],
    dayNames: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
  },
  // Time picker
  timePicker: {
    label: 'Saat seçici',
    hoursLabel: 'HH',
    minutesLabel: 'MM',
    secondsLabel: 'SS',
    selectHours: 'Saat seç',
    selectMinutes: 'Dakika seç',
    selectSeconds: 'Saniye seç',
    selectPeriod: 'ÖÖ/ÖS seç',
    nowLabel: 'Şimdi',
  },
  // Time select
  timeSelectTime: 'Saat seç',
  dateTimeSelectDateTime: 'Tarih ve saat seç',
  // Color picker
  colorPicker: {
    hue: 'Ton',
    saturation: 'Doygunluk',
    lightness: 'Parlaklık',
    alpha: 'Alfa',
    red: 'Kırmızı',
    green: 'Yeşil',
    blue: 'Mavi',
    hex: 'Hex',
    whiteness: 'Beyazlık',
    blackness: 'Siyahlık',
    chroma: 'Kroma',
  },
  // Spotlight
  spotlight: {
    placeholder: 'Ara...',
    noResults: 'Sonuç bulunamadı',
    recentItems: 'Son kullanılanlar',
    close: 'Kapat',
  },
  // Virtual list
  virtualList: {
    listLabel: 'Kaydırılabilir liste',
  },
  // Stepper
  stepper: {
    step: 'Adım',
    stepOfTotal: (current: number, total: number) =>
      `Adım ${current} / ${total}`,
    completed: 'Tamamlandı',
    next: 'İleri',
    previous: 'Geri',
    complete: 'Tamamla',
  },
  // Sortable list
  sortableList: {
    dragHandle: 'Yeniden sıralamak için sürükleyin',
    dropIndicator: 'Buraya bırakın',
  },
  // Transfer list
  transferList: {
    available: 'Mevcut',
    selected: 'Seçili',
    moveRight: 'Seçilenlere taşı',
    moveLeft: 'Mevcut olanlara taşı',
    moveAllRight: 'Tümünü seçilenlere taşı',
    moveAllLeft: 'Tümünü mevcut olanlara taşı',
    searchAvailable: 'Mevcut olanları ara',
    searchSelected: 'Seçilenleri ara',
  },
  // Copy button
  copyButton: {
    copied: 'Kopyalandı!',
    copyToClipboard: 'Panoya kopyala',
  },
  // Number stepper
  numberStepper: {
    increment: 'Artır',
    decrement: 'Azalt',
    value: 'Değer',
  },
  // Stat card
  statCard: {
    trendUp: 'Yükseliş eğilimi',
    trendDown: 'Düşüş eğilimi',
    trendFlat: 'Değişiklik yok',
  },
  // OTP input
  otpInputLabel: 'Tek kullanımlık şifre girişi',
  otpDigitLabel: (index: number, total: number) => `Rakam ${index} / ${total}`,
  // Nine-slice scroll view
  scrollableGridView: 'Kaydırılabilir ızgara görünümü',
  // Onboarding tour
  onboardingTour: {
    label: 'Rehberli tur',
    stepIndicator: (current: number, total: number) =>
      `Adım ${current} / ${total}`,
    skip: 'Atla',
    previous: 'Önceki',
    next: 'Sonraki',
    finish: 'Bitir',
  },
  // Combobox
  searchPlaceholder: 'Ara',
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
