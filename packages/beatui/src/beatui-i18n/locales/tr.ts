import { formatFileSize } from '@/utils'
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
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (en fazla ${formattedSize})`
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

export default tr
