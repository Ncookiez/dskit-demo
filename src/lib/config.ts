import { createConfig, getPublicClient, http } from '@wagmi/core'
import { mainnet, optimism } from '@wagmi/core/chains'
import type { PublicClient } from 'viem'

export const wagmiConfig = createConfig({
  chains: [mainnet, optimism],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http()
  }
})

export const viemClients: { [chainId: number]: PublicClient } = {
  [mainnet.id]: getPublicClient(wagmiConfig, { chainId: mainnet.id }) as PublicClient,
  [optimism.id]: getPublicClient(wagmiConfig, { chainId: optimism.id }) as PublicClient
}
