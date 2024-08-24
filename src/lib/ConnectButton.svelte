<script lang="ts">
  import { connect, disconnect, getWalletClient, injected } from '@wagmi/core'
  import { userAddress, walletClient } from './stores'
  import { base } from '@wagmi/core/chains'
  import { wagmiConfig } from './config'

  const connectWallet = async () => {
    await connect(wagmiConfig, { chainId: base.id, connector: injected() })
    walletClient.set(await getWalletClient(wagmiConfig))
  }

  const disconnectWallet = () => {
    disconnect(wagmiConfig)
    walletClient.set(undefined)
  }
</script>

<button id="connect" on:click={$walletClient ? disconnectWallet : connectWallet}>
  {#if $walletClient}
    <div class="address">
      {#if !!$userAddress}
        <span>{$userAddress.slice(0, 6)}...{$userAddress.slice($userAddress.length - 4)}</span>
      {/if}
    </div>
    <img src="icons/exit.svg" alt="" />
  {:else}
    <img src="icons/wallet.svg" alt="" />
    Connect Wallet
  {/if}
</button>

<style>
  button#connect {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    background-color: var(--bg-1);
    border: none;
  }

  button#connect > img {
    width: 1.25rem;
  }
</style>
