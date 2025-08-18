import { formatFileSize } from '@/utils'
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
  unknownType: 'نوع ناشناخته',
  fileInputInstructions: (
    allowMultiple: boolean,
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction = allowMultiple
      ? 'برای انتخاب کلیک کنید یا فایل‌ها را بکشید'
      : 'برای انتخاب کلیک کنید یا فایل را بکشید'

    if (allowMultiple && (maxFiles || maxFileSize)) {
      const constraints: string[] = []

      if (maxFiles) {
        constraints.push(maxFiles === 1 ? 'تا ۱ فایل' : `تا ${maxFiles} فایل`)
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
    } else if (!allowMultiple && maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (حداکثر ${formattedSize})`
    }

    return instruction
  },
}

export default fa
