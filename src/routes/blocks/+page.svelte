<script lang="ts">
  import { dskit } from '$lib/config'
  import { onMount } from 'svelte'
  import type { Block } from 'viem'

  let recentBlock: Block | undefined
  let searchBlock: Block | undefined
  let searching = false
  let blockExplorer: string | undefined
  let blockDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  let blockTime = '12:00'
  $: console.log(blockTime)

  onMount(async () => {
    const client = await dskit.getPublicClient()
    recentBlock = await client.getBlock()
    blockExplorer = client.chain?.blockExplorers?.default?.url
  })

  const search = async () => {
    searching = true
    searchBlock = undefined
    try {
      console.log(blockDate)
      const dateInSec = Math.floor(new Date(`${blockDate}T${blockTime}:00Z`).getTime() / 1000)
      console.log(dateInSec)
      searchBlock = await dskit.block.nearTimestamp({
        targetTimestamp: dateInSec,
        targetRangeSeconds: 60
      })
    } catch (err) {
      console.error(err)
      alert('Oops! something went wrong...')
    } finally {
      searching = false
    }
  }
</script>

<a href="/">{'<--'} Block Tools</a>

<h2>Latest Block</h2>

<a target="_blank" href={blockExplorer && recentBlock ? `${blockExplorer}/block/${recentBlock.number}` : undefined}
  >#{recentBlock?.number ?? ' loading'}</a
>

<br />

<h2>Block Search</h2>

<div id="block-search-inputs">
  <div>
    <input type="date" name="block-date" bind:value={blockDate} />
    <input type="time" name="block-time" bind:value={blockTime} />(UTC)
  </div>
  <button on:click={search} on:keydown={(e) => (e.key === 'enter' ? search() : null)} disabled={searching}>Search</button>
</div>

{#if searchBlock}
  <br />
  Block Found:
  <a target="_blank" href={blockExplorer ? `${blockExplorer}/block/${searchBlock.number}` : undefined}>#{searchBlock.number}</a>
{/if}

<style>
  #block-search-inputs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  #block-search-inputs > div {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  #block-search-inputs > button {
    padding: 0.5rem 1rem;
  }
</style>
