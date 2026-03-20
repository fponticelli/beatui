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
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
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
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `Hàng ${from} đến ${to} trong ${filtered} trên ${total}`
      : `Hàng ${from} đến ${to} trong ${filtered}`,
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
    lineHeight: 'Chiều cao dòng',
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
    sortAscending: 'Sắp xếp tăng dần',
    sortDescending: 'Sắp xếp giảm dần',
    clearSort: 'Xóa sắp xếp',
    filterPlaceholder: 'Lọc...',
    clearFilter: 'Xóa bộ lọc',
    selectAll: 'Chọn tất cả',
    deselectAll: 'Bỏ chọn tất cả',
    selectedCount: (count: number) => `${count} đã chọn`,
    resetAll: 'Đặt lại tất cả',
    noResults: 'Không tìm thấy kết quả',
    loading: 'Đang tải...',
    // Filter panel
    filterPanelAddCondition: 'Thêm điều kiện',
    filterPanelApply: 'Áp dụng',
    filterPanelClear: 'Xóa bộ lọc',
    filterPanelAnd: 'VÀ',
    filterPanelOr: 'HOẶC',
    filterPanelContains: 'Chứa',
    filterPanelNotContains: 'Không chứa',
    filterPanelEquals: 'Bằng',
    filterPanelNotEquals: 'Không bằng',
    filterPanelStartsWith: 'Bắt đầu với',
    filterPanelEndsWith: 'Kết thúc với',
    filterPanelIsNull: 'Trống',
    filterPanelIsNotNull: 'Không trống',
    filterPanelGt: 'Lớn hơn',
    filterPanelGte: 'Lớn hơn hoặc bằng',
    filterPanelLt: 'Nhỏ hơn',
    filterPanelLte: 'Nhỏ hơn hoặc bằng',
    filterPanelBetween: 'Trong khoảng',
    filterPanelValuePlaceholder: 'Giá trị...',
    sortMultiHint: 'Giữ Shift để sắp xếp nhiều cột',
    columnVisibility: 'Cột',
    showAllColumns: 'Hiển thị tất cả',
    // Column header menu
    menuSortAsc: 'Sắp xếp tăng dần',
    menuSortDesc: 'Sắp xếp giảm dần',
    menuClearSort: 'Xóa sắp xếp',
    menuHideColumn: 'Ẩn cột',
    menuChooseColumns: 'Chọn cột',
    menuResetColumns: 'Đặt lại cột',
    menuFilter: 'Lọc',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Hàng: ${filtered}  Tổng hàng: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Chọn giá trị...',
    // Group by
    groupCount: (count: number) => `${count} mục`,
    collapseGroup: 'Thu gọn nhóm',
    expandGroup: 'Mở rộng nhóm',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} chứa "${val}"`,
      textNotContains: (col: string, val: string) =>
        `${col} không chứa "${val}"`,
      textEquals: (col: string, val: string) => `${col} bằng "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} không bằng "${val}"`,
      textStartsWith: (col: string, val: string) =>
        `${col} bắt đầu bằng "${val}"`,
      textEndsWith: (col: string, val: string) =>
        `${col} kết thúc bằng "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} giữa ${min} và ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} trong [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} không trong [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} là ${val}`,
      isNull: (col: string) => `${col} trống`,
      isNotNull: (col: string) => `${col} không trống`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' VÀ '),
      compositeOr: (descriptions: string[]) => descriptions.join(' HOẶC '),
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
    label: 'Băng chuyền',
    previousSlide: 'Slide trước',
    nextSlide: 'Slide tiếp theo',
    slideNavigation: 'Điều hướng slide',
    slideOfTotal: (index: number, total: number) =>
      `Slide ${index} trên ${total}`,
    goToSlide: (index: number) => `Đến slide ${index}`,
  },
  // Date picker
  datePicker: {
    label: 'Chọn ngày',
    previousYear: 'Năm trước',
    previousMonth: 'Tháng trước',
    selectMonth: 'Chọn tháng',
    selectYear: 'Chọn năm',
    nextMonth: 'Tháng sau',
    nextYear: 'Năm sau',
    previousYears: (count: number) => `${count} năm trước`,
    nextYears: (count: number) => `${count} năm sau`,
    dateRangePickerLabel: 'Chọn khoảng ngày',
    monthNames: [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ],
    shortMonthNames: [
      'Th1',
      'Th2',
      'Th3',
      'Th4',
      'Th5',
      'Th6',
      'Th7',
      'Th8',
      'Th9',
      'Th10',
      'Th11',
      'Th12',
    ],
    dayNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  },
  // OTP input
  otpInputLabel: 'Nhập mật khẩu một lần',
  otpDigitLabel: (index: number, total: number) =>
    `Chữ số ${index} trên ${total}`,
  // Nine-slice scroll view
  scrollableGridView: 'Chế độ xem lưới có thể cuộn',
  // Onboarding tour
  onboardingTour: {
    label: 'Tour hướng dẫn',
    stepIndicator: (current: number, total: number) =>
      `Bước ${current} trên ${total}`,
    skip: 'Bỏ qua',
    previous: 'Trước',
    next: 'Tiếp',
    finish: 'Hoàn thành',
  },
  // Combobox
  searchPlaceholder: 'Tìm kiếm',
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
