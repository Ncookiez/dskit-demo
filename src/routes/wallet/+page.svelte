<script>
  import TokenRow from '$lib/TokenRow.svelte'
</script>

<a href="/">{'<--'} Wallet Management</a>

<h2>Tokens</h2>
<TokenRow icon={{ src: 'icons/tokens/eth.png', alt: 'ETH' }} name="ETH" amount={0} price={0}><button>Swap</button></TokenRow>
<TokenRow icon={{ src: 'icons/tokens/weth.png', alt: 'WETH' }} name="WETH" amount={0} price={0}><button>Swap</button></TokenRow>
<TokenRow icon={{ src: 'icons/tokens/usdc.png', alt: 'USDC' }} name="USDC" amount={0} price={0}><button>Swap</button></TokenRow>

<h2>Savings</h2>
<TokenRow icon={{ src: 'icons/tokens/weth.png', alt: 'WETH' }} name="przWETH" amount={0} price={0}>
  <div>
    <button>Deposit</button>
    <button>Withdraw</button>
  </div>
</TokenRow>
<TokenRow icon={{ src: 'icons/tokens/usdc.png', alt: 'USDC' }} name="przUSDC" amount={0} price={0}>
  <div>
    <button>Deposit</button>
    <button>Withdraw</button>
  </div>
</TokenRow>
