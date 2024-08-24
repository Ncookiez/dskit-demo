<script lang="ts">
  export let icon: { src: string; alt: string }
  export let symbol: string
  export let amount: number | undefined
  export let price: number | undefined

  $: formattedAmount = amount !== undefined ? formatAmount(amount) : undefined
  $: formattedValue = amount !== undefined && price !== undefined ? `$${formatValue(amount * price)}` : undefined

  const formatAmount = (amount: number) => {
    if (amount == 0) return '0'
    if (amount > 10000) return amount.toFixed(0)
    if (amount > 100) return amount.toFixed(2)
    if (amount > 1) return amount.toFixed(4)
    return amount.toFixed(Math.ceil(Math.log(1 / amount) / Math.log(10)) + 2)
  }

  const formatValue = (value: number) => {
    if (value > 10000) return value.toFixed(0)
    if (value > 0) return value.toFixed(2)
    return formatAmount(value)
  }
</script>

<div>
  <span class="token-info">
    <img src={icon.src} height={24} width={24} alt={icon.alt} />
    <span>{symbol}</span>
  </span>
  <span class="values">
    <span class="amount">{formattedAmount ?? '...'}</span>
    <span class="value">{formattedValue ?? '...'}</span>
  </span>
  <span class="actions">
    <slot />
  </span>
</div>

<style>
  div {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  div > .token-info {
    width: 7rem;
  }

  div > .actions {
    flex-grow: 1;
    align-items: center;
    justify-content: flex-end;
  }

  div > .values {
    flex-shrink: 1;
  }

  div > span {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
  }

  .amount {
    width: 4rem;
    flex-shrink: 1;
    flex-grow: 1;
  }

  .value {
    width: 4rem;
    flex-shrink: 1;
    flex-grow: 1;
  }
</style>
