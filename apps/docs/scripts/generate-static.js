import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Simple static generation script for SEO optimization
 * This script enhances the built HTML with better meta tags and structured data
 */

const distPath = resolve(process.cwd(), 'dist')
const indexPath = resolve(distPath, 'index.html')

try {
  // Read the built HTML file
  let html = readFileSync(indexPath, 'utf-8')
  
  // Enhanced meta tags for SEO
  const seoMeta = `
  <meta name="description" content="BeatUI - Modern TypeScript UI Component Library with design tokens and layered CSS architecture">
  <meta name="keywords" content="typescript, ui components, design tokens, css architecture, vite, dom manipulation">
  <meta name="author" content="Franco Ponticelli">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://beatui.dev/">
  <meta property="og:title" content="BeatUI - Modern TypeScript UI Components">
  <meta property="og:description" content="Build beautiful, accessible interfaces with TypeScript-first design tokens and layered CSS architecture">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://beatui.dev/">
  <meta property="twitter:title" content="BeatUI - Modern TypeScript UI Components">
  <meta property="twitter:description" content="Build beautiful, accessible interfaces with TypeScript-first design tokens and layered CSS architecture">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BeatUI",
    "description": "Modern TypeScript UI Component Library",
    "url": "https://beatui.dev",
    "author": {
      "@type": "Person",
      "name": "Franco Ponticelli"
    },
    "programmingLanguage": "TypeScript",
    "operatingSystem": "Cross-platform"
  }
  </script>`
  
  // Insert SEO meta tags before closing head tag
  html = html.replace('</head>', `${seoMeta}\n</head>`)
  
  // Write the enhanced HTML back
  writeFileSync(indexPath, html, 'utf-8')
  
  console.log('✅ Static generation completed successfully')
  console.log('📄 Enhanced HTML with SEO meta tags and structured data')
  
} catch (error) {
  console.error('❌ Static generation failed:', error.message)
  process.exit(1)
}
