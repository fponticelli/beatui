import { formatFileSize } from '@/utils'
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
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (최대 ${formattedSize})`
    }

    return instruction
  },
}

export default ko
