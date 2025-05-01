<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	// import { getConfigs, downloadConfig } from '$lib/api/mockoonApi';
	import Header from '$lib/components/Header.svelte';
	import ConfigurationList from '$lib/components/ConfigurationList.svelte';
	import ContentArea from '$lib/components/ContentArea.svelte';
	import { page } from '$app/stores';

	export let handleLogout: () => void;

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

	interface Route {
		path: string;
		method: string;
		status: 'enabled' | 'disabled';
	}

	let configurations: Config[] = [
		{
			uuid: "1",
			name: "Configuration 1",
			configFile: "config1.json2",
			port: 123,
			url: "https://localhost:123/",
			size: "1KB",
			modified: new Date().toISOString(),
			inUse: true
		},
		{
			uuid: "2",
			name: "Configuration 2",
			configFile: "config2.json",
			port: 4002,
			url: "https://localhost:4002/",
			size: "1KB",
			modified: new Date().toISOString(),
			inUse: false
		},
		{
			uuid: "3",
			name: "Configuration 3",
			configFile: "config3.json",
			port: 4003,
			url: "https://localhost:4003/",
			size: "1KB",
			modified: new Date().toISOString(),
			inUse: true
		},
		{
			uuid: "4",
			name: "Routes 3",
			configFile: "routes.json",
			port: 4004,
			url: "https://localhost:4004/",
			size: "1KB",
			modified: new Date().toISOString(),
			inUse: false
		},
	];

	let routes: Route[] = [
		{ path: "/api/v1/resource/long/path/example", method: "GET", status: "enabled" },
		{ path: "/api/v1/resource/another/long/path", method: "POST", status: "disabled" },
		{ path: "/api/v1/example/long/path", method: "PUT", status: "enabled" }
	];

	let loading = true;
	let error = '';
	let searchTerm = '';
	let selectedConfig: Config | null = null;
	let activeTab = 'routes';
	let activeContentTab = 'Status & Body';

	onMount(() => {
		goto('/home');
	});

	onMount(async () => {
		try {
			// Uncomment when API is ready
			// configurations = await getConfigs();
		} catch (err) {
			error = 'Failed to load data';
		} finally {
			loading = false;
		}
	});

	async function handleDownload(filename: string) {
		try {
			// // const response = await downloadConfig(filename);
			// const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
			// const url = window.URL.createObjectURL(blob);
			// const a = document.createElement('a');
			// a.href = url;
			// a.download = filename;
			// document.body.appendChild(a);
			// a.click();
			// window.URL.revokeObjectURL(url);
			// document.body.removeChild(a);
		} catch (err) {
			error = 'Failed to download configuration';
		}
	}

	function handleConfigSelect(event: CustomEvent<Config>) {
		selectedConfig = event.detail;
	}

	function handleConfigStart(event: CustomEvent<Config>) {
		const config = event.detail;
		configurations = configurations.map(c =>
			c.name === config.name ? { ...c, inUse: true } : c
		);
	}

	function handleConfigStop(event: CustomEvent<Config>) {
		const config = event.detail;
		configurations = configurations.map(c =>
			c.name === config.name ? { ...c, inUse: false } : c
		);
	}

	function handleTabChange(event: CustomEvent<string>) {
		activeTab = event.detail;
	}
</script>

<div class="flex items-center justify-center h-screen">
	<div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
</div>

<ConfigurationList
	{configurations}
	{searchTerm}
	{selectedConfig}
	on:selectConfiguration={handleConfigSelect}
	on:startConfiguration={handleConfigStart}
	on:stopConfiguration={handleConfigStop}
/>

