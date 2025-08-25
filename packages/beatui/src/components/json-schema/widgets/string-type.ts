export type StringWidgetOptions = {
  pattern?: string
  minLength?: number
  maxLength?: number
}

export type BinaryWidgetOptions = StringWidgetOptions & {
  format: 'binary'
  mediaType?: string
}

export type DateTimeWidgetOptions = StringWidgetOptions & {
  format: 'date-time'
}

export type DateWidgetOptions = StringWidgetOptions & {
  format: 'date'
}

export type EmailWidgetOptions = StringWidgetOptions & {
  format: 'email'
}

export type MarkdownWidgetOptions = StringWidgetOptions & {
  format: 'markdown'
}

export type PasswordWidgetOptions = StringWidgetOptions & {
  format: 'password'
}

export type TextAreaWidgetOptions = StringWidgetOptions & {
  format: 'textarea'
  rows?: number
}

export type TimeWidgetOptions = StringWidgetOptions & {
  format: 'time'
}

export type UUIDWidgetOptions = StringWidgetOptions & {
  format: 'uuid'
}

export type AnyStringWidgetOptions =
  | BinaryWidgetOptions
  | DateTimeWidgetOptions
  | DateWidgetOptions
  | EmailWidgetOptions
  | MarkdownWidgetOptions
  | PasswordWidgetOptions
  | TextAreaWidgetOptions
  | TimeWidgetOptions
  | UUIDWidgetOptions
