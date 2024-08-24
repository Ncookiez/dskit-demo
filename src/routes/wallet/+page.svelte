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
  {@const amount = parseFloat(formatUnits($userBalances[tokenAddress] ?? 0n, token.decimals))}
  {@const price = $tokenPrices[tokenAddress] ?? 0}

  <TokenRow {icon} symbol={token.symbol} {amount} {price}>
    <button>Swap</button>
  </TokenRow>
{/each}

<h2>Savings</h2>
{#each vaultEntries as vaultEntry}
  {@const [vaultAddress, vault] = vaultEntry}
  {@const icon = { src: vault.iconSrc, alt: vault.symbol }}
  {@const amount = parseFloat(formatUnits($userBalances[vaultAddress] ?? 0n, vault.decimals))}
  {@const price = $tokenPrices[vault.underlyingTokenAddress] ?? 0}

  <TokenRow {icon} symbol={vault.symbol} {amount} {price}>
    <div>
      <button>Deposit</button>
      <button>Withdraw</button>
    </div>
  </TokenRow>
{/each}
