import type { BeatUITemporal } from './types'

let temporalPromise: Promise<BeatUITemporal> | null = null

export async function ensureTemporal(): Promise<BeatUITemporal> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any
  if (g.Temporal) return g.Temporal as BeatUITemporal
  if (!temporalPromise) {
    temporalPromise = import('@js-temporal/polyfill').then(mod => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const T = (mod as any).Temporal as BeatUITemporal
      if (!g.Temporal) g.Temporal = T
      return T
    })
  }
  return temporalPromise
}
