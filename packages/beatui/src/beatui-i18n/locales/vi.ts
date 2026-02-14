import { formatFileSize } from '../../utils'
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
  selectNone: 'Không có',
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
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Phân trang',
  firstPage: 'Trang đầu',
  previousPage: 'Trang trước',
  nextPage: 'Trang tiếp',
  lastPage: 'Trang cuối',
  // Breadcrumbs
  breadcrumbs: 'Thanh điều hướng',
  // Command palette
  commandPalette: 'Bảng lệnh',
  typeACommand: 'Nhập lệnh...',
  noResultsFound: 'Không tìm thấy kết quả',
  noMatchingCommands: 'Không có lệnh phù hợp',
  // Appearance
  appearanceSystem: 'Hệ thống',
  appearanceLight: 'Sáng',
  appearanceDark: 'Tối',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation: 'Thay đổi loại sẽ xóa giá trị hiện tại. Tiếp tục?',
  // Notifications
  notifications: 'Thông báo',
  markAllAsRead: 'Đánh dấu tất cả đã đọc',
  noNotifications: 'Không có thông báo',
  // JSON Schema
  schemaConflictsDetected: 'Phát hiện xung đột lược đồ',
  schemaViolationsDetected: 'Phát hiện vi phạm lược đồ',
  properties: 'Thuộc tính',
  // File upload
  uploading: 'Đang tải lên...',
  dropFilesOrBrowse: 'Kéo thả tệp vào đây hoặc nhấp để duyệt',
  acceptedTypes: (types: string) => `Loại tệp được chấp nhận: ${types}`,
  // Rich text
  enterUrlPrompt: 'Nhập URL:',
  exceeded: '(vượt quá)',
  // PDF
  pdfPreview: 'Xem trước PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Phông chữ',
    fontSize: 'Cỡ chữ',
    fontColor: 'Màu chữ',
    highlightColor: 'Màu đánh dấu',
    backgroundColor: 'Màu nền',
    bold: 'Đậm',
    italic: 'Nghiêng',
    underline: 'Gạch chân',
    strikethrough: 'Gạch ngang',
    code: 'Mã',
    clearFormatting: 'Xóa định dạng',
    normal: 'Bình thường',
    heading: (level: number) => `Tiêu đề ${level}`,
    bulletList: 'Danh sách dấu đầu dòng',
    orderedList: 'Danh sách đánh số',
    checkList: 'Danh sách kiểm tra',
    indent: 'Thụt lề',
    outdent: 'Giảm thụt lề',
    blockquote: 'Trích dẫn',
    codeBlock: 'Khối mã',
    horizontalRule: 'Đường kẻ ngang',
    insertTable: 'Chèn bảng',
    link: 'Liên kết',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    cut: 'Cắt',
    copy: 'Sao chép',
    paste: 'Dán',
    defaultOption: 'Mặc định',
    slashCommands: 'Lệnh gạch chéo',
    noCommandsFound: 'Không tìm thấy lệnh',
    changeBlockType: 'Đổi loại khối',
    blockTypes: 'Loại khối',
    enterUrl: 'Nhập URL:',
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
    loading: 'Đang tải PDF...',
    loadFailed: 'Không thể tải PDF',
    invalidPdf: 'Tệp PDF không hợp lệ',
    pageOutOfRange: (page: number, total: number) =>
      `Trang ${page} nằm ngoài phạm vi (1-${total})`,
    renderFailed: 'Không thể hiển thị trang PDF',
  },
}

export default vi
