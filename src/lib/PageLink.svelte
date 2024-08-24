<script lang="ts">
  export let href: string
  export let icon: { src: string; alt: string }
  export let disabled: boolean = false
</script>

<a href={!disabled ? href : undefined} class:disabled>
  <img src={icon.src} height={32} width={32} alt={icon.alt} />
  <slot />
</a>

<style>
  a {
    display: flex;
    gap: 1rem;
  }

  a.disabled {
    backdrop-filter: brightness(0.5);
  }
</style>
