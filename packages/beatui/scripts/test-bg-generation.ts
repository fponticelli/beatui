import { generateBackgroundUtilities } from '../src/tokens/colors.js'

// Test the background utilities generation
function testBackgroundGeneration() {
  console.log('🧪 Testing background utilities generation...')
  
  const css = generateBackgroundUtilities()
  
  // Basic checks
  const checks = [
    { name: 'Contains @layer components', test: css.includes('@layer components') },
    { name: 'Contains inherit variant', test: css.includes('.bu-bg--inherit') },
    { name: 'Contains primary solid', test: css.includes('.bu-bg--primary') },
    { name: 'Contains light variants', test: css.includes('.bu-bg--light-primary') },
    { name: 'Contains lighter variants', test: css.includes('.bu-bg--lighter-primary') },
    { name: 'Contains dark mode overrides', test: css.includes('.b-dark .bu-bg--primary') },
    { name: 'Contains special colors in light', test: css.includes('.bu-bg--light-white') },
    { name: 'Contains special colors in lighter', test: css.includes('.bu-bg--lighter-transparent') },
    { name: 'Uses CSS variables', test: css.includes('var(--color-') },
    { name: 'Uses text color variables', test: css.includes('var(--text-normal-') },
  ]
  
  let passed = 0
  let failed = 0
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`✅ ${check.name}`)
      passed++
    } else {
      console.log(`❌ ${check.name}`)
      failed++
    }
  })
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`)
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Background utilities generation is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please check the generation logic.')
    process.exit(1)
  }
  
  // Output some stats
  const lines = css.split('\n').length
  const classes = (css.match(/\.bu-bg--/g) || []).length
  const darkModeClasses = (css.match(/\.b-dark \.bu-bg--/g) || []).length
  
  console.log(`\n📈 Generated CSS Stats:`)
  console.log(`   Lines: ${lines}`)
  console.log(`   Total classes: ${classes}`)
  console.log(`   Dark mode classes: ${darkModeClasses}`)
}

testBackgroundGeneration()
