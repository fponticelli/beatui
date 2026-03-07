import { Use } from '@tempots/dom'
import { Breadcrumbs, type BreadcrumbItem } from '@tempots/beatui'
import { Location } from '@tempots/ui'

export function PageBreadcrumbs() {
  return Use(Location, ({ pathname }) => {
    const items = pathname.map((p: string): BreadcrumbItem[] => {
      const segments = p.split('/').filter(Boolean)
      if (segments.length === 0) return [{ label: 'Home', current: true }]

      const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]
      let href = ''
      for (let i = 0; i < segments.length; i++) {
        href += '/' + segments[i]
        const label = segments[i]
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
        const isLast = i === segments.length - 1
        crumbs.push(isLast ? { label, current: true } : { label, href })
      }
      return crumbs
    })

    return Breadcrumbs({
      items,
      size: 'sm',
    })
  })
}
