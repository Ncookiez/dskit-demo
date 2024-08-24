<script lang="ts">
  export let icon: { src: string; alt: string }
  export let symbol: string
  export let amount: number
  export let price: number

  $: formattedAmount = amount // TODO
  $: formattedValue = `$${amount * price}` // TODO
</script>

<div>
  <img src={icon.src} height={16} width={16} alt={icon.alt} />
  <span>{symbol}</span>
  <span>{formattedAmount}</span>
  <span>{formattedValue}</span>
  <slot />
</div>

<style>
  div {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }
</style>
