import { formatFileSize } from '@/utils'
import { BeatUIMessages } from '../default'

const ur: BeatUIMessages = {
  loadingExtended: 'لوڈ ہو رہا ہے، براہ کرم انتظار کریں',
  loadingShort: 'لوڈ ہو رہا ہے...',
  locale: 'زبان',
  iconDescription: 'آئیکن',
  loadingIcon: 'لوڈنگ آئیکن',
  failedToLoadIcon: 'آئیکن لوڈ کرنے میں ناکام',
  editLabel: 'ترمیم',
  selectOne: 'ایک منتخب کریں',
  passwordPlaceholderText: 'خفیہ پاس ورڈ',
  togglePasswordVisibility: 'پاس ورڈ کی مرئیت تبدیل کریں',
  toggleMenu: 'مینو ٹوگل کریں',
  toggleAside: 'سائیڈ پینل ٹوگل کریں',
  mainNavigation: 'بنیادی نیویگیشن',
  sidebar: 'سائیڈ بار',
  closeDrawer: 'دراز بند کریں',
  closeModal: 'ماڈل بند کریں',
  confirm: 'تصدیق',
  cancel: 'منسوخ',
  // languages
  currentLocale: 'اردو',
  ar: 'عربی',
  de: 'جرمن',
  en: 'انگریزی',
  es: 'ہسپانوی',
  fr: 'فرانسیسی',
  he: 'عبرانی',
  hi: 'ہندی',
  it: 'اطالوی',
  ja: 'جاپانی',
  ko: 'کوریائی',
  nl: 'ڈچ',
  pl: 'پولش',
  pt: 'پرتگالی',
  ru: 'روسی',
  tr: 'ترکی',
  vi: 'ویتنامی',
  zh: 'چینی',
  fa: 'فارسی',
  ur: 'اردو',
  // input
  emailPlaceholderText: 'اپنا ای میل داخل کریں',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'منتخب کرنے کے لیے کلک کریں یا فائلیں یہاں گھسیٹیں، یا فائل منتخب کرنے کے لیے Enter یا Space دبائیں'
      : 'فائلیں یہاں گھسیٹیں',
  // size
  fileSizeUnits: ['بائٹس', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'فائل حذف کریں',
  clearAllFiles: 'تمام فائلیں صاف کریں',
  unknownType: 'نامعلوم قسم',
  fileInputInstructions: (
    allowMultiple: boolean,
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction = allowMultiple
      ? 'منتخب کرنے کے لیے کلک کریں یا فائلیں یہاں گھسیٹیں'
      : 'منتخب کرنے کے لیے کلک کریں یا فائل یہاں گھسیٹیں'

    if (allowMultiple && (maxFiles || maxFileSize)) {
      const constraints: string[] = []

      if (maxFiles) {
        constraints.push(
          maxFiles === 1
            ? 'زیادہ سے زیادہ 1 فائل'
            : `زیادہ سے زیادہ ${maxFiles} فائلیں`
        )
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`ہر ایک زیادہ سے زیادہ ${formattedSize}`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join('، ')})`
      }
    } else if (!allowMultiple && maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (زیادہ سے زیادہ ${formattedSize})`
    }

    return instruction
  },
}

export default ur
