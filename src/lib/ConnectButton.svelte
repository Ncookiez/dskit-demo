<script lang="ts">
  import { connect, disconnect, getWalletClient, injected } from '@wagmi/core'
  import { wagmiConfig } from './config'
  import { userAddress, walletClient } from './stores'
  import { optimism } from '@wagmi/core/chains'

  const connectWallet = async () => {
    await connect(wagmiConfig, { chainId: optimism.id, connector: injected() })
    walletClient.set(await getWalletClient(wagmiConfig))
  }

  const disconnectWallet = () => {
    disconnect(wagmiConfig)
    walletClient.set(undefined)
  }
</script>

{#if $walletClient}
  <div class="connected">
    {#if !!$userAddress}
      <span>{$userAddress.slice(0, 6)}...{$userAddress.slice($userAddress.length - 4)}</span>
    {:else}
      ...
    {/if}
    <button id="disconnect" on:click={disconnectWallet}>
      <svg height="1.1rem" width="1.1rem" fill="#f5f0ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.143 30.143">
        <path
          d="M20.034,2.357v3.824c3.482,1.798,5.869,5.427,5.869,9.619c0,5.98-4.848,10.83-10.828,10.83
		c-5.982,0-10.832-4.85-10.832-10.83c0-3.844,2.012-7.215,5.029-9.136V2.689C4.245,4.918,0.731,9.945,0.731,15.801
		c0,7.921,6.42,14.342,14.34,14.342c7.924,0,14.342-6.421,14.342-14.342C29.412,9.624,25.501,4.379,20.034,2.357z"
        />
        <path
          d="M14.795,17.652c1.576,0,1.736-0.931,1.736-2.076V2.08c0-1.148-0.16-2.08-1.736-2.08
		c-1.57,0-1.732,0.932-1.732,2.08v13.496C13.062,16.722,13.225,17.652,14.795,17.652z"
        />
      </svg>
    </button>
  </div>
{:else}
  <button id="connect" on:click={connectWallet}>Connect Wallet</button>
{/if}

<style>
  div.connected {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  button#connect {
    padding: 0.6rem 0.75rem;
    border-radius: 0.75rem;
  }

  button#disconnect {
    margin-top: 0.2rem;
  }
</style>
