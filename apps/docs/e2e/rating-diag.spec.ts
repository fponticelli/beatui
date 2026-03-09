import { test, expect } from '@playwright/test'

test('RatingInput diagnostic', async ({ page }) => {
  await page.goto('/components/rating-input')
  await page.waitForLoadState('networkidle')

  // Find the slider in the playground preview
  const preview = page.locator('.min-w-48.min-h-16').first()
  const slider = preview.locator('[role="slider"]').first()

  // 1. Check starting value
  const initialValue = await slider.getAttribute('aria-valuenow')
  console.log('Initial aria-valuenow:', initialValue)

  // 2. Check what the number input in the panel says
  const panel = page.locator('.lg\\:w-72').first()
  const valueWrapper = panel.locator('.bc-input-wrapper').filter({
    has: page.locator('.bc-input-wrapper__label-text', { hasText: 'value' }),
  })
  const numberInput = valueWrapper.locator('input[type="number"]')
  const inputValue = await numberInput.inputValue()
  console.log('Panel value input:', inputValue)

  // 3. Count the stars
  const stars = slider.locator('.bc-rating-input__icon-container')
  const starCount = await stars.count()
  console.log('Star count:', starCount)

  // 4. Check clipper widths (to see fill state)
  for (let i = 0; i < starCount; i++) {
    const clipper = stars.nth(i).locator('.bc-rating-input__icon-clipper')
    const width = await clipper.evaluate(el => el.style.width)
    console.log(`Star ${i + 1} clipper width: ${width}`)
  }

  // 5. Try clicking on the 5th star (last one)
  const fifthStar = stars.nth(4)
  const box = await fifthStar.boundingBox()
  console.log('5th star bounding box:', JSON.stringify(box))

  await fifthStar.click()
  const afterClickValue = await slider.getAttribute('aria-valuenow')
  console.log('After clicking 5th star, aria-valuenow:', afterClickValue)

  // 6. Try clicking on the 1st star
  await stars.nth(0).click()
  const afterClick1 = await slider.getAttribute('aria-valuenow')
  console.log('After clicking 1st star, aria-valuenow:', afterClick1)

  // 7. Try clicking on the 3rd star
  await stars.nth(2).click()
  const afterClick3 = await slider.getAttribute('aria-valuenow')
  console.log('After clicking 3rd star, aria-valuenow:', afterClick3)

  // 8. Check the panel input again after clicks
  const finalInputValue = await numberInput.inputValue()
  console.log('Panel value input after clicks:', finalInputValue)
})
