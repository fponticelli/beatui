import {
  Renderable,
  Value,
  html,
  attr,
  WithElement,
  prop,
  When,
  on,
  style,
  OnDispose,
  Fragment,
} from '@tempots/dom'
import { interval } from '@tempots/std'

export type BaseVideoProgress = {
  played: number
  playedSeconds: number
  loaded: number
  loadedSeconds: number
}

export type BaseVideoConfig = {
  file?: {
    forceHLS?: boolean
    attributes?: Record<string, string | number | boolean>
  }
  hls?: Record<string, unknown>
}

export type BaseVideoPlayerOptions = {
  url: Value<string | null>
  playing?: Value<boolean>
  loop?: Value<boolean>
  controls?: Value<boolean>
  volume?: Value<number> // 0..1
  muted?: Value<boolean>
  playbackRate?: Value<number>
  pip?: Value<boolean>
  playsinline?: Value<boolean>
  width?: Value<string | number | undefined>
  height?: Value<string | number | undefined>
  progressInterval?: Value<number>
  // Seek in seconds; when it changes, player seeks
  seekTo?: Value<number | null | undefined>
  // Provider-specific config passthrough
  config?: BaseVideoConfig
  // Callbacks (ReactPlayer-compatible names)
  onReady?: () => void
  onStart?: () => void
  onPlay?: () => void
  onPause?: () => void
  onBuffer?: () => void
  onBufferEnd?: () => void
  onEnded?: () => void
  onError?: (e: unknown) => void

  onDuration?: (seconds: number) => void
  onSeek?: (seconds: number) => void
  onProgress?: (progress: BaseVideoProgress) => void
  onPlaybackRateChange?: (rate: number) => void
  onPlaybackQualityChange?: (quality: string) => void
}

function isYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)
}

// Minimal YouTube typings and loader (no external deps)
type YTPlayerState = {
  PLAYING: number
  PAUSED: number
  BUFFERING: number
  ENDED: number
}

interface YTPlayer {
  loadVideoById: (opts: { videoId: string }) => void
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  mute: () => void
  unMute: () => void
  getDuration: () => number

  getCurrentTime: () => number
  getVideoLoadedFraction: () => number
  destroy: () => void
}

interface YTNamespace {
  Player: new (el: HTMLElement, opts: unknown) => YTPlayer
  PlayerState: YTPlayerState
}

type YTPlayerVars = {
  autoplay?: 0 | 1
  controls?: 0 | 1
  rel?: 0 | 1
  playsinline?: 0 | 1
  modestbranding?: 0 | 1
  loop?: 0 | 1
  playlist?: string
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

// Lazy loader for YouTube IFrame API without npm deps
let youTubeReadyPromise: Promise<YTNamespace> | null = null
function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window !== 'undefined' && window.YT?.Player) {
    return Promise.resolve(window.YT)
  }
  if (youTubeReadyPromise) return youTubeReadyPromise
  youTubeReadyPromise = new Promise(resolve => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT as YTNamespace)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
  })
  return youTubeReadyPromise
}

export function BaseVideoPlayer(options: BaseVideoPlayerOptions): Renderable {
  const {
    url,
    playing = false,
    loop = false,
    controls = false,
    volume = 1,
    muted = false,
    playbackRate = 1,
    pip = false,
    playsinline = true,
    width,
    height,
    progressInterval = 1000,
    seekTo,

    config,
    onReady,
    onStart,
    onPlay,
    onPause,
    onBuffer,
    onBufferEnd,
    onEnded,
    onError,
    onDuration,
    onSeek,
    onProgress,
    onPlaybackRateChange,
    onPlaybackQualityChange,
  } = options

  function isHlsUrl(url: string): boolean {
    return /\.m3u8(\?|$)/i.test(url)
  }

  function canUseNativeHls(video: HTMLVideoElement): boolean {
    try {
      const t = video.canPlayType('application/vnd.apple.mpegurl')
      return t === 'probably' || t === 'maybe'
    } catch {
      return false
    }
  }

  const provider = prop<'file' | 'youtube'>('file')

  // ---- File provider (HTML5 video) ----
  let fileVideoEl: HTMLVideoElement | null = null
  let clearFileProgress: (() => void) | null = null

  // HLS support (lazy-loaded)

  interface HlsInstance {
    attachMedia(media: HTMLMediaElement): void
    loadSource(url: string): void
    destroy(): void
    on(event: string, handler: (...args: unknown[]) => void): void
  }

  let hlsInst: HlsInstance | null = null

  function destroyAdaptiveLoaders() {
    try {
      hlsInst?.destroy()
    } catch {}
    hlsInst = null
  }
  // Track provider based on URL (after fileVideoEl is declared)
  const cleanups = []
  cleanups.push(
    Value.on(url, u => {
      if (typeof u === 'string' && u.length > 0 && isYouTubeUrl(u)) {
        provider.value = 'youtube'
      } else {
        provider.value = 'file'
        if (fileVideoEl) {
          void attachFileSource()
        }
      }
    })
  )

  async function attachFileSource() {
    const v = fileVideoEl
    if (!v) return
    const u = Value.get(url)
    if (typeof u !== 'string' || u.length === 0) return

    // Clean any previous adaptive loader
    destroyAdaptiveLoaders()

    const forceHLS = config?.file?.forceHLS ?? false

    if (isHlsUrl(u) || forceHLS) {
      // Try native HLS first
      if (canUseNativeHls(v)) {
        v.setAttribute('src', u)
        try {
          v.load()
        } catch {}
        return
      }
      if (typeof window === 'undefined') return
      try {
        const mod = (await import('hls.js')) as unknown
        const m = mod as { default?: unknown; Hls?: unknown } & Record<
          string,
          unknown
        >
        let candidate: unknown =
          m.default ?? (m as Record<string, unknown>).Hls ?? mod
        // Unwrap nested default exports (Vitest/ESM interop can double-wrap)
        for (let i = 0; i < 3; i++) {
          if (
            typeof candidate === 'object' &&
            candidate != null &&
            'default' in (candidate as Record<string, unknown>)
          ) {
            candidate = (candidate as { default: unknown }).default
          } else {
            break
          }
        }
        if (typeof candidate === 'function') {
          const Ctor = candidate as {
            isSupported: () => boolean
            new (config?: Record<string, unknown> | undefined): HlsInstance
          }
          if (typeof Ctor.isSupported === 'function' && Ctor.isSupported()) {
            v.removeAttribute('src')
            try {
              v.load()
            } catch {}
            const inst = new Ctor(config?.hls)
            hlsInst = inst
            inst.attachMedia(v)
            inst.loadSource(u)
          } else {
            v.setAttribute('src', u)
            try {
              v.load()
            } catch {}
          }
        } else {
          v.setAttribute('src', u)
          try {
            v.load()
          } catch {}
        }
      } catch (e) {
        onError?.(e)
        v.setAttribute('src', u)
        try {
          v.load()
        } catch {}
      }
      return
    }

    // Default file source
    v.setAttribute('src', u)
    try {
      v.load()
    } catch {}
  }

  function setupFileProgress() {
    clearFileProgress?.()
    const intervalMs = Value.get(progressInterval) ?? 1000
    clearFileProgress = interval(() => {
      const v = fileVideoEl
      if (!v) return
      const duration = v.duration || 0
      const current = v.currentTime || 0
      const bufferedEnd = v.buffered?.length
        ? v.buffered.end(v.buffered.length - 1)
        : 0
      onProgress?.({
        played: duration > 0 ? current / duration : 0,
        playedSeconds: current,
        loaded: duration > 0 ? Math.min(bufferedEnd, duration) / duration : 0,
        loadedSeconds: Math.min(bufferedEnd, duration),
      })
    }, intervalMs)
  }

  function cssSize(v: string | number | undefined | null): string | undefined {
    if (v == null) return undefined
    return typeof v === 'number' ? `${v}px` : v
  }

  const fileVideo = html.video(
    WithElement(el => {
      fileVideoEl = el as HTMLVideoElement
      onReady?.()
      // initial props
      try {
        fileVideoEl.playbackRate = Value.get(playbackRate) ?? 1
      } catch {}
      fileVideoEl.muted = !!(Value.get(muted) ?? false)
      fileVideoEl.loop = !!(Value.get(loop) ?? false)
      fileVideoEl.controls = !!(Value.get(controls) ?? false)
      if (fileVideoEl.playsInline != null) {
        const pi = !!(Value.get(playsinline) ?? true)
        if (pi) fileVideoEl.setAttribute('playsinline', '')
        else fileVideoEl.removeAttribute('playsinline')
      }
      if (Value.get(playing)) {
        fileVideoEl.play?.().catch(() => {})
        onStart?.()
      }
      // initial PiP toggle (best-effort)
      try {
        const want = !!(Value.get(pip) ?? false)
        const d = document as unknown as {
          pictureInPictureElement?: Element | null
          exitPictureInPicture?: () => Promise<void>
        }
        const v = fileVideoEl as unknown as {
          requestPictureInPicture?: () => Promise<unknown>
        }
        if (want) {
          if (
            typeof v.requestPictureInPicture === 'function' &&
            d.pictureInPictureElement !== fileVideoEl
          ) {
            void v.requestPictureInPicture().catch(() => {})
          }
        } else if (
          d.pictureInPictureElement === fileVideoEl &&
          typeof d.exitPictureInPicture === 'function'
        ) {
          void d.exitPictureInPicture().catch(() => {})
        }
      } catch {}
      setupFileProgress()
      attachFileSource()
    }),
    // size
    style.width(
      Value.map(width as Value<string | number | undefined>, cssSize)
    ),
    style.height(
      Value.map(height as Value<string | number | undefined>, cssSize)
    ),
    // Events
    on.play(() => onPlay?.()),
    on.playing(() => {
      onStart?.()
      onBufferEnd?.()
    }),
    on.pause(() => onPause?.()),
    on.waiting(() => onBuffer?.()),
    on.canplay(() => {
      const d = fileVideoEl?.duration
      if (d != null && Number.isFinite(d)) onDuration?.(d)
    }),
    on.ended(() => onEnded?.()),
    on.error(e => {
      // Suppress generic HTMLMediaElement error when HLS is active;
      // hls.js will surface detailed errors via its own event hooks
      if (!hlsInst) onError?.(e)
    })
  )

  // ---- YouTube provider (via IFrame API) ----
  let ytContainerEl: HTMLElement | null = null
  let ytPlayer: YTPlayer | null = null
  let clearYtProgress: (() => void) | null = null

  function ensureYtPlayer() {
    const u = Value.get(url)
    if (!ytContainerEl || typeof u !== 'string') return
    loadYouTubeApi().then(YTApi => {
      const videoId = parseYouTubeId(u)
      if (!videoId) return
      if (ytPlayer) {
        // load new video
        ytPlayer.loadVideoById({ videoId })
        return
      }
      ytPlayer = new YTApi.Player(ytContainerEl!, {
        videoId,
        playerVars: buildYouTubePlayerVars(options),
        events: {
          onReady: () => {
            onReady?.()
            applyYtProps() // apply initial props
            if (Value.get(playing)) onStart?.()
            setupYtProgress()
          },
          onStateChange: (e: { data: number }) => {
            switch (e.data) {
              case YTApi.PlayerState.PLAYING:
                onPlay?.()
                onBufferEnd?.()
                break
              case YTApi.PlayerState.PAUSED:
                onPause?.()
                break
              case YTApi.PlayerState.BUFFERING:
                onBuffer?.()
                break
              case YTApi.PlayerState.ENDED:
                onEnded?.()
                break
            }
          },
          onError: (e: unknown) => onError?.(e),
          onPlaybackRateChange: (e: { data: number }) =>
            onPlaybackRateChange?.(e.data),
          onPlaybackQualityChange: (e: { data: string }) =>
            onPlaybackQualityChange?.(e.data),
        },
      })
    })
  }

  function setupYtProgress() {
    clearYtProgress?.()
    const intervalMs = Value.get(progressInterval) ?? 1000
    clearYtProgress = interval(() => {
      if (!ytPlayer) return
      const duration = ytPlayer.getDuration?.() ?? 0
      const current = ytPlayer.getCurrentTime?.() ?? 0
      const loadedFraction = ytPlayer.getVideoLoadedFraction?.() ?? 0
      onProgress?.({
        played: duration > 0 ? current / duration : 0,
        playedSeconds: current,
        loaded: loadedFraction,
        loadedSeconds: loadedFraction * duration,
      })
    }, intervalMs)
  }

  function applyYtProps() {
    if (!ytPlayer) return
    try {
      const rate = Value.get(playbackRate) ?? 1
      ytPlayer.setPlaybackRate?.(rate)
    } catch {}
    try {
      const vol = Math.round(
        Math.min(Math.max(Value.get(volume) ?? 1, 0), 1) * 100
      )
      ytPlayer.setVolume?.(vol)
    } catch {}
    try {
      const isMuted = Value.get(muted) ?? false
      if (isMuted) ytPlayer.mute?.()
      else ytPlayer.unMute?.()
    } catch {}
    const isPlaying = Value.get(playing) ?? false
    if (isPlaying) ytPlayer.playVideo?.()
    else ytPlayer.pauseVideo?.()
    const seek = Value.get(seekTo)
    if (typeof seek === 'number' && Number.isFinite(seek)) {
      ytPlayer.seekTo?.(seek, true)
      onSeek?.(seek)
    }
  }

  const youTubeNode = html.div(
    WithElement(el => {
      ytContainerEl = el as HTMLElement
      ensureYtPlayer()
      onReady?.()
    })
  )

  // Apply reactive changes to providers
  cleanups.push(
    Value.on(url, () => {
      if (provider.value === 'youtube') ensureYtPlayer()
    })
  )

  cleanups.push(
    Value.on(playing, () => {
      if (provider.value === 'file' && fileVideoEl) {
        if (Value.get(playing)) {
          fileVideoEl.play?.().catch(() => {})
        } else {
          fileVideoEl.pause?.()
        }
      } else if (provider.value === 'youtube' && ytPlayer) {
        if (Value.get(playing)) {
          ytPlayer.playVideo?.()
        } else {
          ytPlayer.pauseVideo?.()
        }
      }
    })
  )

  cleanups.push(
    Value.on(volume, () => {
      if (provider.value === 'file' && fileVideoEl) {
        fileVideoEl.volume = Math.min(Math.max(Value.get(volume) ?? 1, 0), 1)
      } else if (provider.value === 'youtube' && ytPlayer) {
        const vol = Math.round(
          Math.min(Math.max(Value.get(volume) ?? 1, 0), 1) * 100
        )
        ytPlayer.setVolume?.(vol)
      }
    })
  )

  cleanups.push(
    Value.on(muted, () => {
      if (provider.value === 'file' && fileVideoEl) {
        fileVideoEl.muted = !!Value.get(muted)
      } else if (provider.value === 'youtube' && ytPlayer) {
        if (Value.get(muted)) {
          ytPlayer.mute?.()
        } else {
          ytPlayer.unMute?.()
        }
      }
    })
  )

  cleanups.push(
    Value.on(playbackRate, () => {
      if (provider.value === 'file' && fileVideoEl) {
        try {
          fileVideoEl.playbackRate = Value.get(playbackRate) ?? 1
        } catch {}
      } else if (provider.value === 'youtube' && ytPlayer) {
        ytPlayer.setPlaybackRate?.(Value.get(playbackRate) ?? 1)
      }
    })
  )

  cleanups.push(
    Value.on(pip, async () => {
      if (provider.value !== 'file' || !fileVideoEl) return
      try {
        const want = !!(Value.get(pip) ?? false)
        const d = document as unknown as {
          pictureInPictureElement?: Element | null
          exitPictureInPicture?: () => Promise<void>
        }
        const v = fileVideoEl as unknown as {
          requestPictureInPicture?: () => Promise<unknown>
        }
        if (want) {
          if (
            typeof v.requestPictureInPicture === 'function' &&
            d.pictureInPictureElement !== fileVideoEl
          ) {
            await v.requestPictureInPicture()?.catch(() => {})
          }
        } else if (
          d.pictureInPictureElement === fileVideoEl &&
          typeof d.exitPictureInPicture === 'function'
        ) {
          await d.exitPictureInPicture()?.catch(() => {})
        }
      } catch {}
    })
  )

  cleanups.push(
    Value.on(seekTo ?? null, () => {
      const s = Value.get(seekTo)
      if (s == null) return
      if (provider.value === 'file' && fileVideoEl) {
        try {
          fileVideoEl.currentTime = s
          onSeek?.(s)
        } catch {}
      } else if (provider.value === 'youtube' && ytPlayer) {
        ytPlayer.seekTo?.(s, true)
        onSeek?.(s)
      }
    })
  )

  // Dispose behavior
  const container = html.div(
    attr.class('bc-base-video'),
    style.width(
      Value.map(width as Value<string | number | undefined>, cssSize)
    ),
    style.height(
      Value.map(height as Value<string | number | undefined>, cssSize)
    ),
    When(
      Value.map(provider, p => p === 'youtube'),
      () => youTubeNode,
      () => fileVideo
    )
  )

  return Fragment(OnDispose(provider, ...cleanups), container)
}

function parseYouTubeId(url: string): string | null {
  // Handles typical formats: https://www.youtube.com/watch?v=ID, youtu.be/ID, embed/ID
  const vMatch = /[?&]v=([^&#]+)/.exec(url)
  if (vMatch) return vMatch[1]
  const be = /youtu\.be\/([^?&#]+)/.exec(url)
  if (be) return be[1]
  const embed = /youtube\.com\/embed\/([^?&#]+)/.exec(url)
  if (embed) return embed[1]
  return null
}

function buildYouTubePlayerVars(opts: BaseVideoPlayerOptions): YTPlayerVars {
  const pv: YTPlayerVars = {
    autoplay:
      (Value.get(opts.playing as Value<boolean | undefined>) ?? false) ? 1 : 0,
    controls:
      (Value.get(opts.controls as Value<boolean | undefined>) ?? false) ? 1 : 0,
    rel: 0,
    playsinline:
      (Value.get(opts.playsinline as Value<boolean | undefined>) ?? true)
        ? 1
        : 0,
    modestbranding: 1,
  }
  const loop = Value.get(opts.loop as Value<boolean | undefined>) ?? false
  const urlVal = Value.get(opts.url)
  const id = typeof urlVal === 'string' ? parseYouTubeId(urlVal) : null
  if (loop && id) {
    pv.loop = 1
    pv.playlist = id
  }
  return pv
}
