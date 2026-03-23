import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import {
  StatCard,
  StatCardValue,
  StatCardLabel,
  StatCardTrend,
  StatCardIcon,
  StatCardSparkline,
} from '../../src/components/data/stat-card'
import { BeatUI } from '../../src/components/beatui'
import type { TrendDirection } from '../../src/components/data/stat-card'

describe('StatCard', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with default options', () => {
    render(BeatUI({}, StatCard({}, 'content')), container)

    const card = container.querySelector('.bc-stat-card')
    expect(card).not.toBeNull()
    expect(card?.getAttribute('role')).toBe('group')
  })

  it('should apply variant class', () => {
    render(BeatUI({}, StatCard({ variant: 'elevated' }, 'content')), container)

    const card = container.querySelector('.bc-stat-card')
    expect(card?.classList.contains('bc-stat-card--elevated')).toBe(true)
  })

  it('should apply size class', () => {
    render(BeatUI({}, StatCard({ size: 'lg' }, 'content')), container)

    const card = container.querySelector('.bc-stat-card')
    expect(card?.classList.contains('bc-stat-card--padding-lg')).toBe(true)
  })

  it('should render StatCardValue', () => {
    render(
      BeatUI({}, StatCard({}, StatCardValue({}, '1,234'))),
      container
    )

    const value = container.querySelector('.bc-stat-card__value')
    expect(value).not.toBeNull()
    expect(value?.textContent).toBe('1,234')
  })

  it('should render StatCardLabel', () => {
    render(
      BeatUI({}, StatCard({}, StatCardLabel({}, 'Active Users'))),
      container
    )

    const label = container.querySelector('.bc-stat-card__label')
    expect(label).not.toBeNull()
    expect(label?.textContent).toBe('Active Users')
  })

  it('should render StatCardTrend with up direction', () => {
    render(
      BeatUI(
        {},
        StatCard(
          {},
          StatCardTrend({ value: '+12%', direction: 'up' })
        )
      ),
      container
    )

    const trend = container.querySelector('.bc-stat-card__trend')
    expect(trend).not.toBeNull()
    expect(trend?.classList.contains('bc-stat-card__trend--up')).toBe(true)
    expect(trend?.getAttribute('role')).toBe('status')
    expect(trend?.getAttribute('aria-label')).toBe('Trending up: +12%')

    const trendValue = container.querySelector('.bc-stat-card__trend-value')
    expect(trendValue?.textContent).toBe('+12%')
  })

  it('should render StatCardTrend with down direction', () => {
    render(
      BeatUI(
        {},
        StatCard(
          {},
          StatCardTrend({ value: '-5%', direction: 'down' })
        )
      ),
      container
    )

    const trend = container.querySelector('.bc-stat-card__trend')
    expect(trend?.classList.contains('bc-stat-card__trend--down')).toBe(true)
  })

  it('should render StatCardTrend with flat direction', () => {
    render(
      BeatUI(
        {},
        StatCard(
          {},
          StatCardTrend({ value: '0%', direction: 'flat' })
        )
      ),
      container
    )

    const trend = container.querySelector('.bc-stat-card__trend')
    expect(trend?.classList.contains('bc-stat-card__trend--flat')).toBe(true)
  })

  it('should render StatCardIcon', () => {
    render(
      BeatUI({}, StatCard({}, StatCardIcon({}, 'icon-content'))),
      container
    )

    const icon = container.querySelector('.bc-stat-card__icon')
    expect(icon).not.toBeNull()
  })

  it('should render StatCardSparkline', () => {
    render(
      BeatUI({}, StatCard({}, StatCardSparkline({}, 'chart'))),
      container
    )

    const sparkline = container.querySelector('.bc-stat-card__sparkline')
    expect(sparkline).not.toBeNull()
  })

  it('should compose all sub-components', () => {
    render(
      BeatUI(
        {},
        StatCard(
          { variant: 'elevated', size: 'lg' },
          StatCardIcon({}, 'icon'),
          StatCardValue({}, '9,876'),
          StatCardLabel({}, 'Revenue'),
          StatCardTrend({ value: '+8.3%', direction: 'up' }),
          StatCardSparkline({}, 'sparkline')
        )
      ),
      container
    )

    expect(container.querySelector('.bc-stat-card--elevated')).not.toBeNull()
    expect(container.querySelector('.bc-stat-card__icon')).not.toBeNull()
    expect(container.querySelector('.bc-stat-card__value')?.textContent).toBe('9,876')
    expect(container.querySelector('.bc-stat-card__label')?.textContent).toBe('Revenue')
    expect(container.querySelector('.bc-stat-card__trend')).not.toBeNull()
    expect(container.querySelector('.bc-stat-card__sparkline')).not.toBeNull()
  })

  it('should react to trend direction changes', async () => {
    const direction = prop<TrendDirection>('up')
    render(
      BeatUI(
        {},
        StatCard({}, StatCardTrend({ value: '5%', direction }))
      ),
      container
    )

    const trend = container.querySelector('.bc-stat-card__trend')
    expect(trend?.classList.contains('bc-stat-card__trend--up')).toBe(true)

    direction.set('down')
    await vi.waitFor(() => {
      expect(trend?.classList.contains('bc-stat-card__trend--down')).toBe(true)
    })
  })

  it('should react to value changes', async () => {
    const val = prop('100')
    render(
      BeatUI(
        {},
        StatCard({}, StatCardTrend({ value: val, direction: 'up' }))
      ),
      container
    )

    const trendValue = container.querySelector('.bc-stat-card__trend-value')
    expect(trendValue?.textContent).toBe('100')

    val.set('200')
    await vi.waitFor(() => {
      expect(trendValue?.textContent).toBe('200')
    })
  })

  it('should apply custom class to sections', () => {
    render(
      BeatUI(
        {},
        StatCard(
          {},
          StatCardValue({ class: 'custom-value' }, '1'),
          StatCardLabel({ class: 'custom-label' }, 'L')
        )
      ),
      container
    )

    const value = container.querySelector('.bc-stat-card__value')
    expect(value?.classList.contains('custom-value')).toBe(true)

    const label = container.querySelector('.bc-stat-card__label')
    expect(label?.classList.contains('custom-label')).toBe(true)
  })
})
