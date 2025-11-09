// Social Login Button Component
// Reusable button component for social authentication providers

import {
  attr,
  bind,
  coalesce,
  computedOf,
  ForEach,
  html,
  Renderable,
  Use,
  Value,
} from '@tempots/dom'
import { Button } from '../button'
import { Icon } from '../data/icon'
import { SocialLoginButtonOptions, AuthProviderName } from './index'
import { ControlSize } from '../theme'
import { Stack } from '../layout'
import { ThemeColorName } from '../../tokens'
import { AuthI18n } from '../../auth-i18n/translations'

export function SocialLoginButton({
  provider,
  onClick,
  size = 'md',
  name,
  icon,
  color,
  flow,
  labels,
}: SocialLoginButtonOptions): Renderable {
  const handleClick = async () => {
    if (onClick) {
      try {
        // Add flow-specific behavior if needed
        if (flow === 'popup') {
          // For popup flow, the onClick handler should handle opening a popup
          await onClick()
        } else {
          // For redirect flow (default), the onClick handler should handle redirect
          await onClick()
        }
      } catch (error) {
        console.error(
          `Social login error for ${provider} (${flow || 'redirect'} flow):`,
          error
        )
      }
    }
  }

  return Button(
    {
      type: 'button',
      variant: 'filled',
      size,
      color,
      onClick: handleClick,
      roundedness: 'full',
    },
    attr.class('bc-social-login-button'),
    attr.class(
      computedOf(provider)((p): string => `bc-social-login-button--${p}`)
    ),
    html.span(
      attr.class('bc-social-login-button__inner'),
      html.span(
        attr.class('bc-social-login-button__icon'),
        Icon({ icon, size }, attr.class('bc-social-login-button__icon-inner'))
      ),
      Use(AuthI18n, t =>
        html.span(
          attr.class('bc-social-login-button__label'),
          bind(
            coalesce(labels?.continueWithProvider, t.$.continueWithProvider)
          )(name)
        )
      )
    )
  )
}

export type AuthProviderInfo = {
  provider: AuthProviderName
  flow?: 'redirect' | 'popup'
}

// Convenience function to create multiple social login buttons
export function SocialLoginButtons({
  providers,
  onProviderClick,
  size = 'md',
  className,
}: {
  providers: Value<Array<AuthProviderInfo>>
  onProviderClick?: (provider: AuthProviderName) => Promise<void>
  size?: Value<ControlSize>
  className?: Value<string>
}): Renderable {
  return Stack(
    attr.class('bc-social-login-buttons'),
    attr.class(className),
    ForEach(providers, item =>
      SocialLoginButton({
        provider: item.$.provider,
        flow: item.$.flow,
        color: item.map(
          ({ provider }) =>
            socialProviderInfo[provider].color as
              | ThemeColorName
              | 'black'
              | 'white'
        ),
        name: item.map(({ provider }) => socialProviderInfo[provider].name),
        icon: item.map(({ provider }) => socialProviderInfo[provider].icon),
        onClick: async () => {
          if (onProviderClick) {
            await onProviderClick(item.$.provider.value)
          }
        },
        size,
      })
    )
  )
}

export const socialProviderInfo: Record<
  AuthProviderName,
  { name: string; icon: string; color: ThemeColorName | 'black' }
> = {
  // Core
  google: {
    name: 'Google',
    icon: 'logos:google-icon',
    color: 'red',
  },
  github: {
    name: 'GitHub',
    icon: 'logos:github-icon',
    color: 'black',
  },
  apple: {
    name: 'Apple',
    icon: 'logos:apple',
    color: 'stone', // using stone to differentiate from GitHub/X
  },
  facebook: {
    name: 'Facebook',
    icon: 'logos:facebook',
    color: 'blue',
  },
  twitter: {
    name: 'Twitter',
    icon: 'logos:twitter',
    color: 'sky',
  },
  x: {
    name: 'X',
    icon: 'logos:x',
    color: 'zinc', // avoids duplicate black
  },
  microsoft: {
    name: 'Microsoft',
    icon: 'logos:microsoft-icon',
    color: 'amber',
  },
  discord: {
    name: 'Discord',
    icon: 'logos:discord-icon',
    color: 'indigo',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'logos:linkedin-icon',
    color: 'cyan',
  },

  // Social / Media
  instagram: {
    name: 'Instagram',
    icon: 'logos:instagram-icon',
    color: 'fuchsia',
  },
  tiktok: {
    name: 'TikTok',
    icon: 'logos:tiktok-icon',
    color: 'teal',
  },
  snapchat: {
    name: 'Snapchat',
    icon: 'streamline-logos:snapchat-logo-solid',
    color: 'yellow',
  },
  reddit: {
    name: 'Reddit',
    icon: 'logos:reddit-icon',
    color: 'orange',
  },
  pinterest: {
    name: 'Pinterest',
    icon: 'logos:pinterest',
    color: 'rose',
  },

  // Gaming / Entertainment
  twitch: {
    name: 'Twitch',
    icon: 'logos:twitch',
    color: 'purple',
  },
  steam: {
    name: 'Steam',
    icon: 'logos:steam',
    color: 'slate',
  },
  epic: {
    name: 'Epic Games',
    icon: 'streamline-logos:epic-games-logo-solid',
    color: 'neutral',
  },
  playstation: {
    name: 'PlayStation',
    icon: 'streamline-logos:playstation-logo-solid',
    color: 'violet',
  },
  xbox: {
    name: 'Xbox',
    icon: 'streamline-logos:xbox-live-logo-solid',
    color: 'green',
  },

  // Messaging
  whatsapp: {
    name: 'WhatsApp',
    icon: 'logos:whatsapp-icon',
    color: 'emerald',
  },
  wechat: {
    name: 'WeChat',
    icon: 'streamline-logos:wechat-logo',
    color: 'lime',
  },

  // Other Identity
  amazon: {
    name: 'Amazon',
    icon: 'streamline-logos:amazon-logo-solid',
    color: 'red', // distinct warm tone (not used elsewhere here)
  },
  yahoo: {
    name: 'Yahoo',
    icon: 'logos:yahoo',
    color: 'rose', // unique variation for Yahoo
  },
  paypal: {
    name: 'PayPal',
    icon: 'logos:paypal',
    color: 'blue', // distinct deep blue tone (not Facebook’s exact blue)
  },
}

export type SpecialSocialLoginButtonOptions = Omit<
  SocialLoginButtonOptions,
  'provider' | 'name' | 'icon' | 'color'
>

// Specialized social login button variants
export const GoogleLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['google'],
    provider: 'google',
  })

export const GitHubLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['github'],
    provider: 'github',
  })

export const AppleLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['apple'],
    provider: 'apple',
  })

export const FacebookLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['facebook'],
    provider: 'facebook',
  })

export const XLoginButtin = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['x'],
    provider: 'x',
  })

export const TwitterLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['twitter'],
    provider: 'twitter',
  })

export const MicrosoftLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['microsoft'],
    provider: 'microsoft',
  })

export const DiscordLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['discord'],
    provider: 'discord',
  })

export const LinkedInLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['linkedin'],
    provider: 'linkedin',
  })

export const InstagramLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['instagram'],
    provider: 'instagram',
  })

export const TiktokLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['tiktok'],
    provider: 'tiktok',
  })

export const SnapchatLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['snapchat'],
    provider: 'snapchat',
  })

export const RedditLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['reddit'],
    provider: 'reddit',
  })

export const PinterestLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['pinterest'],
    provider: 'pinterest',
  })

export const TwitchLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['twitch'],
    provider: 'twitch',
  })

export const SteamLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['steam'],
    provider: 'steam',
  })

export const EpicLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['epic'],
    provider: 'epic',
  })

export const PlayStationLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['playstation'],
    provider: 'playstation',
  })

export const XboxLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['xbox'],
    provider: 'xbox',
  })

export const WhatsAppLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['whatsapp'],
    provider: 'whatsapp',
  })

export const WeChatLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['wechat'],
    provider: 'wechat',
  })

export const AmazonLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['amazon'],
    provider: 'amazon',
  })

export const YahooLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['yahoo'],
    provider: 'yahoo',
  })

export const PayPalLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['paypal'],
    provider: 'paypal',
  })
