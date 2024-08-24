<script lang="ts">
  import { onMount } from 'svelte'

  export let title: string
  export let onClose: (() => void) | undefined = undefined

  let dialog: HTMLDialogElement

  const onClickDialog = (e: MouseEvent) => {
    const dialogDimensions = dialog.getBoundingClientRect()
    const isOutside =
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom

    if (isOutside) {
      close()
    }
  }

  const close = () => {
    onClose?.()
    dialog.close()
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
      <button id="close" on:click={() => close()}>X</button>
    </div>
    <slot name="modal-content" />
  </div>
</dialog>

<style>
  dialog[open] {
    animation: fade 0.3s ease-in;
  }

  dialog {
    border-radius: 1rem;
    border: none;
  }

  dialog::backdrop {
    background-color: rgba(1, 1, 7, 0.3);
    backdrop-filter: blur(2px);
  }

  dialog #content {
    width: 24rem;
    min-width: 18rem;
    max-width: 80vw;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0.5em;
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

  button {
    padding: 0.5rem 1rem;
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
