import { formatFileSize } from '../../utils'
import { BeatUIMessages } from '../default'

const ko: BeatUIMessages = {
  loadingExtended: '로딩 중입니다. 잠시만 기다려 주세요',
  loadingShort: '로딩 중...',
  locale: '지역',
  iconDescription: '아이콘',
  loadingIcon: '로딩 아이콘',
  failedToLoadIcon: '아이콘 로드 실패',
  editLabel: '편집',
  selectOne: '하나 선택',
  selectNone: '없음',
  selectMany: '여러 개 선택',
  noResults: '결과 없음',
  passwordPlaceholderText: '비밀번호',
  togglePasswordVisibility: '비밀번호 표시 전환',
  toggleMenu: '메뉴 전환',
  toggleAside: '사이드 패널 전환',
  mainNavigation: '메인 네비게이션',
  sidebar: '사이드바',
  closeDrawer: '드로어 닫기',
  closeModal: '모달 닫기',
  confirm: '확인',
  cancel: '취소',
  addLabel: '추가',
  removeItem: '항목 제거',
  // languages
  currentLocale: '한국어',
  ar: '아랍어',
  de: '독일어',
  en: '영어',
  es: '스페인어',
  fr: '프랑스어',
  hi: '힌디어',
  it: '이탈리아어',
  ja: '일본어',
  ko: '한국어',
  nl: '네덜란드어',
  pl: '폴란드어',
  pt: '포르투갈어',
  ru: '러시아어',
  tr: '터키어',
  vi: '베트남어',
  zh: '중국어',
  he: '히브리어',
  fa: '페르시아어',
  ur: '우르두어',
  // input
  emailPlaceholderText: '이메일을 입력하세요',
  incrementValue: '값 증가',
  decrementValue: '값 감소',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? '클릭하여 선택하거나 파일을 여기로 드래그하세요, 또는 Enter 또는 Space 키를 눌러 파일 선택기를 여세요'
      : '파일을 여기로 드래그하세요',
  // size
  fileSizeUnits: ['바이트', 'KB', 'MB', 'GB', 'TB'],
  // file input
  removeFile: '파일 제거',
  clearAllFiles: '모든 파일 지우기',
  // inputs reset
  clearValue: '값 지우기',
  // Date range select
  dateRangeStart: 'Start',
  dateRangeEnd: 'End',
  dateRangeNoLimit: 'No limit',
  dateRangeSelectDate: 'Select date',
  unknownType: '알 수 없는 형식',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? '클릭하여 선택하거나 파일을 여기로 드래그하세요'
        : '클릭하여 선택하거나 파일을 여기로 드래그하세요'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        constraints.push(`최대 ${maxFiles}개 파일`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`각각 최대 ${formattedSize}`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    }

    return instruction
  },
  // Pagination
  paginationLabel: '페이지네이션',
  paginationRange: (
    from: number,
    to: number,
    filtered: number,
    total: number
  ) =>
    total > filtered
      ? `${total}개 중 ${filtered}개의 ${from}~${to}행`
      : `${filtered}개 중 ${from}~${to}행`,
  firstPage: '첫 페이지',
  previousPage: '이전 페이지',
  nextPage: '다음 페이지',
  lastPage: '마지막 페이지',
  // Breadcrumbs
  breadcrumbs: '탐색 경로',
  // Command palette
  commandPalette: '명령 팔레트',
  typeACommand: '명령어를 입력하세요...',
  noResultsFound: '결과를 찾을 수 없음',
  noMatchingCommands: '일치하는 명령어 없음',
  // Appearance
  appearanceSystem: '시스템',
  appearanceLight: '라이트',
  appearanceDark: '다크',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    '유형을 변경하면 현재 값이 지워집니다. 계속하시겠습니까?',
  // Notifications
  notifications: '알림',
  markAllAsRead: '모두 읽음으로 표시',
  noNotifications: '알림 없음',
  // JSON Schema
  schemaConflictsDetected: '스키마 충돌 감지됨',
  schemaViolationsDetected: '스키마 위반 감지됨',
  properties: '속성',
  // File upload
  uploading: '업로드 중...',
  dropFilesOrBrowse: '파일을 여기에 놓거나 클릭하여 찾아보기',
  acceptedTypes: (types: string) => `허용 형식: ${types}`,
  // Rich text
  enterUrlPrompt: 'URL 입력:',
  exceeded: '(초과)',
  // PDF
  pdfPreview: 'PDF 미리보기',
  // Lexical editor
  lexical: {
    fontFamily: '글꼴',
    fontSize: '글꼴 크기',
    lineHeight: '줄 높이',
    fontColor: '글꼴 색상',
    highlightColor: '강조 색상',
    backgroundColor: '배경 색상',
    bold: '굵게',
    italic: '기울임꼴',
    underline: '밑줄',
    strikethrough: '취소선',
    code: '코드',
    clearFormatting: '서식 지우기',
    normal: '본문',
    heading: (level: number) => `제목 ${level}`,
    bulletList: '글머리 기호 목록',
    orderedList: '번호 매기기 목록',
    checkList: '체크리스트',
    indent: '들여쓰기',
    outdent: '내어쓰기',
    blockquote: '인용문',
    codeBlock: '코드 블록',
    horizontalRule: '가로줄',
    insertTable: '표 삽입',
    link: '링크',
    undo: '실행 취소',
    redo: '다시 실행',
    cut: '잘라내기',
    copy: '복사',
    paste: '붙여넣기',
    defaultOption: '기본값',
    slashCommands: '슬래시 명령어',
    noCommandsFound: '명령어를 찾을 수 없음',
    changeBlockType: '블록 유형 변경',
    blockTypes: '블록 유형',
    enterUrl: 'URL 입력:',
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
    sortAscending: '오름차순 정렬',
    sortDescending: '내림차순 정렬',
    clearSort: '정렬 해제',
    filterPlaceholder: '필터...',
    clearFilter: '필터 해제',
    selectAll: '모두 선택',
    deselectAll: '모두 선택 해제',
    selectedCount: (count: number) => `${count}개 선택됨`,
    resetAll: '모두 초기화',
    noResults: '결과를 찾을 수 없습니다',
    loading: '로딩 중...',
    // Filter panel
    filterPanelAddCondition: '조건 추가',
    filterPanelApply: '적용',
    filterPanelClear: '필터 지우기',
    filterPanelAnd: '그리고',
    filterPanelOr: '또는',
    filterPanelContains: '포함',
    filterPanelNotContains: '포함하지 않음',
    filterPanelEquals: '같음',
    filterPanelNotEquals: '같지 않음',
    filterPanelStartsWith: '시작 문자',
    filterPanelEndsWith: '끝 문자',
    filterPanelIsNull: '비어 있음',
    filterPanelIsNotNull: '비어 있지 않음',
    filterPanelGt: '보다 큼',
    filterPanelGte: '크거나 같음',
    filterPanelLt: '보다 작음',
    filterPanelLte: '작거나 같음',
    filterPanelBetween: '사이',
    filterPanelValuePlaceholder: '값...',
    sortMultiHint: 'Shift를 누른 채로 여러 열 정렬',
    columnVisibility: '열',
    showAllColumns: '모두 표시',
    // Column header menu
    menuSortAsc: '오름차순 정렬',
    menuSortDesc: '내림차순 정렬',
    menuClearSort: '정렬 지우기',
    menuHideColumn: '열 숨기기',
    menuChooseColumns: '열 선택',
    menuResetColumns: '열 초기화',
    menuFilter: '필터',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `행: ${filtered}  전체 행: ${total}`,
    // Tags filter
    filterTagsPlaceholder: '값 선택...',
    // Group by
    groupCount: (count: number) => `${count}개 항목`,
    collapseGroup: '그룹 접기',
    expandGroup: '그룹 펼치기',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} "${val}" 포함`,
      textNotContains: (col: string, val: string) => `${col} "${val}" 미포함`,
      textEquals: (col: string, val: string) => `${col} "${val}"와 같음`,
      textNotEquals: (col: string, val: string) => `${col} "${val}"와 다름`,
      textStartsWith: (col: string, val: string) => `${col} "${val}"로 시작`,
      textEndsWith: (col: string, val: string) => `${col} "${val}"로 끝남`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} ${min} ~ ${max} 사이`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} [${vals}] 중 포함`,
      setNotIn: (col: string, vals: string) => `${col} [${vals}] 중 미포함`,
      booleanIs: (col: string, val: string) => `${col} ${val}`,
      isNull: (col: string) => `${col} 비어있음`,
      isNotNull: (col: string) => `${col} 비어있지 않음`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' 그리고 '),
      compositeOr: (descriptions: string[]) => descriptions.join(' 또는 '),
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
    label: '캐러셀',
    previousSlide: '이전 슬라이드',
    nextSlide: '다음 슬라이드',
    slideNavigation: '슬라이드 탐색',
    slideOfTotal: (index: number, total: number) =>
      `슬라이드 ${index} / ${total}`,
    goToSlide: (index: number) => `슬라이드 ${index}(으)로 이동`,
  },
  // Date picker
  datePicker: {
    label: '날짜 선택기',
    previousYear: '이전 연도',
    previousMonth: '이전 월',
    selectMonth: '월 선택',
    selectYear: '연도 선택',
    nextMonth: '다음 월',
    nextYear: '다음 연도',
    previousYears: (count: number) => `이전 ${count}년`,
    nextYears: (count: number) => `다음 ${count}년`,
    dateRangePickerLabel: '날짜 범위 선택기',
    monthNames: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    shortMonthNames: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  },
  // Time picker
  timePicker: {
    label: '시간 선택기',
    hoursLabel: 'HH',
    minutesLabel: 'MM',
    secondsLabel: 'SS',
    selectHours: '시간 선택',
    selectMinutes: '분 선택',
    selectSeconds: '초 선택',
    selectPeriod: '오전/오후 선택',
    nowLabel: '지금',
  },
  // Time select
  timeSelectTime: '시간 선택',
  dateTimeSelectDateTime: '날짜와 시간 선택',
  // OTP input
  otpInputLabel: '일회용 비밀번호 입력',
  otpDigitLabel: (index: number, total: number) =>
    `${total}자리 중 ${index}번째`,
  // Nine-slice scroll view
  scrollableGridView: '스크롤 가능한 그리드 보기',
  // Onboarding tour
  onboardingTour: {
    label: '가이드 투어',
    stepIndicator: (current: number, total: number) =>
      `단계 ${current} / ${total}`,
    skip: '건너뛰기',
    previous: '이전',
    next: '다음',
    finish: '완료',
  },
  // Combobox
  searchPlaceholder: '검색',
  // PDF Page Viewer
  pdfPageViewer: {
    loading: 'PDF 로딩 중...',
    loadFailed: 'PDF 로드 실패',
    invalidPdf: '유효하지 않은 PDF 파일',
    pageOutOfRange: (page: number, total: number) =>
      `페이지 ${page}이(가) 범위를 벗어났습니다 (1-${total})`,
    renderFailed: 'PDF 페이지 렌더링 실패',
  },
}

export default ko
