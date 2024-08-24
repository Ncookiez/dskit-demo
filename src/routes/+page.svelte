<script>
  import PageLink from '$lib/PageLink.svelte'
</script>

<PageLink href="/wallet" icon={{ src: 'walletIcon.svg', alt: 'Wallet Page' }}>Wallet Management</PageLink>
<PageLink href="/blocks" icon={{ src: 'blocksIcon.svg', alt: 'Blocks Page' }}>Block Tools</PageLink>
<PageLink href="/gallery" icon={{ src: 'galleryIcon.svg', alt: 'Gallery Page' }} disabled>NFT Gallery</PageLink>
<PageLink href="/events" icon={{ src: 'eventsIcon.svg', alt: 'Events Page' }} disabled>Event Tools</PageLink>
<PageLink href="/socials" icon={{ src: 'socialIcon.svg', alt: 'Socials Page' }} disabled>Socials</PageLink>
<PageLink href="/info" icon={{ src: 'infoIcon.svg', alt: 'Info Page' }}>Info</PageLink>
