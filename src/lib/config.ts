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

export interface Token {
  symbol: string
  decimals: number
  iconSrc: string
}

export const tokens: { [tokenAddress: Lowercase<Address>]: Token } = {
  [dolphinAddress]: { symbol: 'ETH', decimals: 18, iconSrc: '/tokens/eth.webp' },
  [weth[base.id].address]: { symbol: 'WETH', decimals: 18, iconSrc: '/tokens/weth.webp' },
  [usdc[base.id].address]: { symbol: 'USDC', decimals: 6, iconSrc: '/tokens/usdc.webp' },
  ['0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42']: {
    symbol: 'EURC',
    decimals: 6,
    iconSrc: '/tokens/eurc.webp'
  },
  ['0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452']: {
    symbol: 'wstETH',
    decimals: 18,
    iconSrc: '/tokens/wstETH.webp'
  }
}

export const vaults: { [vaultAddress: Lowercase<Address>]: Token & { underlyingTokenAddress: Lowercase<Address> } } = {
  '0x4e42f783db2d0c5bdff40fdc66fcae8b1cda4a43': {
    symbol: 'przWETH',
    decimals: 18,
    iconSrc: '/tokens/przWETH.svg',
    underlyingTokenAddress: weth[base.id].address
  },
  '0x7f5c2b379b88499ac2b997db583f8079503f25b9': {
    symbol: 'przUSDC',
    decimals: 6,
    iconSrc: '/tokens/przUSDC.svg',
    underlyingTokenAddress: usdc[base.id].address
  }
}

export const vaultABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_assets', type: 'uint256' },
      { internalType: 'address', name: '_receiver', type: 'address' }
    ],
    name: 'deposit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_shares', type: 'uint256' },
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'address', name: '_owner', type: 'address' }
    ],
    name: 'redeem',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const
