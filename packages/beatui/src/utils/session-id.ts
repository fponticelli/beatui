const counters = new Map<string, number>()

/**
 * Generates a unique session ID for the given prefix
 * @param prefix The prefix to use for the session ID
 * @returns The generated session ID
 */
export function sessionId(prefix: string) {
  const count = counters.get(prefix) ?? 0
  counters.set(prefix, count + 1)
  return `${prefix}-${count}`
}
