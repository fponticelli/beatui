/**
 * Better Auth Provider
 *
 * Defines the BeatUI context provider for the better-auth bridge. Follows the
 * standard Tempo `Provider<Value>` pattern with `mark` and `create`.
 *
 * @module better-auth/provider
 */

import { Provider, makeProviderMark } from '@tempots/dom'
import { createBetterAuthBridge } from './bridge'
import {
  BetterAuthBridge,
  BetterAuthBridgeOptions,
  BetterAuthClient,
} from './types'

/**
 * Options for the {@link BetterAuth} provider.
 *
 * Extends {@link BetterAuthBridgeOptions} with the required `client` instance.
 */
export interface BetterAuthProviderOptions extends BetterAuthBridgeOptions {
  /** The better-auth client instance to use for authentication operations. */
  client: BetterAuthClient
}

/**
 * Context provider for the better-auth bridge.
 *
 * Creates a {@link BetterAuthBridge} from the provided client and options,
 * making it available to descendant components via the Tempo provider system.
 * Automatically disposes the bridge when the provider is removed from the DOM.
 *
 * @example
 * ```ts
 * import { Provide, Use } from '@tempots/dom'
 * import { BetterAuth } from '@tempots/beatui/auth'
 *
 * Provide(BetterAuth, { client: authClient, socialProviders: ['google'] },
 *   Use(BetterAuth, (bridge) =>
 *     AuthContainer(bridge.containerOptions)
 *   )
 * )
 * ```
 */
export const BetterAuth: Provider<BetterAuthBridge> = {
  mark: makeProviderMark<BetterAuthBridge>('BetterAuth'),
  create: (options: BetterAuthProviderOptions | undefined) => {
    if (!options) {
      throw new Error('BetterAuth provider requires a client option')
    }
    const bridge = createBetterAuthBridge(options.client, options)
    return {
      value: bridge,
      dispose: () => bridge.dispose(),
    }
  },
}
