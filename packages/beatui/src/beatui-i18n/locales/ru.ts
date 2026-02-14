import { formatFileSize } from '../../utils'
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
  selectNone: 'Ничего',
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
    }

    return instruction
  },
  // Pagination
  paginationLabel: 'Пагинация',
  firstPage: 'Первая страница',
  previousPage: 'Предыдущая страница',
  nextPage: 'Следующая страница',
  lastPage: 'Последняя страница',
  // Breadcrumbs
  breadcrumbs: 'Хлебные крошки',
  // Command palette
  commandPalette: 'Палитра команд',
  typeACommand: 'Введите команду...',
  noResultsFound: 'Результаты не найдены',
  noMatchingCommands: 'Нет подходящих команд',
  // Appearance
  appearanceSystem: 'Системная',
  appearanceLight: 'Светлая',
  appearanceDark: 'Тёмная',
  // Dialogs
  ok: 'OK',
  changeTypeConfirmation:
    'Changing type will clear the current value. Continue?',
  // Notifications
  notifications: 'Notifications',
  markAllAsRead: 'Mark all as read',
  noNotifications: 'No notifications',
  // JSON Schema
  schemaConflictsDetected: 'Schema Conflicts Detected',
  schemaViolationsDetected: 'Schema Violations Detected',
  properties: 'Properties',
  // File upload
  uploading: 'Uploading...',
  dropFilesOrBrowse: 'Drop files here or click to browse',
  acceptedTypes: (types: string) => `Accepted types: ${types}`,
  // Rich text
  enterUrlPrompt: 'Enter URL:',
  exceeded: '(exceeded)',
  // PDF
  pdfPreview: 'Предпросмотр PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Шрифт',
    fontSize: 'Размер шрифта',
    fontColor: 'Цвет шрифта',
    highlightColor: 'Цвет выделения',
    backgroundColor: 'Цвет фона',
    bold: 'Полужирный',
    italic: 'Курсив',
    underline: 'Подчёркнутый',
    strikethrough: 'Зачёркнутый',
    code: 'Код',
    clearFormatting: 'Очистить форматирование',
    normal: 'Обычный',
    heading: (level: number) => `Заголовок ${level}`,
    bulletList: 'Маркированный список',
    orderedList: 'Нумерованный список',
    checkList: 'Список задач',
    indent: 'Увеличить отступ',
    outdent: 'Уменьшить отступ',
    blockquote: 'Цитата',
    codeBlock: 'Блок кода',
    horizontalRule: 'Горизонтальная линия',
    insertTable: 'Вставить таблицу',
    link: 'Ссылка',
    undo: 'Отменить',
    redo: 'Повторить',
    cut: 'Вырезать',
    copy: 'Копировать',
    paste: 'Вставить',
    defaultOption: 'По умолчанию',
    slashCommands: 'Слеш-команды',
    noCommandsFound: 'Команды не найдены',
    changeBlockType: 'Изменить тип блока',
    blockTypes: 'Типы блоков',
    enterUrl: 'Введите URL:',
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
    loading: 'Загрузка PDF...',
    loadFailed: 'Не удалось загрузить PDF',
    invalidPdf: 'Недействительный файл PDF',
    pageOutOfRange: (page: number, total: number) =>
      `Страница ${page} вне диапазона (1-${total})`,
    renderFailed: 'Не удалось отобразить страницу PDF',
  },
}

export default ru
