<script lang="ts">
  import ConnectButton from '$lib/ConnectButton.svelte'
  import { dskit, tokens } from '$lib/config'
  import { tokenPrices } from '$lib/stores'
  import { base } from 'viem/chains'
  import { onMount } from 'svelte'
  import { usdc } from 'dskit-eth'
  import type { Address } from 'viem'
  import '../app.css'

  onMount(() => {
    Object.entries(tokens).forEach(([tokenAddress, token]) => {
      dskit.price
        .ofToken({ token: { address: tokenAddress as Lowercase<Address>, ...token }, tokenDenominator: usdc[base.id] })
        .then((price) => tokenPrices.update((prices) => ({ ...prices, [tokenAddress]: price })))
    })
  })
</script>

<nav>
  <span>LOGO</span>
  <ConnectButton />
</nav>

<main><slot /></main>

<style>
  nav {
    display: flex;
    justify-content: space-between;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 2rem 1rem;
  }
</style>
