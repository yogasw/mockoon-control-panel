<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { onDestroy } from 'svelte';

	let visible = true;
  let timeoutId: ReturnType<typeof setTimeout>;

  function close() {
    visible = false;
    toast.clear();
  }

  $: if ($toast) {
    visible = true;
    const duration = $toast.duration || 5000; // Default to 5 seconds if not specified
    clearTimeout(timeoutId);
    timeoutId = setTimeout(close, duration);
  }

  onDestroy(() => {
    clearTimeout(timeoutId);
  });
</script>

{#if $toast}
  <div class="toast {$toast.type}" class:visible>
    <span class="icon">
      {#if $toast.type === 'success'}<i class="fas fa-check-circle"></i>{/if}
      {#if $toast.type === 'error'}<i class="fas fa-times-circle"></i>{/if}
      {#if $toast.type === 'warning'}<i class="fas fa-exclamation-triangle"></i>{/if}
      {#if $toast.type === 'info'}<i class="fas fa-info-circle"></i>{/if}
    </span>
    <span class="message">{$toast.message}</span>
    <button class="close-btn" on:click={close} aria-label="Close notification">
      <i class="fas fa-times"></i>
    </button>
  </div>
{/if}

<style>
.toast {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  min-width: 320px;
  max-width: 90vw;
  display: flex;
  align-items: center;
  background: #1e293b;
  color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
  padding: 1rem 1.5rem;
  z-index: 1000;
  font-size: 1.1rem;
  gap: 0.75rem;
  border: 1.5px solid transparent;
  animation: fadeIn 0.2s;
}
.toast.success {
  border-color: #22c55e;
}
.toast.error {
  border-color: #ef4444;
}
.toast.warning {
  border-color: #f59e42;
}
.toast.info {
  border-color: #3b82f6;
}
.toast .icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}
.toast .message {
  flex: 1;
}
.toast .close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.toast .close-btn:hover {
  opacity: 1;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
