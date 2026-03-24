export interface StreamOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
  extractContent?: (chunk: unknown) => string
}
