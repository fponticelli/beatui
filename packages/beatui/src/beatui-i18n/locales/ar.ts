import { formatFileSize } from '@/utils'
import { BeatUIMessages } from '../default'

const ar: BeatUIMessages = {
  loadingExtended: 'جاري التحميل، يرجى الانتظار',
  loadingShort: 'جاري التحميل...',
  locale: 'اللغة',
  iconDescription: 'أيقونة',
  loadingIcon: 'أيقونة التحميل',
  failedToLoadIcon: 'فشل في تحميل الأيقونة',
  editLabel: 'تحرير',
  selectOne: 'اختر واحد',
  selectMany: 'اختر عدة',
  noResults: 'لا نتائج',
  passwordPlaceholderText: 'كلمة المرور السرية',
  togglePasswordVisibility: 'إظهار/إخفاء كلمة المرور',
  toggleMenu: 'تبديل القائمة',
  toggleAside: 'تبديل اللوحة الجانبية',
  mainNavigation: 'القائمة الرئيسية',
  sidebar: 'الشريط الجانبي',
  closeDrawer: 'إغلاق الدرج',
  closeModal: 'إغلاق النافذة المنبثقة',
  confirm: 'تأكيد',
  cancel: 'إلغاء',
  addLabel: 'إضافة',
  removeItem: 'إزالة العنصر',
  // languages
  currentLocale: 'العربية',
  ar: 'العربية',
  de: 'الألمانية',
  en: 'الإنجليزية',
  es: 'الأسبانية',
  fr: 'الفرنسية',
  hi: 'الهندية',
  it: 'الإيطالية',
  ja: 'اليابانية',
  ko: 'الكورية',
  nl: 'الهولندية',
  pl: 'البولندية',
  pt: 'البرتغالية',
  ru: 'الروسية',
  tr: 'التركية',
  vi: 'الفيتنامية',
  zh: 'الصينية',
  he: 'العبرية',
  fa: 'الفارسية',
  ur: 'الأردية',
  // input
  emailPlaceholderText: 'بريدك الإلكتروني',
  incrementValue: 'زيادة القيمة',
  decrementValue: 'تقليل القيمة',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'انقر للاختيار أو اسحب الملفات هنا، أو اضغط Enter أو Space لفتح محدد الملفات'
      : 'اسحب الملفات هنا',
  // size
  fileSizeUnits: ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب'],
  // file input
  removeFile: 'إزالة الملف',
  clearAllFiles: 'مسح كل الملفات',
  // inputs reset
  clearValue: 'مسح القيمة',
  unknownType: 'نوع غير معروف',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'انقر للاختيار أو اسحب الملفات هنا'
        : 'انقر للاختيار أو اسحب ملف هنا'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`حتى ${maxFiles} ملفات`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`حد أقصى ${formattedSize} لكل ملف`)
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
}

export default ar
