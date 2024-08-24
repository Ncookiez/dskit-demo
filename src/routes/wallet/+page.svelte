<script lang="ts">
  import { encodeFunctionData, erc20Abi, formatUnits, parseUnits, type Address } from 'viem'
  import { tokenPrices, userAddress, userBalances, walletClient } from '$lib/stores'
  import { dskit, tokens, vaults, viemClients, type Token } from '$lib/config'
  import { isDolphinAddress } from 'dskit-eth'
  import { base } from 'viem/chains'
  import TokenRow from '$lib/TokenRow.svelte'
  import Modal from '$lib/Modal.svelte'

  let formAmountInput: string = ''
  let swapTo: (Token & { address: Lowercase<Address> }) | undefined = undefined
  let allowance: bigint | undefined = undefined

  const onCloseModal = () => {
    formAmountInput = ''
    swapTo = undefined
    allowance = undefined
  }

  $: tokenEntries = Object.entries(tokens) as [Lowercase<Address>, Token][]
  $: vaultEntries = Object.entries(vaults) as [Lowercase<Address>, Token & { underlyingTokenAddress: Lowercase<Address> }][]

  const fetchAllowance = async (tokenAddress: Address, owner: Address, spender: Address) => {
    return await viemClients[base.id].readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, spender]
    })
  }

  const fetchBalance = async (tokenAddress: Address, owner: Address) => {
    return await viemClients[base.id].readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [owner]
    })
  }
</script>

<a href="/">{'<--'} Wallet Management</a>

<h2>Tokens</h2>
{#each tokenEntries as tokenEntry}
  {@const [tokenAddress, token] = tokenEntry}

  {@const icon = { src: token.iconSrc, alt: token.symbol }}
  {@const amount =
    $userBalances[tokenAddress] !== undefined ? parseFloat(formatUnits($userBalances[tokenAddress], token.decimals)) : undefined}
  {@const price = $tokenPrices[tokenAddress]}

  <TokenRow {icon} symbol={token.symbol} {amount} {price}>
    {@const tokenInAmount = !!formAmountInput ? parseUnits(formAmountInput, token.decimals) : undefined}
    {@const swapOptions = tokenEntries
      .filter((entry) => entry[0] !== tokenAddress && !isDolphinAddress(entry[0]))
      .map((entry) => ({ address: entry[0], ...entry[1] }))}

    <Modal title="Swap" onClose={onCloseModal}>
      <span slot="button-content" class="modal-button-content">Swap</span>
      <div slot="modal-content" class="modal-content">
        <input bind:value={formAmountInput} placeholder={`Enter an amount of ${token.symbol}...`} />

        <div>
          <label for="swap-options">Swap for:</label>
          <select name="swap-options" id="swap-options" bind:value={swapTo}>
            {#each swapOptions as swapOption}
              <option value={swapOption}>{swapOption.symbol}</option>
            {/each}
          </select>
        </div>

        {#if !!swapTo && !!tokenInAmount && !!$walletClient && !!$userAddress}
          {@const tokenIn = { address: tokenAddress, decimals: token.decimals, amount: tokenInAmount }}
          {@const tokenOut = { address: swapTo.address, decimals: swapTo.decimals }}
          {@const executionOptions = { recipient: $userAddress }}

          {@const swapRoutePromise = dskit.swap.route({ tokenIn, tokenOut, executionOptions })}

          {#await swapRoutePromise}
            <span>Fetching swap route...</span>
          {:then swapRoute}
            {#if !!swapRoute.request}
              {@const formattedTokenOutAmount = formatUnits(swapRoute.quote, tokenOut.decimals)}

              <span>Output: {formattedTokenOutAmount} {swapTo.symbol}</span>

              {#if isDolphinAddress(tokenIn.address)}
                {@const swap = async () => {
                  if (!!swapRoute.request) {
                    const hash = await $walletClient.sendTransaction({
                      chain: base,
                      account: $userAddress,
                      to: swapRoute.request.address,
                      data: encodeFunctionData({
                        abi: swapRoute.request.abi,
                        functionName: swapRoute.request.functionName,
                        args: swapRoute.request.args
                      })
                    })

                    await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                      const newBalance = await fetchBalance(tokenIn.address, $userAddress)
                      userBalances.update((oldBalances) => ({ ...oldBalances, [tokenIn.address]: newBalance }))
                    })
                  }
                }}

                <button on:click={swap}>Swap</button>
              {:else}
                {@const isApproved = allowance !== undefined && allowance >= tokenIn.amount}

                {@const approve = async () => {
                  if (!!swapRoute.request) {
                    allowance = await fetchAllowance(tokenIn.address, $userAddress, swapRoute.request.address)

                    if (allowance < tokenIn.amount) {
                      const hash = await $walletClient.sendTransaction({
                        chain: base,
                        account: $userAddress,
                        to: tokenIn.address,
                        data: encodeFunctionData({
                          abi: erc20Abi,
                          functionName: 'approve',
                          args: [swapRoute.request.address, tokenIn.amount]
                        })
                      })

                      await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                        if (!!swapRoute.request) {
                          allowance = await fetchAllowance(tokenIn.address, $userAddress, swapRoute.request.address)
                        }
                      })
                    }
                  }
                }}

                {@const swap = async () => {
                  if (!!swapRoute.request) {
                    const hash = await $walletClient.sendTransaction({
                      chain: base,
                      account: $userAddress,
                      to: swapRoute.request.address,
                      data: encodeFunctionData({
                        abi: swapRoute.request.abi,
                        functionName: swapRoute.request.functionName,
                        args: swapRoute.request.args
                      })
                    })

                    await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                      const newBalance = await fetchBalance(tokenIn.address, $userAddress)
                      userBalances.update((oldBalances) => ({ ...oldBalances, [tokenIn.address]: newBalance }))

                      if (!!swapRoute.request) {
                        allowance = await fetchAllowance(tokenIn.address, $userAddress, swapRoute.request.address)
                      }
                    })
                  }
                }}

                <div>
                  <button on:click={approve} disabled={isApproved}>Approve</button>
                  <button on:click={swap} disabled={!isApproved}>Swap</button>
                </div>
              {/if}
            {:else}
              <span>Something went wrong :(</span>
            {/if}
          {:catch}
            <span>No swap route found :(</span>
          {/await}
        {/if}
      </div>
    </Modal>
  </TokenRow>
{/each}

<h2>Savings</h2>
{#each vaultEntries as vaultEntry}
  {@const [vaultAddress, vault] = vaultEntry}
  {@const icon = { src: vault.iconSrc, alt: vault.symbol }}
  {@const amount =
    $userBalances[vaultAddress] !== undefined ? parseFloat(formatUnits($userBalances[vaultAddress], vault.decimals)) : undefined}
  {@const price = $tokenPrices[vault.underlyingTokenAddress]}

  <TokenRow {icon} symbol={vault.symbol} {amount} {price}>
    <div class="vault-actions">
      <Modal title="Deposit" onClose={onCloseModal}>
        <span slot="button-content" class="modal-button-content">Deposit</span>
        <div slot="modal-content" class="modal-content">
          <!-- TODO: deposit modal content -->
        </div>
      </Modal>
      <Modal title="Withdraw" onClose={onCloseModal}>
        <span slot="button-content" class="modal-button-content">Withdraw</span>
        <div slot="modal-content" class="modal-content">
          <!-- TODO: withdraw modal content -->
        </div>
      </Modal>
    </div>
  </TokenRow>
{/each}

<br />
<p><i>(Prize savings vaults provided by <a href="https://pooltogether.com/" target="_blank">PoolTogether</a>)</i></p>

<style>
  .modal-button-content {
    padding: 0 0.5rem;
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .vault-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    opacity: 0.6;
  }
</style>
