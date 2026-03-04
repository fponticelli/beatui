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
    'Изменение типа очистит текущее значение. Продолжить?',
  // Notifications
  notifications: 'Уведомления',
  markAllAsRead: 'Отметить все как прочитанные',
  noNotifications: 'Нет уведомлений',
  // JSON Schema
  schemaConflictsDetected: 'Обнаружены конфликты схемы',
  schemaViolationsDetected: 'Обнаружены нарушения схемы',
  properties: 'Свойства',
  // File upload
  uploading: 'Загрузка...',
  dropFilesOrBrowse: 'Перетащите файлы сюда или нажмите для выбора',
  acceptedTypes: (types: string) => `Допустимые типы: ${types}`,
  // Rich text
  enterUrlPrompt: 'Введите URL:',
  exceeded: '(превышено)',
  // PDF
  pdfPreview: 'Предпросмотр PDF',
  // Lexical editor
  lexical: {
    fontFamily: 'Шрифт',
    fontSize: 'Размер шрифта',
    lineHeight: 'Высота строки',
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
    sortAscending: 'Сортировка по возрастанию',
    sortDescending: 'Сортировка по убыванию',
    clearSort: 'Сбросить сортировку',
    filterPlaceholder: 'Фильтр...',
    clearFilter: 'Сбросить фильтр',
    selectAll: 'Выбрать все',
    deselectAll: 'Снять выделение',
    selectedCount: (count: number) => `${count} выбрано`,
    resetAll: 'Сбросить все',
    noResults: 'Результаты не найдены',
    loading: 'Загрузка...',
    // Filter panel
    filterPanelAddCondition: 'Добавить условие',
    filterPanelApply: 'Применить',
    filterPanelClear: 'Очистить фильтры',
    filterPanelAnd: 'И',
    filterPanelOr: 'ИЛИ',
    filterPanelContains: 'Содержит',
    filterPanelNotContains: 'Не содержит',
    filterPanelEquals: 'Равно',
    filterPanelNotEquals: 'Не равно',
    filterPanelStartsWith: 'Начинается с',
    filterPanelEndsWith: 'Заканчивается на',
    filterPanelIsNull: 'Пусто',
    filterPanelIsNotNull: 'Не пусто',
    filterPanelGt: 'Больше',
    filterPanelGte: 'Больше или равно',
    filterPanelLt: 'Меньше',
    filterPanelLte: 'Меньше или равно',
    filterPanelBetween: 'Между',
    filterPanelValuePlaceholder: 'Значение...',
    sortMultiHint: 'Удерживайте Shift для сортировки по нескольким столбцам',
    columnVisibility: 'Столбцы',
    showAllColumns: 'Показать все',
    // Column header menu
    menuSortAsc: 'Сортировать по возрастанию',
    menuSortDesc: 'Сортировать по убыванию',
    menuClearSort: 'Сбросить сортировку',
    menuHideColumn: 'Скрыть столбец',
    menuChooseColumns: 'Выбрать столбцы',
    menuResetColumns: 'Сбросить столбцы',
    menuFilter: 'Фильтр',
    // Row count footer
    rowCount: (filtered: number, total: number) =>
      `Строки: ${filtered}  Всего строк: ${total}`,
    // Tags filter
    filterTagsPlaceholder: 'Выбрать значения...',
    // Group by
    groupCount: (count: number) => `${count} элементов`,
    collapseGroup: 'Свернуть группу',
    expandGroup: 'Развернуть группу',
    describeFilter: {
      textContains: (col: string, val: string) => `${col} содержит "${val}"`,
      textNotContains: (col: string, val: string) =>
        `${col} не содержит "${val}"`,
      textEquals: (col: string, val: string) => `${col} равно "${val}"`,
      textNotEquals: (col: string, val: string) => `${col} не равно "${val}"`,
      textStartsWith: (col: string, val: string) =>
        `${col} начинается с "${val}"`,
      textEndsWith: (col: string, val: string) =>
        `${col} заканчивается на "${val}"`,
      compareEq: (col: string, val: string) => `${col} = ${val}`,
      compareNeq: (col: string, val: string) => `${col} \u2260 ${val}`,
      compareGt: (col: string, val: string) => `${col} > ${val}`,
      compareGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      compareLt: (col: string, val: string) => `${col} < ${val}`,
      compareLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      rangeBetween: (col: string, min: string, max: string) =>
        `${col} между ${min} и ${max}`,
      rangeGte: (col: string, val: string) => `${col} \u2265 ${val}`,
      rangeLte: (col: string, val: string) => `${col} \u2264 ${val}`,
      setIn: (col: string, vals: string) => `${col} в [${vals}]`,
      setNotIn: (col: string, vals: string) => `${col} не в [${vals}]`,
      booleanIs: (col: string, val: string) => `${col} — ${val}`,
      isNull: (col: string) => `${col} пусто`,
      isNotNull: (col: string) => `${col} не пусто`,
      compositeAnd: (descriptions: string[]) => descriptions.join(' И '),
      compositeOr: (descriptions: string[]) => descriptions.join(' ИЛИ '),
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
