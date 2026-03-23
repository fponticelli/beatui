import { hsla, colorToString } from '@tempots/std/color'

/**
 * Draw a full hue rainbow strip (0→360) on a canvas.
 */
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
    grad.addColorStop(deg / 360, colorToString(hsla(deg, 1, 0.5)))
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draw a checkerboard pattern (used as background for alpha strips/swatches).
 */
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
