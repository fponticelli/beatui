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
  unknownType: 'Неизвестный тип',
  fileInputInstructions: (
    allowMultiple: boolean,
    maxFiles: number | undefined,
    maxFileSize: number | undefined,
    fileSizeUnits: string[]
  ): string => {
    let instruction = allowMultiple
      ? 'Нажмите для выбора или перетащите файлы сюда'
      : 'Нажмите для выбора или перетащите файл сюда'

    if (allowMultiple && (maxFiles || maxFileSize)) {
      const constraints: string[] = []

      if (maxFiles) {
        let fileText = 'файлов'
        if (maxFiles === 1) fileText = 'файл'
        else if (maxFiles >= 2 && maxFiles <= 4) fileText = 'файла'
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
    } else if (!allowMultiple && maxFileSize && fileSizeUnits) {
      const formattedSize = formatFileSize(maxFileSize, {
        units: fileSizeUnits,
      })
      instruction += ` (макс ${formattedSize})`
    }

    return instruction
  },
}

export default ru
