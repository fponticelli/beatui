import { hslToRgb } from '../../../../utils'

// ─── Canvas dimensions ──────────────────────────────────────────────────────

export const SL_W = 260
export const SL_H = 160
export const STRIP_H = 14

// ─── Shared clamp ────────────────────────────────────────────────────────────

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

// ─── Canvas draw functions ───────────────────────────────────────────────────

export function drawSLCanvas(canvas: HTMLCanvasElement, hue: number): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  const [hr, hg, hb] = hslToRgb(hue, 1, 0.5)
  const hGrad = ctx.createLinearGradient(0, 0, w, 0)
  hGrad.addColorStop(0, '#ffffff')
  hGrad.addColorStop(1, `rgb(${hr},${hg},${hb})`)
  ctx.fillStyle = hGrad
  ctx.fillRect(0, 0, w, h)
  const vGrad = ctx.createLinearGradient(0, 0, 0, h)
  vGrad.addColorStop(0, 'rgba(0,0,0,0)')
  vGrad.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.fillStyle = vGrad
  ctx.fillRect(0, 0, w, h)
}

export function drawHueCanvas({
  ctx,
  width,
  height,
}: {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}): void {
  const grad = ctx.createLinearGradient(0, 0, width, 0)
  for (const deg of [0, 60, 120, 180, 240, 300, 360]) {
    const [r, g, b] = hslToRgb(deg, 1, 0.5)
    grad.addColorStop(deg / 360, `rgb(${r},${g},${b})`)
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
}

export function drawAlphaCanvas(
  canvas: HTMLCanvasElement,
  r: number,
  g: number,
  b: number
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  const sq = 6
  for (let x = 0; x < w; x += sq * 2) {
    for (let y = 0; y < h; y += sq * 2) {
      ctx.fillStyle = '#cccccc'
      ctx.fillRect(x, y, sq, sq)
      ctx.fillRect(x + sq, y + sq, sq, sq)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x + sq, y, sq, sq)
      ctx.fillRect(x, y + sq, sq, sq)
    }
  }
  const grad = ctx.createLinearGradient(0, 0, w, 0)
  grad.addColorStop(0, `rgba(${r},${g},${b},0)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},1)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

export function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number = 8
): void {
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = (x + y) % (size * 2) < size ? '#e5e5e5' : '#ffffff'
      ctx.fillRect(x, y, size, size)
    }
  }
}
