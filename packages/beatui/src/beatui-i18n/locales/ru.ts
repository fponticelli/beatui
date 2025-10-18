import { formatFileSize } from '@/utils'
import { BeatUIMessages } from '../default'

export const ru: BeatUIMessages = {
  loadingExtended: 'Загрузка, пожалуйста подождите',
  loadingShort: 'Загрузка...',
  locale: 'Локаль',
  iconDescription: 'Иконка',
  loadingIcon: 'Иконка загрузки',
  failedToLoadIcon: 'Не удалось загрузить иконку',
  editLabel: 'Редактировать',
  selectOne: 'Выберите один',
  selectMany: 'Выберите несколько',
  noResults: 'Нет результатов',
  passwordPlaceholderText: 'Секретный пароль',
  togglePasswordVisibility: 'Переключить видимость пароля',
  toggleMenu: 'Переключить меню',
  toggleAside: 'Переключить боковую панель',
  mainNavigation: 'Основная навигация',
  sidebar: 'Боковая панель',
  closeDrawer: 'Закрыть выдвижную панель',
  closeModal: 'Закрыть модальное окно',
  confirm: 'Подтвердить',
  cancel: 'Отменить',
  addLabel: 'Добавить',
  removeItem: 'Удалить элемент',
  // languages
  currentLocale: 'Русский',
  ar: 'Арабский',
  de: 'Немецкий',
  en: 'Английский',
  es: 'Испанский',
  fr: 'Французский',
  hi: 'Хинди',
  it: 'Итальянский',
  ja: 'Японский',
  ko: 'Корейский',
  nl: 'Нидерландский',
  pl: 'Польский',
  pt: 'Португальский',
  ru: 'Русский',
  tr: 'Турецкий',
  vi: 'Вьетнамский',
  zh: 'Китайский',
  he: 'Иврит',
  fa: 'Персидский',
  ur: 'Урду',
  // input
  emailPlaceholderText: 'Введите электронную почту',
  incrementValue: 'Увеличить значение',
  decrementValue: 'Уменьшить значение',
  // drop zone
  dropZoneInstructions: (clickEnabled: boolean) =>
    clickEnabled
      ? 'Нажмите для выбора или перетащите файлы сюда, или нажмите Enter или Пробел, чтобы открыть выбор файлов'
      : 'Перетащите файлы сюда',
  // size
  fileSizeUnits: ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'],
  // file input
  removeFile: 'Удалить файл',
  clearAllFiles: 'Очистить все файлы',
  // inputs reset
  clearValue: 'Очистить значение',
  unknownType: 'Неизвестный тип',
  filesInputInstructions: (
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction =
      maxFiles == null || maxFiles > 1
        ? 'Нажмите для выбора или перетащите файлы сюда'
        : 'Нажмите для выбора или перетащите файл сюда'

    if (maxFiles || maxFileSize) {
      const constraints: string[] = []

      if (maxFiles != null && maxFiles > 1) {
        let fileText = 'файлов'
        if (maxFiles <= 4) fileText = 'файла'
        constraints.push(`до ${maxFiles} ${fileText}`)
      }

      if (maxFileSize && fileSizeUnits) {
        const formattedSize = formatFileSize(maxFileSize, {
          units: fileSizeUnits,
        })
        constraints.push(`макс ${formattedSize} каждый`)
      }

      if (constraints.length > 0) {
        instruction += ` (${constraints.join(', ')})`
      }
    } else if (maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (макс ${formattedSize})`
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

export default ru
