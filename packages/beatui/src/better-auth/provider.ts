import { Provider, makeProviderMark } from '@tempots/dom'
import { createBetterAuthBridge } from './bridge'
import {
  BetterAuthBridge,
  BetterAuthBridgeOptions,
  BetterAuthClient,
} from './types'

export interface BetterAuthProviderOptions extends BetterAuthBridgeOptions {
  client: BetterAuthClient
}

export const BetterAuth: Provider<
  BetterAuthBridge,
  BetterAuthProviderOptions
> = {
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
