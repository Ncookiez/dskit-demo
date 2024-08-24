<script>
  import ConnectButton from '$lib/ConnectButton.svelte'
  import '../app.css'
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
