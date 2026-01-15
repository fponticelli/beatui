import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Video Player component documentation page
 */
export class VideoPlayerPage extends BasePage {
  readonly videoPlayers: Locator
  readonly filePlayer: Locator
  readonly youtubePlayer: Locator
  readonly hlsPlayer: Locator
  readonly headings: Locator
  readonly videoElements: Locator
  readonly iframes: Locator

  constructor(page: Page) {
    super(page, '/video-player')
    this.videoPlayers = page.locator('.bc-video-player, video, iframe[src*="youtube"]')
    this.filePlayer = page.locator('video').first()
    this.youtubePlayer = page.locator('iframe[src*="youtube"]')
    this.hlsPlayer = page.locator('video').last()
    this.headings = page.locator('h2, h3')
    this.videoElements = page.locator('video')
    this.iframes = page.locator('iframe')
  }

  async getVideoPlayerCount(): Promise<number> {
    return this.videoPlayers.count()
  }

  async getVideoElementCount(): Promise<number> {
    return this.videoElements.count()
  }

  async isFilePlayerVisible(): Promise<boolean> {
    const count = await this.filePlayer.count()
    if (count === 0) return false
    return this.filePlayer.isVisible()
  }

  async isYoutubePlayerVisible(): Promise<boolean> {
    const count = await this.youtubePlayer.count()
    if (count === 0) return false
    return this.youtubePlayer.first().isVisible()
  }

  async playFileVideo(): Promise<void> {
    await this.filePlayer.evaluate((video: HTMLVideoElement) => video.play())
  }

  async pauseFileVideo(): Promise<void> {
    await this.filePlayer.evaluate((video: HTMLVideoElement) => video.pause())
  }

  async isFileVideoPlaying(): Promise<boolean> {
    return this.filePlayer.evaluate((video: HTMLVideoElement) => !video.paused)
  }

  async getHeadingTexts(): Promise<string[]> {
    const count = await this.headings.count()
    const texts: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await this.headings.nth(i).textContent()
      if (text) texts.push(text)
    }
    return texts
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('video-player'),
    })
  }
}
