<script>
  import ConnectButton from '$lib/ConnectButton.svelte'
  import '../app.css'
</script>

<header>
  <img id="logo" src="/brand/logo.svg" alt="" />
  <ConnectButton />
</header>

<main><slot /></main>

<style>
  header {
    display: flex;
    justify-content: space-between;
    min-height: 10vh;
    align-items: center;
    padding: 1rem 1rem 1rem 0;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 2rem 1rem;
  }

  main,
  header {
    max-width: 720px;
    margin: 0 auto;
  }

  img#logo {
    height: 54px;
  }
</style>
