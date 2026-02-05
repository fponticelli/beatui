import * as offsetModule from '@lexical/offset'

/**
 * Offset utilities for mapping between editor positions and plain-text offsets.
 * Re-exports @lexical/offset functionality for use by selection and mark features.
 */
export async function loadOffsetUtils() {
  return offsetModule
}
