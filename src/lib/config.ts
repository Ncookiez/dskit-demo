import { PUBLIC_ETHEREUM_RPC_URL, PUBLIC_BASE_RPC_URL } from '$env/static/public'
import { createConfig, getPublicClient, http } from '@wagmi/core'
import { mainnet, base } from '@wagmi/core/chains'
import type { PublicClient } from 'viem'

export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(PUBLIC_ETHEREUM_RPC_URL),
    [base.id]: http(PUBLIC_BASE_RPC_URL)
  }
})

export const viemClients: { [chainId: number]: PublicClient } = {
  [mainnet.id]: getPublicClient(wagmiConfig, { chainId: mainnet.id }) as PublicClient,
  [base.id]: getPublicClient(wagmiConfig, { chainId: base.id }) as PublicClient
}
