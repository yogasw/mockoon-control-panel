<script lang="ts">
	import RoutesTab from './tabs/RoutesTab.svelte';
	import LogsTab from './tabs/LogsTab.svelte';
	import ConfigurationTab from './tabs/ConfigurationTab.svelte';
	import { downloadConfig } from '$lib/api/mockoonApi';
	import { selectedConfig } from '$lib/stores/selectedConfig';
	import { activeTab } from '$lib/stores/activeTab';
	import type { MockoonRoute } from '$lib/types/Config';

	export let routes: MockoonRoute[] = [];
	export let activeContentTab = 'Status & Body';

	let loading = false;
	let error = '';

	async function loadConfigData() {
		if (!$selectedConfig) return;

		loading = true;
		try {
			// Download config using the configFile name
			const response = await downloadConfig($selectedConfig.configFile);
			const configData = response.data;

			// Parse routes from config
			routes = configData.routes;
		} catch (err) {
			console.error('Failed to load config data:', err);
			error = 'Failed to load configuration data';
		} finally {
			loading = false;
		}
	}

	// Watch for selectedConfig changes
	$: if ($selectedConfig) {
		loadConfigData();
	}
</script>

<div class="content-area">
	{#if !$selectedConfig}
		<div class="no-config-message">
			<i class="fas fa-info-circle"></i>
			<h2>No Configuration Selected</h2>
			<p>Please select a configuration from the list to view its details.</p>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center h-full min-h-[300px]">
			<div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if error}
		<div class="text-red-500 text-center p-4">{error}</div>
	{:else}
		<div class="tab-content">
			{#if $activeTab === 'routes'}
				<RoutesTab selectedConfig={$selectedConfig} {routes} activeContentTab={activeContentTab} />
			{:else if $activeTab === 'logs'}
				<LogsTab selectedConfig={$selectedConfig} />
			{:else if $activeTab === 'configuration'}
				<ConfigurationTab selectedConfig={$selectedConfig} />
			{/if}
		</div>
	{/if}
</div>

<style>
    .content-area {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 1rem;
    }

    .tab-content {
        flex: 1;
        overflow-y: auto;
    }

    .no-config-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: #64748b;
    }

    .no-config-message i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #3b82f6;
    }

    .no-config-message h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .no-config-message p {
        font-size: 1rem;
    }
</style>
