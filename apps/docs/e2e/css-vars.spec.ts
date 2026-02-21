import { test } from '@playwright/test'

test('CSS variable scaling analysis', async ({ page }) => {
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message))

  // --- INPUT PAGE ---
  await page.goto('/inputs', { waitUntil: 'networkidle' })
  await page.waitForSelector('.bc-input-container', { timeout: 15000 })

  // Find the main content div (has --spacing-base in inline style)
  const mainContent = page.locator('[style*="--spacing-base"]').first()

  // Target inputs INSIDE the main content, not the header NumberInputs
  const inputContainer = mainContent.locator('.bc-input-container').first()
  const innerInput = mainContent.locator('.bc-input-container__input').first()

  // --- DEFAULT STATE ---
  console.log('\n=== DEFAULT (--spacing-base: 0.25rem, --font-size-base: 1rem) ===')

  const defaultInput = await inputContainer.boundingBox()
  console.log('Input container size:', { w: defaultInput!.width, h: defaultInput!.height })

  const defaultInner = await innerInput.evaluate(el => {
    const cs = getComputedStyle(el)
    return {
      paddingBlock: `${cs.paddingTop} / ${cs.paddingBottom}`,
      paddingInline: `${cs.paddingLeft} / ${cs.paddingRight}`,
      fontSize: cs.fontSize,
      classes: Array.from(el.classList).join(' '),
    }
  })
  console.log('Inner wrapper:', defaultInner)

  const varChain = await innerInput.evaluate(el => {
    const cs = getComputedStyle(el)
    return {
      '--spacing-base': cs.getPropertyValue('--spacing-base').trim(),
      '--spacing-md': cs.getPropertyValue('--spacing-md').trim(),
      '--spacing-lg': cs.getPropertyValue('--spacing-lg').trim(),
      '--control-padding-block-md': cs.getPropertyValue('--control-padding-block-md').trim(),
      '--control-padding-inline-md': cs.getPropertyValue('--control-padding-inline-md').trim(),
      '--font-size-base': cs.getPropertyValue('--font-size-base').trim(),
      '--font-size-md': cs.getPropertyValue('--font-size-md').trim(),
    }
  })
  console.log('Variable chain:', varChain)

  // --- DOUBLE SPACING ---
  console.log('\n=== DOUBLED (--spacing-base: 0.5rem) ===')
  await mainContent.evaluate(el => el.style.setProperty('--spacing-base', '0.5rem'))
  await page.waitForTimeout(200)

  const scaledInput = await inputContainer.boundingBox()
  console.log('Input container size:', { w: scaledInput!.width, h: scaledInput!.height })

  const scaledInner = await innerInput.evaluate(el => {
    const cs = getComputedStyle(el)
    return {
      paddingBlock: `${cs.paddingTop} / ${cs.paddingBottom}`,
      paddingInline: `${cs.paddingLeft} / ${cs.paddingRight}`,
      fontSize: cs.fontSize,
    }
  })
  console.log('Inner wrapper:', scaledInner)

  const scaledVars = await innerInput.evaluate(el => {
    const cs = getComputedStyle(el)
    return {
      '--spacing-base': cs.getPropertyValue('--spacing-base').trim(),
      '--spacing-md': cs.getPropertyValue('--spacing-md').trim(),
      '--spacing-lg': cs.getPropertyValue('--spacing-lg').trim(),
      '--control-padding-block-md': cs.getPropertyValue('--control-padding-block-md').trim(),
      '--control-padding-inline-md': cs.getPropertyValue('--control-padding-inline-md').trim(),
    }
  })
  console.log('Scaled variables:', scaledVars)

  // Height change analysis
  const heightChanged = scaledInput!.height !== defaultInput!.height
  console.log(`Height changed: ${heightChanged} (${defaultInput!.height} → ${scaledInput!.height})`)

  // --- FONT SIZE ---
  console.log('\n=== FONT SIZE (--font-size-base: 1.5rem) ===')
  await mainContent.evaluate(el => {
    el.style.setProperty('--spacing-base', '0.25rem') // reset
    el.style.setProperty('--font-size-base', '1.5rem')
  })
  await page.waitForTimeout(200)

  const fontInput = await inputContainer.boundingBox()
  console.log('Input container size:', { w: fontInput!.width, h: fontInput!.height })

  const fontInner = await innerInput.evaluate(el => {
    const cs = getComputedStyle(el)
    return {
      fontSize: cs.fontSize,
      '--font-size-base': cs.getPropertyValue('--font-size-base').trim(),
      '--font-size-md': cs.getPropertyValue('--font-size-md').trim(),
    }
  })
  console.log('Inner wrapper font:', fontInner)

  const fontChanged = fontInput!.height !== defaultInput!.height
  console.log(`Font height changed: ${fontChanged} (${defaultInput!.height} → ${fontInput!.height})`)

  // --- SWITCH PAGE ---
  console.log('\n=== SWITCH PAGE ===')
  await page.goto('/switch', { waitUntil: 'networkidle' })
  await page.waitForSelector('.bc-switch__track', { timeout: 15000 })

  const mainContent2 = page.locator('[style*="--spacing-base"]').first()
  const track = page.locator('.bc-switch__track').first()

  const defaultTrack = await track.boundingBox()
  console.log('Default switch track:', { w: defaultTrack!.width, h: defaultTrack!.height })

  const trackVars = await track.evaluate(el => {
    const cs = getComputedStyle(el)
    return {
      paddingBlock: `${cs.paddingTop} / ${cs.paddingBottom}`,
      paddingInline: `${cs.paddingLeft} / ${cs.paddingRight}`,
      '--spacing-base': cs.getPropertyValue('--spacing-base').trim(),
      '--spacing-sm': cs.getPropertyValue('--spacing-sm').trim(),
    }
  })
  console.log('Track vars/padding:', trackVars)

  await mainContent2.evaluate(el => el.style.setProperty('--spacing-base', '0.5rem'))
  await page.waitForTimeout(200)

  const scaledTrack = await track.boundingBox()
  console.log('Scaled switch track:', { w: scaledTrack!.width, h: scaledTrack!.height })

  const scaledTrackVars = await track.evaluate(el => {
    const cs = getComputedStyle(el)
    return {
      paddingBlock: `${cs.paddingTop} / ${cs.paddingBottom}`,
      paddingInline: `${cs.paddingLeft} / ${cs.paddingRight}`,
      '--spacing-base': cs.getPropertyValue('--spacing-base').trim(),
      '--spacing-sm': cs.getPropertyValue('--spacing-sm').trim(),
    }
  })
  console.log('Scaled track vars/padding:', scaledTrackVars)

  const trackHeightChanged = scaledTrack!.height !== defaultTrack!.height
  console.log(`Track height changed: ${trackHeightChanged} (${defaultTrack!.height} → ${scaledTrack!.height})`)
})
