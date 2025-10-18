import { formatFileSize } from '@/utils'
import { BeatUIMessages } from '../default'

const vi: BeatUIMessages = {
  loadingExtended: 'Đang tải, vui lòng đợi',
  loadingShort: 'Đang tải...',
  locale: 'Ngôn ngữ',
  iconDescription: 'Biểu tượng',
  loadingIcon: 'Biểu tượng tải',
  failedToLoadIcon: 'Không thể tải biểu tượng',
  editLabel: 'Chỉnh sửa',
  selectOne: 'Chọn một',
  selectMany: 'Chọn nhiều',
  noResults: 'Không có kết quả',
  passwordPlaceholderText: 'Mật khẩu bí mật',
  togglePasswordVisibility: 'Chuyển đổi hiển thị mật khẩu',
  toggleMenu: 'Chuyển đổi menu',
  toggleAside: 'Chuyển đổi bảng bên',
  mainNavigation: 'Điều hướng chính',
  sidebar: 'Thanh bên',
  closeDrawer: 'Đóng ngăn kéo',
  closeModal: 'Đóng modal',
  confirm: 'Xác nhận',
  cancel: 'Hủy',
  addLabel: 'Thêm',
  removeItem: 'Xóa mục',
  // languages
  currentLocale: 'Tiếng Việt',
  ar: 'Tiếng Ả Rập',
  de: 'Tiếng Đức',
  en: 'Tiếng Anh',
  es: 'Tiếng Tây Ban Nha',
  fr: 'Tiếng Pháp',
  hi: 'Tiếng Hindi',
  it: 'Tiếng Ý',
  ja: 'Tiếng Nhật',
  ko: 'Tiếng Hàn',
  nl: 'Tiếng Hà Lan',
  pl: 'Tiếng Ba Lan',
  pt: 'Tiếng Bồ Đào Nha',
  ru: 'Tiếng Nga',
  tr: 'Tiếng Thổ Nhĩ Kỳ',
  vi: 'Tiếng Việt',
  zh: 'Tiếng Trung',
  he: 'Tiếng Do Thái',
  fa: 'Tiếng Ba Tư',
  ur: 'Tiếng Urdu',
  // input
  emailPlaceholderText: 'Nhập email của bạn',
  incrementValue: 'Tăng giá trị',
  decrementValue: 'Giảm giá trị',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Nhấp để chọn hoặc kéo tệp vào đây, hoặc nhấn Enter hoặc Space để mở trình chọn tệp'
      : 'Kéo tệp vào đây',
  // size
  fileSizeUnits: ['Byte', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: 'Xóa tệp',
  clearAllFiles: 'Xóa tất cả tệp',
  // inputs reset
  clearValue: 'Xóa giá trị',
  unknownType: 'Loại không xác định',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Nhấp để chọn hoặc kéo tệp vào đây'
        : 'Nhấp để chọn hoặc kéo một tệp vào đây'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`tối đa ${maxFiles} tệp`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`mỗi tệp tối đa ${formattedSize}`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (tối đa ${formattedSize})`
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
    linkUrlPlaceholder: 'https://example.com',
    linkDialogSave: 'Save',
    linkDialogCancel: 'Cancel',
    linkDialogRemoveLink: 'Remove link',
  },
}

export default vi
