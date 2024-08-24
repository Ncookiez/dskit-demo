<script lang="ts">
  export let href: string
  export let target: string | undefined
  export let icon: { src: string; alt: string }
  export let disabled: boolean = false
</script>

<a href={!disabled ? href : undefined} {target} class:disabled>
  <button>
    <img src={icon.src} height={32} width={32} alt={icon.alt} />
    <slot />
  </button>
</a>

<style>
  a {
    text-decoration: none;
    color: var(--text-0);
  }

  a > button {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--bg-1);
    border-radius: 1rem;
    width: 100%;
    align-items: center;
  }

  a:visited {
    color: var(--text-0);
  }

  a.disabled {
    opacity: 0.5;
  }
</style>
