<script lang="ts">
  import { tokens, vaults } from '$lib/config'
  import TokenRow from '$lib/TokenRow.svelte'
</script>

<a href="/">{'<--'} Wallet Management</a>

<h2>Tokens</h2>
{#each Object.values(tokens) as token}
  <TokenRow icon={{ src: token.iconSrc, alt: token.symbol }} symbol={token.symbol} amount={0} price={0}><button>Swap</button></TokenRow>
{/each}

<h2>Savings</h2>
{#each Object.values(vaults) as vault}
  <TokenRow icon={{ src: vault.iconSrc, alt: vault.symbol }} symbol={vault.symbol} amount={0} price={0}>
    <div>
      <button>Deposit</button>
      <button>Withdraw</button>
    </div>
  </TokenRow>
{/each}
