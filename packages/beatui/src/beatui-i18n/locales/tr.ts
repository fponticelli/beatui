import { BeatUIMessages } from '../default'

const tr: BeatUIMessages = {
  loadingExtended: () => 'Yükleniyor, lütfen bekleyin',
  loadingShort: () => 'Yükleniyor...',
  locale: () => 'Yerel',
  iconDescription: () => 'Simge',
  loadingIcon: () => 'Yükleme simgesi',
  failedToLoadIcon: () => 'Simge yüklenemedi',
  editLabel: () => 'Düzenle',
  selectOne: () => 'Birini seç',
  passwordPlaceholderText: () => 'Gizli Şifre',
  togglePasswordVisibility: () => 'Şifre görünürlüğünü değiştir',
  toggleMenu: () => 'Menüyü değiştir',
  toggleAside: () => 'Yan paneli değiştir',
  mainNavigation: () => 'Ana navigasyon',
  sidebar: () => 'Kenar çubuğu',
  closeDrawer: () => 'Çekmeceyi kapat',
  closeModal: () => 'Modalı kapat',
  confirm: () => 'Onayla',
  cancel: () => 'İptal',
  // languages
  currentLocale: () => 'Türkçe',
  ar: () => 'Arapça',
  de: () => 'Almanca',
  en: () => 'İngilizce',
  es: () => 'İspanyolca',
  fr: () => 'Fransızca',
  hi: () => 'Hintçe',
  it: () => 'İtalyanca',
  ja: () => 'Japonca',
  ko: () => 'Korece',
  nl: () => 'Flemenkçe',
  pl: () => 'Lehçe',
  pt: () => 'Portekizce',
  ru: () => 'Rusça',
  tr: () => 'Türkçe',
  vi: () => 'Vietnamca',
  zh: () => 'Çince',
  he: () => 'İbranice',
  fa: () => 'Farsça',
  ur: () => 'Urduca',
  // input
  emailPlaceholderText: () => 'E-postanızı girin',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Seçmek için tıklayın veya dosyaları buraya sürükleyin, veya dosya seçiciyi açmak için Enter veya Boşluk tuşuna basın'
      : 'Dosyaları buraya sürükleyin',
  // size
  fileSizeUnits: () => ['Bayt', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: () => 'Dosyayı kaldır',
  clearAllFiles: () => 'Tüm dosyaları temizle',
  unknownType: () => 'Bilinmeyen tür',
  fileInputInstructions: () =>
    'Seçmek için tıklayın veya dosyaları buraya sürükleyin',
}

export default tr
