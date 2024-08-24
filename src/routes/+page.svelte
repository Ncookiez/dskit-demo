<script>
  import PageLink from '$lib/PageLink.svelte'
</script>

<nav>
  <PageLink href="/wallet" icon={{ src: '/icons/wallet.svg', alt: 'Wallet Page' }}>Wallet Management</PageLink>
  <PageLink href="/blocks" icon={{ src: '/icons/cube.svg', alt: 'Blocks Page' }}>Block Tools</PageLink>
  <PageLink href="/gallery" icon={{ src: '/icons/ui-image.svg', alt: 'Gallery Page' }} disabled>NFT Gallery</PageLink>
  <PageLink href="/events" icon={{ src: '/icons/list.svg', alt: 'Events Page' }} disabled>Event Tools</PageLink>
  <PageLink href="/socials" icon={{ src: '/icons/users-social.svg', alt: 'Socials Page' }} disabled>Socials</PageLink>
  <PageLink href="/info" icon={{ src: '/icons/medical-sign.svg', alt: 'Get Started with DSKit!' }}>Get Started!</PageLink>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    min-width: 90%;
  }
</style>
