export interface SearchEntry {
  type: 'component' | 'api'
  name: string
  url: string
  category: string
  description: string
  keywords: string[]
  icon: string
}

export interface SearchResult {
  entry: SearchEntry
  score: number
}

let cachedIndex: SearchEntry[] | null = null

export async function loadSearchIndex(): Promise<SearchEntry[]> {
  if (cachedIndex) return cachedIndex
  const resp = await fetch('/search-index.json')
  if (!resp.ok) throw new Error(`Failed to load search index: ${resp.status}`)
  cachedIndex = (await resp.json()) as SearchEntry[]
  return cachedIndex
}

export function searchEntries(
  index: SearchEntry[],
  query: string
): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const terms = q.split(/\s+/)
  const results: SearchResult[] = []

  for (const entry of index) {
    let score = 0

    const nameLower = entry.name.toLowerCase()
    const descLower = entry.description.toLowerCase()
    const categoryLower = entry.category.toLowerCase()
    const keywordsLower = entry.keywords.map(k => k.toLowerCase())

    for (const term of terms) {
      let termMatched = false

      if (nameLower === term) {
        score += 100
        termMatched = true
      } else if (nameLower.startsWith(term)) {
        score += 80
        termMatched = true
      } else if (nameLower.includes(term)) {
        score += 50
        termMatched = true
      }

      if (categoryLower.includes(term)) {
        score += 30
        termMatched = true
      }

      if (keywordsLower.some(k => k.includes(term))) {
        score += 25
        termMatched = true
      }

      if (descLower.includes(term)) {
        score += 15
        termMatched = true
      }

      if (!termMatched) {
        score = 0
        break
      }
    }

    // Boost component entries slightly over API entries for same score
    if (score > 0) {
      if (entry.type === 'component') score += 5
      results.push({ entry, score })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results
}
