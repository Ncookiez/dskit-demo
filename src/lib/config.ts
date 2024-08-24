import { PUBLIC_ETHEREUM_RPC_URL, PUBLIC_BASE_RPC_URL } from '$env/static/public'
import { createConfig, getPublicClient, http } from '@wagmi/core'
import { dolphinAddress, weth, usdc, DSKit } from 'dskit-eth'
import { mainnet, base } from 'viem/chains'
import type { Address, PublicClient } from 'viem'

export const dskit = new DSKit({ rpcUrl: PUBLIC_BASE_RPC_URL })

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

interface Token {
  symbol: string
  decimals: number
  iconSrc: string
}

export const tokens: { [tokenAddress: Lowercase<Address>]: Token } = {
  [dolphinAddress]: { symbol: 'ETH', decimals: 18, iconSrc: '/icons/tokens/eth.png' },
  [weth[base.id].address]: { symbol: 'WETH', decimals: 18, iconSrc: '/icons/tokens/weth.png' },
  [usdc[base.id].address]: { symbol: 'USDC', decimals: 6, iconSrc: '/icons/tokens/usdc.png' }
}

export const vaults: { [vaultAddress: Lowercase<Address>]: Token & { underlyingToken: Token } } = {
  '0x4e42f783db2d0c5bdff40fdc66fcae8b1cda4a43': {
    symbol: 'przWETH',
    decimals: 18,
    iconSrc: '/icons/tokens/weth.png',
    underlyingToken: tokens[weth[base.id].address]
  },
  '0x7f5c2b379b88499ac2b997db583f8079503f25b9': {
    symbol: 'przUSDC',
    decimals: 6,
    iconSrc: '/icons/tokens/usdc.png',
    underlyingToken: tokens[usdc[base.id].address]
  }
}
