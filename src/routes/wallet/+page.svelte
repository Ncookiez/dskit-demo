<script lang="ts">
  import { dskit, tokens, vaultABI, vaults, viemClients, type Token } from '$lib/config'
  import { tokenPrices, userAddress, userBalances, walletClient } from '$lib/stores'
  import { erc20Abi, formatUnits, parseUnits, type Address } from 'viem'
  import { isDolphinAddress, weth } from 'dskit-eth'
  import { base } from 'viem/chains'
  import TokenRow from '$lib/TokenRow.svelte'
  import Modal from '$lib/Modal.svelte'

  let formAmountInput: string = ''
  let swapToAddress: Lowercase<Address> | undefined = undefined
  let zapFromAddress: Lowercase<Address> | undefined = undefined
  let allowance: bigint | undefined = undefined

  const onCloseModal = () => {
    formAmountInput = ''
    swapToAddress = undefined
    zapFromAddress = undefined
    allowance = undefined
  }

  $: tokenEntries = Object.entries(tokens) as [Lowercase<Address>, Token][]
  $: vaultEntries = Object.entries(vaults) as [Lowercase<Address>, Token & { underlyingTokenAddress: Lowercase<Address> }][]

  $: swapTo = !!swapToAddress ? tokenEntries.find((entry) => entry[0] === swapToAddress) : undefined
  $: zapFrom = !!zapFromAddress ? tokenEntries.find((entry) => entry[0] === zapFromAddress) : undefined

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

    <Modal title={`Swap ${token.symbol}`} onClose={onCloseModal}>
      <span slot="button-content" class="modal-button-content">Swap</span>
      <div slot="modal-content" class="modal-content">
        <input bind:value={formAmountInput} placeholder={`Enter an amount of ${token.symbol}...`} />

        <div>
          <label for="swap-options">Swap for:</label>
          <select name="swap-options" id="swap-options" bind:value={swapToAddress}>
            {#each swapOptions as swapOption}
              <option value={swapOption.address}>{swapOption.symbol}</option>
            {/each}
          </select>
        </div>

        {#if !!swapTo && !!tokenInAmount && !!$walletClient && !!$userAddress}
          {@const tokenIn = { address: tokenAddress, decimals: token.decimals, amount: tokenInAmount }}
          {@const tokenOut = { address: swapTo[0], decimals: swapTo[1].decimals }}
          {@const executionOptions = { recipient: $userAddress }}

          {@const swapRoutePromise = dskit.swap.route({ tokenIn, tokenOut, executionOptions })}

          {#await swapRoutePromise}
            <span>Fetching swap route...</span>
          {:then swapRoute}
            {#if !!swapRoute.request}
              {@const formattedTokenOutAmount = formatUnits(swapRoute.quote, tokenOut.decimals)}

              <span>Output: {formattedTokenOutAmount} {swapTo[1].symbol}</span>

              {#if isDolphinAddress(tokenIn.address)}
                {@const swap = async () => {
                  if (!!swapRoute.request) {
                    const hash = await $walletClient.writeContract({ chain: base, account: $userAddress, ...swapRoute.request })

                    await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                      const newTokenInBalance = await fetchBalance(tokenIn.address, $userAddress)
                      const newTokenOutBalance = await fetchBalance(tokenOut.address, $userAddress)

                      userBalances.update((oldBalances) => ({
                        ...oldBalances,
                        [tokenIn.address]: newTokenInBalance,
                        [tokenOut.address]: newTokenOutBalance
                      }))
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
                      const hash = await $walletClient.writeContract({
                        chain: base,
                        account: $userAddress,
                        address: tokenIn.address,
                        abi: erc20Abi,
                        functionName: 'approve',
                        args: [swapRoute.request.address, tokenIn.amount]
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
                    const hash = await $walletClient.writeContract({ chain: base, account: $userAddress, ...swapRoute.request })

                    await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                      const newTokenInBalance = await fetchBalance(tokenIn.address, $userAddress)
                      const newTokenOutBalance = await fetchBalance(tokenOut.address, $userAddress)

                      userBalances.update((oldBalances) => ({
                        ...oldBalances,
                        [tokenIn.address]: newTokenInBalance,
                        [tokenOut.address]: newTokenOutBalance
                      }))

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
    {@const zapInOptions = tokenEntries.map((entry) => ({ address: entry[0], ...entry[1] }))}

    <div class="vault-actions">
      <Modal title={`Deposit into ${vault.symbol}`} onClose={onCloseModal}>
        <span slot="button-content" class="modal-button-content">Deposit</span>
        <div slot="modal-content" class="modal-content">
          <div>
            <label for="zap-in-options">Zap from:</label>
            <select name="zap-in-options" id="zap-in-options" bind:value={zapFromAddress}>
              {#each zapInOptions as zapInOption}
                <option value={zapInOption.address}>{zapInOption.symbol}</option>
              {/each}
            </select>
          </div>

          <input bind:value={formAmountInput} placeholder={`Enter an amount of ${zapFrom?.[1].symbol ?? '?'}...`} />

          {#if !!zapFrom && !!formAmountInput && !!$walletClient && !!$userAddress}
            {@const tokenInAmount = parseUnits(formAmountInput, zapFrom[1].decimals)}

            {@const tokenIn = { address: zapFrom[0], decimals: zapFrom[1].decimals, amount: tokenInAmount }}
            {@const swapTo =
              tokenIn.address !== vault.underlyingTokenAddress &&
              (!isDolphinAddress(tokenIn.address) || vault.underlyingTokenAddress !== weth[base.id].address)
                ? { address: vault.underlyingTokenAddress, decimals: tokens[vault.underlyingTokenAddress].decimals }
                : undefined}
            {@const action = {
              address: vaultAddress,
              abi: vaultABI,
              functionName: 'deposit',
              args: [0n, $userAddress],
              injectedAmountIndex: 4
            }}
            {@const tokenOut = { address: vaultAddress, minAmount: 1n }}

            {@const zapPromise = dskit.zap.tx({ tokenIn, swapTo, action, tokenOut, userAddress: $userAddress })}

            {#await zapPromise}
              <span>Fetching zap route...</span>
            {:then zapRoute}
              {#if !!swapTo}
                {@const swapTokenIn = isDolphinAddress(tokenIn.address) ? { ...tokenIn, address: weth[base.id].address } : tokenIn}
                {@const executionOptions = { recipient: $userAddress }}

                {@const swapRoutePromise = dskit.swap.route({ tokenIn: swapTokenIn, tokenOut: swapTo, executionOptions })}

                {#await swapRoutePromise}
                  <span>Output: ... {vault.symbol}</span>
                {:then swapRoute}
                  {@const formattedTokenOutAmount = formatUnits(swapRoute.quote, swapTo.decimals)}

                  <span>Output: {formattedTokenOutAmount} {vault.symbol}</span>
                {:catch}
                  <span>Something went wrong :(</span>
                {/await}
              {:else}
                {@const formattedTokenOutAmount = formatUnits(tokenIn.amount, tokenIn.decimals)}

                <span>Output: {formattedTokenOutAmount} {vault.symbol}</span>
              {/if}

              {#if isDolphinAddress(tokenIn.address)}
                {@const zap = async () => {
                  // @ts-ignore
                  const hash = await $walletClient.writeContract({ chain: base, account: $userAddress, ...zapRoute.request })

                  await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                    const newTokenInBalance = await fetchBalance(tokenIn.address, $userAddress)
                    const newTokenOutBalance = await fetchBalance(tokenOut.address, $userAddress)

                    userBalances.update((oldBalances) => ({
                      ...oldBalances,
                      [tokenIn.address]: newTokenInBalance,
                      [tokenOut.address]: newTokenOutBalance
                    }))
                  })
                }}

                <button on:click={zap}>Zap</button>
              {:else}
                {@const isApproved = allowance !== undefined && allowance >= tokenIn.amount}

                {@const approve = async () => {
                  if (!!zapRoute.approval) {
                    allowance = await fetchAllowance(tokenIn.address, $userAddress, zapRoute.approval.spender)

                    if (allowance < tokenIn.amount) {
                      const hash = await $walletClient.writeContract({
                        chain: base,
                        account: $userAddress,
                        address: tokenIn.address,
                        abi: erc20Abi,
                        functionName: 'approve',
                        args: [zapRoute.approval.spender, tokenIn.amount]
                      })

                      await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                        if (!!zapRoute.approval) {
                          allowance = await fetchAllowance(tokenIn.address, $userAddress, zapRoute.approval.spender)
                        }
                      })
                    }
                  }
                }}

                {@const zap = async () => {
                  // @ts-ignore
                  const hash = await $walletClient.writeContract({ chain: base, account: $userAddress, ...zapRoute.request })

                  await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                    const newTokenInBalance = await fetchBalance(tokenIn.address, $userAddress)
                    const newTokenOutBalance = await fetchBalance(tokenOut.address, $userAddress)

                    userBalances.update((oldBalances) => ({
                      ...oldBalances,
                      [tokenIn.address]: newTokenInBalance,
                      [tokenOut.address]: newTokenOutBalance
                    }))

                    if (!!zapRoute.approval) {
                      allowance = await fetchAllowance(tokenIn.address, $userAddress, zapRoute.approval.spender)
                    }
                  })
                }}

                <div>
                  <button on:click={approve} disabled={isApproved}>Approve</button>
                  <button on:click={zap} disabled={!isApproved}>Zap</button>
                </div>
              {/if}
            {:catch}
              <span>No zap route found :(</span>
            {/await}
          {/if}
        </div>
      </Modal>
      <Modal title={`Withdraw from ${vault.symbol}`} onClose={onCloseModal}>
        <span slot="button-content" class="modal-button-content">Withdraw</span>
        <div slot="modal-content" class="modal-content">
          <input bind:value={formAmountInput} placeholder={`Enter an amount of ${vault.symbol}...`} />

          {#if !!formAmountInput && !!$walletClient && !!$userAddress}
            {@const tokenInAmount = parseUnits(formAmountInput, vault.decimals)}
            {@const tokenOut = tokenEntries.find((entry) => entry[0] === vault.underlyingTokenAddress)}

            {@const formattedTokenOutAmount = formatUnits(tokenInAmount, vault.decimals)}

            <span>Output: {formattedTokenOutAmount} {tokenOut?.[1].symbol ?? '?'}</span>

            {@const redeem = async () => {
              const hash = await $walletClient.writeContract({
                chain: base,
                account: $userAddress,
                address: vaultAddress,
                abi: vaultABI,
                functionName: 'redeem',
                args: [tokenInAmount, $userAddress, $userAddress]
              })

              await viemClients[base.id].waitForTransactionReceipt({ hash }).then(async () => {
                const newTokenInBalance = await fetchBalance(vaultAddress, $userAddress)
                const newTokenOutBalance = await fetchBalance(vault.underlyingTokenAddress, $userAddress)

                userBalances.update((oldBalances) => ({
                  ...oldBalances,
                  [vaultAddress]: newTokenInBalance,
                  [vault.underlyingTokenAddress]: newTokenOutBalance
                }))
              })
            }}

            <button on:click={redeem}>Withdraw</button>
          {/if}
        </div>
      </Modal>
    </div>
  </TokenRow>
{/each}

<br />
<p><i>(Prize saving vaults provided by <a href="https://pooltogether.com/" target="_blank">PoolTogether</a>)</i></p>

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

  button,
  input,
  select {
    padding: 0.5rem 1rem;
  }
</style>
