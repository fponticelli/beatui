/**
 * Get the number of decimal places in a step value.
 * Uses string representation to determine precision.
 */
function getStepPrecision(step: number): number {
  const str = String(step)
  const dot = str.indexOf('.')
  if (dot === -1) return 0
  return str.length - dot - 1
}

/**
 * Round a value to the precision of the given step to avoid
 * floating-point arithmetic errors (e.g. 0.1 + 0.2 → 0.3 instead of 0.30000000000000004).
 */
export function roundToStep(value: number, step: number): number {
  const precision = getStepPrecision(step)
  if (precision === 0) return Math.round(value)
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}
