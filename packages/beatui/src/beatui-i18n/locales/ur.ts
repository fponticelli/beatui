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
  selectMany: 'متعدد منتخب کریں',
  noResults: 'کوئی نتیجہ نہیں',
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
  addLabel: 'شامل کریں',
  removeItem: 'آئٹم ہٹائیں',
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
  incrementValue: 'قدر اضافہ کریں',
  decrementValue: 'قدر کم کریں',
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
  // inputs reset
  clearValue: 'قدر صاف کریں',
  unknownType: 'نامعلوم قسم',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'منتخب کرنے کے لیے کلک کریں یا فائلیں یہاں گھسیٹیں'
        : 'منتخب کرنے کے لیے کلک کریں یا فائل یہاں گھسیٹیں'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`زیادہ سے زیادہ ${maxFiles} فائلیں`)
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
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (زیادہ سے زیادہ ${formattedSize})`
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

export default ur
