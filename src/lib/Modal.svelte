<script lang="ts">
  import { onMount } from 'svelte'

  export let title: string

  let dialog: HTMLDialogElement

  const onClickDialog = (e: MouseEvent) => {
    const dialogDimensions = dialog.getBoundingClientRect()
    const isOutside =
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom

    if (isOutside) {
      dialog.close()
    }
  }

  onMount(() => {
    dialog.addEventListener('click', onClickDialog)

    return () => dialog.removeEventListener('click', onClickDialog)
  })
</script>

<button id="toggle" on:click={() => dialog.showModal()}>
  <slot name="button-content" />
</button>

<dialog bind:this={dialog}>
  <div id="content">
    <div id="header">
      <h2>{title}</h2>
      <button id="close" on:click={() => dialog.close()}>X</button>
    </div>
    <slot name="modal-content" />
  </div>
</dialog>

<style>
  dialog[open] {
    animation: fade 0.3s ease-in;
  }

  dialog::backdrop {
    background-color: rgba(1, 1, 7, 0.3);
    backdrop-filter: blur(2px);
  }

  dialog #content {
    min-width: 30rem;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em;
  }

  dialog #header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  dialog #header > h2 {
    margin: 0;
    user-select: none;
  }

  dialog #header > button {
    padding: 0.2rem 0.5rem;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
