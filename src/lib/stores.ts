import { erc20Abi, type Address, type WalletClient } from 'viem'
import { tokens, vaults, viemClients } from './config'
import { dolphinAddress, isDolphinAddress } from 'dskit-eth'
import { writable } from 'svelte/store'
import { base } from 'viem/chains'

export const walletClient = writable<WalletClient | undefined>(undefined)
export const userAddress = writable<Address | undefined>(undefined)

walletClient.subscribe(async (client) => {
  if (!!client) {
    const address = (await client.getAddresses())[0]
    userAddress.set(address)
  } else {
    userAddress.set(undefined)
  }
})

export const userBalances = writable<{ [tokenAddress: Lowercase<Address>]: bigint }>({})

userAddress.subscribe(async (address) => {
  const newUserBalances: { [tokenAddress: Lowercase<Address>]: bigint } = {}

  if (!!address) {
    const tokenAddresses = ([...Object.keys(tokens), ...Object.keys(vaults)] as Lowercase<Address>[]).filter(
      (tokenAddress) => !isDolphinAddress(tokenAddress)
    )

    const multicallResults = await viemClients[base.id].multicall({
      contracts: tokenAddresses.map((tokenAddress) => ({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address]
      }))
    })

    tokenAddresses.forEach((tokenAddress, i) => {
      const multicallResult = multicallResults[i]

      if (multicallResult.status === 'success' && typeof multicallResult.result === 'bigint') {
        newUserBalances[tokenAddress] = multicallResult.result
      }
    })

    newUserBalances[dolphinAddress] = await viemClients[base.id].getBalance({ address })
  }

  userBalances.set(newUserBalances)
})

export const tokenPrices = writable<{ [tokenAddress: Lowercase<Address>]: number }>({})
