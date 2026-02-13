/**
 * Public entry point for the `@tempots/beatui/tailwind` optional module.
 *
 * Re-exports the BeatUI Tailwind CSS preset, the Vite plugin options type,
 * and related utilities for integrating BeatUI's design token system with
 * Tailwind CSS.
 *
 * ```ts
 * import { createBeatuiPreset, beatuiPreset } from '@tempots/beatui/tailwind'
 * ```
 *
 * @module
 */

export * from './preset'
export type { BeatuiTailwindPluginOptions } from './vite-plugin'
