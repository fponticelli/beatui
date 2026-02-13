/**
 * Social Login Button Component
 *
 * Reusable button components for social authentication providers. Includes
 * a generic `SocialLoginButton`, a multi-button `SocialLoginButtons` container,
 * and pre-configured convenience variants for each supported provider.
 *
 * @module auth/social-login-button
 */

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

/**
 * Renders a branded social login button for a specific authentication provider.
 *
 * Displays the provider's icon and a localized "Continue with {provider}" label.
 * Handles both redirect and popup OAuth flows via the `onClick` handler.
 *
 * @param options - Configuration options for the social login button.
 * @returns A `Renderable` button element styled for the specified provider.
 *
 * @example
 * ```ts
 * SocialLoginButton({
 *   provider: 'google',
 *   name: 'Google',
 *   icon: 'logos:google-icon',
 *   color: 'red',
 *   onClick: async () => { await authClient.signIn.social({ provider: 'google' }) },
 * })
 * ```
 */
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

/**
 * Minimal provider configuration passed to social login components.
 *
 * Contains the provider name and optional OAuth flow type.
 */
export type AuthProviderInfo = {
  /** The social provider identifier. */
  provider: AuthProviderName
  /** The OAuth flow type. @default 'redirect' */
  flow?: 'redirect' | 'popup'
}

/**
 * Renders a vertical stack of social login buttons for multiple providers.
 *
 * Iterates over the provided list of providers and renders a {@link SocialLoginButton}
 * for each, using the provider metadata from {@link socialProviderInfo}.
 *
 * @param options - Configuration for the button group.
 * @param options.providers - Reactive array of provider configurations.
 * @param options.onProviderClick - Callback invoked when any provider button is clicked.
 * @param options.size - The size of all buttons. @default 'md'
 * @param options.className - Additional CSS class names for the container.
 * @returns A `Renderable` stack of social login buttons.
 *
 * @example
 * ```ts
 * SocialLoginButtons({
 *   providers: [{ provider: 'google' }, { provider: 'github' }],
 *   onProviderClick: async (provider) => { await handleSocialLogin(provider) },
 * })
 * ```
 */
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

/**
 * Mapping of all supported social provider names to their display metadata.
 *
 * Contains the human-readable name, Iconify icon identifier, and BeatUI theme
 * color name for each provider. Used internally by social login button components.
 */
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
    icon: 'simple-icons:snapchat',
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
    icon: 'simple-icons:epicgames',
    color: 'neutral',
  },
  playstation: {
    name: 'PlayStation',
    icon: 'simple-icons:playstation',
    color: 'violet',
  },
  xbox: {
    name: 'Xbox',
    icon: 'simple-icons:xbox',
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
    icon: 'simple-icons:wechat',
    color: 'lime',
  },

  // Other Identity
  amazon: {
    name: 'Amazon',
    icon: 'simple-icons:amazon',
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

/**
 * Options type for specialized social login button variants.
 *
 * Same as {@link SocialLoginButtonOptions} but with `provider`, `name`, `icon`, and `color`
 * pre-configured for the specific provider.
 */
export type SpecialSocialLoginButtonOptions = Omit<
  SocialLoginButtonOptions,
  'provider' | 'name' | 'icon' | 'color'
>

/**
 * Pre-configured Google social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Google-branded login button.
 */
export const GoogleLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['google'],
    provider: 'google',
  })

/**
 * Pre-configured GitHub social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` GitHub-branded login button.
 */
export const GitHubLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['github'],
    provider: 'github',
  })

/**
 * Pre-configured Apple social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Apple-branded login button.
 */
export const AppleLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['apple'],
    provider: 'apple',
  })

/**
 * Pre-configured Facebook social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Facebook-branded login button.
 */
export const FacebookLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['facebook'],
    provider: 'facebook',
  })

/**
 * Pre-configured X (formerly Twitter) social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` X-branded login button.
 */
export const XLoginButtin = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['x'],
    provider: 'x',
  })

/**
 * Pre-configured Twitter social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Twitter-branded login button.
 */
export const TwitterLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['twitter'],
    provider: 'twitter',
  })

/**
 * Pre-configured Microsoft social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Microsoft-branded login button.
 */
export const MicrosoftLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['microsoft'],
    provider: 'microsoft',
  })

/**
 * Pre-configured Discord social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Discord-branded login button.
 */
export const DiscordLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['discord'],
    provider: 'discord',
  })

/**
 * Pre-configured LinkedIn social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` LinkedIn-branded login button.
 */
export const LinkedInLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['linkedin'],
    provider: 'linkedin',
  })

/**
 * Pre-configured Instagram social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Instagram-branded login button.
 */
export const InstagramLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['instagram'],
    provider: 'instagram',
  })

/**
 * Pre-configured TikTok social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` TikTok-branded login button.
 */
export const TiktokLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['tiktok'],
    provider: 'tiktok',
  })

/**
 * Pre-configured Snapchat social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Snapchat-branded login button.
 */
export const SnapchatLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['snapchat'],
    provider: 'snapchat',
  })

/**
 * Pre-configured Reddit social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Reddit-branded login button.
 */
export const RedditLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['reddit'],
    provider: 'reddit',
  })

/**
 * Pre-configured Pinterest social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Pinterest-branded login button.
 */
export const PinterestLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['pinterest'],
    provider: 'pinterest',
  })

/**
 * Pre-configured Twitch social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Twitch-branded login button.
 */
export const TwitchLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['twitch'],
    provider: 'twitch',
  })

/**
 * Pre-configured Steam social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Steam-branded login button.
 */
export const SteamLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['steam'],
    provider: 'steam',
  })

/**
 * Pre-configured Epic Games social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Epic Games-branded login button.
 */
export const EpicLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['epic'],
    provider: 'epic',
  })

/**
 * Pre-configured PlayStation social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` PlayStation-branded login button.
 */
export const PlayStationLoginButton = (
  options: SpecialSocialLoginButtonOptions
) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['playstation'],
    provider: 'playstation',
  })

/**
 * Pre-configured Xbox social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Xbox-branded login button.
 */
export const XboxLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['xbox'],
    provider: 'xbox',
  })

/**
 * Pre-configured WhatsApp social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` WhatsApp-branded login button.
 */
export const WhatsAppLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['whatsapp'],
    provider: 'whatsapp',
  })

/**
 * Pre-configured WeChat social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` WeChat-branded login button.
 */
export const WeChatLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['wechat'],
    provider: 'wechat',
  })

/**
 * Pre-configured Amazon social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Amazon-branded login button.
 */
export const AmazonLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['amazon'],
    provider: 'amazon',
  })

/**
 * Pre-configured Yahoo social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` Yahoo-branded login button.
 */
export const YahooLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['yahoo'],
    provider: 'yahoo',
  })

/**
 * Pre-configured PayPal social login button.
 *
 * @param options - Button options (provider, name, icon, and color are pre-filled).
 * @returns A `Renderable` PayPal-branded login button.
 */
export const PayPalLoginButton = (options: SpecialSocialLoginButtonOptions) =>
  SocialLoginButton({
    ...options,
    ...socialProviderInfo['paypal'],
    provider: 'paypal',
  })
