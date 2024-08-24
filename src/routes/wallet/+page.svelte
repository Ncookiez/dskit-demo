<script lang="ts">
  import { tokens, vaults, type Token } from '$lib/config'
  import { tokenPrices, userBalances } from '$lib/stores'
  import { formatUnits, type Address } from 'viem'
  import TokenRow from '$lib/TokenRow.svelte'
  import Modal from '$lib/Modal.svelte'

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
    <Modal title="Swap">
      <span slot="button-content" class="modal-button-content">Swap</span>
      <div slot="modal-content" class="modal-content">MODAL CONTENT</div>
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
      <Modal title="Deposit">
        <span slot="button-content" class="modal-button-content">Deposit</span>
        <div slot="modal-content" class="modal-content">MODAL CONTENT</div>
      </Modal>
      <Modal title="Withdraw">
        <span slot="button-content" class="modal-button-content">Withdraw</span>
        <div slot="modal-content" class="modal-content">MODAL CONTENT</div>
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
