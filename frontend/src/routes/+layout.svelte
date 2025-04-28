<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ConfigurationList from '$lib/components/ConfigurationList.svelte';
	import Header from '$lib/components/Header.svelte';
	import { getLocalStorage, removeLocalStorage } from '$lib/utils/localStorage';
	import { browser } from '$app/environment';
	import { getConfigs, getMockStatus } from '$lib/api/mockoonApi';
	import { onMount } from 'svelte';
	import { configurations } from '$lib/stores/configurations';
	import Toast from '$lib/components/Toast.svelte';

	interface Config {
		uuid: string;
		name: string;
		configFile: string;
		port: number;
		url: string;
		size: string;
		modified: string;
		inUse: boolean;
	}

	let searchTerm = '';
	let selectedConfig: Config | null = null;
	let activeTab = 'routes';

	// Check authentication from localStorage
	$: isAuthenticated = getLocalStorage('isAuthenticated') === 'true';
	$: isLoginPage = $page.url.pathname === '/login';

	// Redirect to login if not authenticated and not on login page
	$: if (!isAuthenticated && !isLoginPage) {
		if (browser) {
			goto('/login');
		}
	}

	// Redirect to home if authenticated and on login page
	$: if (isAuthenticated && isLoginPage) {
		if (browser) {
			goto('/');
		}
	}

	async function fetchConfigs() {
		try {
			configurations.set(await getConfigs());
		} catch (err) {
			console.error('Failed to fetch configs:', err);
		}
	}

	async function fetchStatus() {
		try {
			const status = await getMockStatus();
			// Update configurations with latest status
			configurations.update(configs => configs.map(config => {
				let inUse = false;
				if (status.length > 0) {
					status.forEach(d => {
						if (d.uuid === config.uuid) {
							inUse = true;
						}
					});
				}
				return {
					...config,
					inUse: inUse
				};
			}));
		} catch (err) {
			console.error('Failed to fetch status:', err);
		}
	}

	onMount(async () => {
		await fetchConfigs();
		await fetchStatus();

		// Set up interval to refresh status every 5 seconds
		const interval = setInterval(fetchStatus, 5000);

		return () => clearInterval(interval);
	});

	function handleConfigSelect(event: CustomEvent<Config>) {
		console.log('5. Layout - Received event with config:', event.detail);
		console.log('6. Layout - Current selectedConfig:', selectedConfig);
		selectedConfig = { ...event.detail };
		console.log('7. Layout - After update selectedConfig:', selectedConfig);
	}

	function handleConfigStart(event: CustomEvent<Config>) {
		const config = event.detail;
		configurations.update(configs => configs.map(c =>
			c.name === config.name ? { ...c, inUse: true } : c
		));
	}

	function handleConfigStop(event: CustomEvent<Config>) {
		const config = event.detail;
		configurations.update(configs => configs.map(c =>
			c.name === config.name ? { ...c, inUse: false } : c
		));
	}

	function handleTabChange(event: CustomEvent<string>) {
		activeTab = event.detail;
		if (activeTab === 'routes') {
			goto('/home');
		} else if (activeTab === 'settings') {
			goto('/settings');
		}
	}

	function handleLogout() {
		removeLocalStorage('isAuthenticated');
		removeLocalStorage('username');
		removeLocalStorage('password');
		window.location.href = '/login';
	}
</script>

{#if isLoginPage}
	<slot />
{:else}
	<div class="flex h-screen bg-gray-900 text-white font-sans">
		<ConfigurationList
			configurations={$configurations}
			{searchTerm}
			on:selectConfiguration={handleConfigSelect}
			on:startConfiguration={handleConfigStart}
			on:stopConfiguration={handleConfigStop}
		/>

		<div class="flex-1 flex flex-col">
			<Header {activeTab} on:tabChange={handleTabChange} handleLogout={handleLogout} />
			<slot activeTab={activeTab} />
		</div>
	</div>
{/if}

<Toast />

<style global>

</style>
