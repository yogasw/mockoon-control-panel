<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import { isOwnAuth } from '$lib/utils/localStorage';
	import { getConfigs } from '$lib/api/mockoonApi';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Check if the user is authenticated
		if (isOwnAuth()) {
			getConfigs().then(e => {
				goto('/home');
			});
		}
	});
</script>

<slot />

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }
</style>
