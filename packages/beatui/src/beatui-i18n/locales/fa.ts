import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const fa: BeatUIMessages = {
  loadingExtended: 'در حال بارگذاری، لطفاً صبر کنید',
  loadingShort: 'در حال بارگذاری...',
  locale: 'زبان',
  iconDescription: 'نماد',
  loadingIcon: 'نماد بارگذاری',
  failedToLoadIcon: 'بارگذاری نماد ناموفق بود',
  editLabel: 'ویرایش',
  selectOne: 'یکی را انتخاب کنید',
  selectNone: 'هیچکدام',
  selectMany: 'چند مورد را انتخاب کنید',
  noResults: 'بدون نتیجه',
  passwordPlaceholderText: 'رمز عبور محرمانه',
  togglePasswordVisibility: 'نمایش/مخفی کردن رمز عبور',
  toggleMenu: 'نمایش/مخفی کردن منو',
  toggleAside: 'نمایش/مخفی کردن پانل کناری',
  mainNavigation: 'ناوبری اصلی',
  sidebar: 'نوار کناری',
  closeDrawer: 'بستن کشو',
  closeModal: 'بستن پنجره',
  confirm: 'تأیید',
  cancel: 'لغو',
  addLabel: 'افزودن',
  removeItem: 'حذف مورد',
  // languages
  currentLocale: 'فارسی',
  ar: 'عربی',
  de: 'آلمانی',
  en: 'انگلیسی',
  es: 'اسپانیایی',
  fr: 'فرانسوی',
  he: 'عبری',
  hi: 'هندی',
  it: 'ایتالیایی',
  ja: 'ژاپنی',
  ko: 'کره‌ای',
  nl: 'هلندی',
  pl: 'لهستانی',
  pt: 'پرتغالی',
  ru: 'روسی',
  tr: 'ترکی',
  vi: 'ویتنامی',
  zh: 'چینی',
  fa: 'فارسی',
  ur: 'اردو',
  // input
  emailPlaceholderText: 'ایمیل خود را وارد کنید',
  incrementValue: 'افزایش مقدار',
  decrementValue: 'کاهش مقدار',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'برای انتخاب کلیک کنید یا فایل‌ها را بکشید، یا Enter یا Space را فشار دهید تا انتخابگر فایل باز شود'
      : 'فایل‌ها را بکشید',
  // size
  fileSizeUnits: ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'],
  // file input
  removeFile: 'حذف فایل',
  clearAllFiles: 'حذف همه فایل‌ها',
  // inputs reset
  clearValue: 'حذف مقدار',
  unknownType: 'نوع ناشناخته',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'برای انتخاب کلیک کنید یا فایل‌ها را بکشید'
        : 'برای انتخاب کلیک کنید یا فایل را بکشید'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`تا ${maxFiles} فایل`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`حداکثر ${formattedSize} هر کدام`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join('، ')})`
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
    loading: 'Loading PDF...',
    loadFailed: 'Failed to load PDF',
    invalidPdf: 'Invalid PDF file',
    pageOutOfRange: (page: number, total: number) =>
      `Page ${page} is out of range (1-${total})`,
    renderFailed: 'Failed to render PDF page',
  },
}

export default fa
