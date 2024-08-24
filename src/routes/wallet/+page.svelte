<script lang="ts">
  import { tokens, vaults, type Token } from '$lib/config'
  import { tokenPrices, userBalances } from '$lib/stores'
  import TokenRow from '$lib/TokenRow.svelte'
  import { formatUnits, type Address } from 'viem'

  $: tokenEntries = Object.entries(tokens) as [Lowercase<Address>, Token][]
  $: vaultEntries = Object.entries(vaults) as [Lowercase<Address>, Token & { underlyingTokenAddress: Lowercase<Address> }][]
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
    <button>Swap</button>
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
    <div>
      <button>Deposit</button>
      <button>Withdraw</button>
    </div>
  </TokenRow>
{/each}
