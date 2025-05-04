<script lang="ts">
	interface Route {
		path: string;
		method: string;
		status: 'enabled' | 'disabled';
		responses: {
			statusCode: number;
			body: string;
			headers: { key: string; value: string }[];
		}[];
	}

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

	import StatusBodyTab from './routes/StatusBodyTab.svelte';
	import HeadersTab from './routes/HeadersTab.svelte';
	import RulesTab from './routes/RulesTab.svelte';
	import CallbacksTab from './routes/CallbacksTab.svelte';

	export let selectedConfig: Config;
	export let routes: Route[];
	export let activeContentTab = 'Status & Body';

	let selectedRoute: Route | null = null;
	let responseBody: string = '';
	let filterText: string = ''; // Variable to store filter input

	// Reactive statement to filter routes
	$: filteredRoutes = routes.filter(route => {
		const filterParts = filterText.toLowerCase().split(' '); // Split filterText by spaces
		return filterParts.every(part =>
			route.path.toLowerCase().includes(part) ||
			route.method.toLowerCase().includes(part)
		);
	});

	function selectRoute(route: Route) {
		selectedRoute = route;
		responseBody = route.responses[0]?.body || '';
	}

	function handleRouteStatusChange(route: Route) {
		const index = routes.findIndex(r => r.path === route.path && r.method === route.method);
		if (index !== -1) {
			routes[index] = {
				...route,
				status: route.status === 'enabled' ? 'disabled' : 'enabled'
			};
			routes = routes; // Trigger reactivity
		}
	}
</script>

<div class="flex flex-1 h-screen">
	<!-- Routes Section -->
	<div class="w-1/3 bg-gray-800 p-4 flex flex-col">
		<div class="bg-gray-700 p-4 rounded mb-4 flex items-center">
			<i class="fas fa-info-circle text-blue-500 text-2xl mr-2"></i>
			<span class="text-xl font-bold text-blue-500">
        Editing Configuration: {selectedConfig.name}
      </span>
		</div>
		<div class="flex items-center bg-gray-700 p-2 rounded mb-4">
			<i class="fas fa-search text-white text-lg mr-2"></i>
			<input
				type="text"
				id="route-search"
				placeholder="Search Path or Method"
				class="w-full bg-gray-700 text-white py-1 px-2 rounded text-sm"
				bind:value={filterText}
			/>
		</div>
		<div class="flex-1 overflow-y-auto hide-scrollbar">
			<div class="space-y-4 pr-2 py-2">
				{#each filteredRoutes as route}
					<div
						class="flex items-center justify-between bg-gray-700 p-4 rounded cursor-pointer {selectedRoute === route ? 'border-2 border-blue-500' : ''}"
						on:click={() => selectRoute(route)}
						on:keydown={(e) => e.key === 'Enter' && selectRoute(route)}
						tabindex="0"
						role="button"
					>
          <span class="text-sm font-bold truncate">
            <strong>{route.method}</strong> {route.path.length > 30 ? route.path.slice(0, 30) + '...' : route.path}
          </span>
						<button
							class="text-white py-1 px-2 rounded flex items-center"
							class:bg-green-500={route.status === 'enabled'}
							class:bg-red-500={route.status === 'disabled'}
							on:click|stopPropagation={() => handleRouteStatusChange(route)}
						>
							{#if route.status === 'enabled'}
								<i class="fas fa-toggle-off mr-1"></i> Disable
							{:else}
								<i class="fas fa-toggle-on mr-1"></i> Enable
							{/if}
						</button>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Details Section -->
	<div class="w-2/3 bg-gray-800 p-4 flex flex-col overflow-hidden">
		<div class="mb-4">
			<label class="block text-sm font-bold mb-2">Endpoint</label>
			<div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
				<select class="w-full md:w-1/6 rounded bg-gray-700 px-4 py-2 text-white" value="{selectedRoute?.method}">
					<option value="GET">GET</option>
					<option value="POST">POST</option>
					<option value="PUT">PUT</option>
					<option value="DELETE">DELETE</option>
					<option value="PATCH">PATCH</option>
				</select>
				<span class="text-gray-400 hidden md:block">{selectedConfig.url}/</span>
				<input type="text" class="w-full md:flex-1 rounded bg-gray-700 px-4 py-2 text-white" value="{selectedRoute?.path}">
				<button
					class="text-gray-400 hover:text-blue-500 disabled:text-gray-600"
					disabled={!selectedRoute || selectedRoute?.method !== 'GET'}
					on:click={() =>{
						let url = `${selectedConfig.url}/${selectedRoute?.path ? selectedRoute.path : ''}`;
						// Open the URL in a new tab
						window.open(url, '_blank');
					}}>
					<i class="fas fa-external-link-alt"></i>
				</button>
			</div>
			<span class="text-gray-400 block md:hidden mt-2"></span>
		</div>
		<div class="mb-4">
			<label class="block text-sm font-bold mb-2">Documentation / Short Information</label>
			<textarea class="w-full rounded bg-gray-700 px-4 py-2 text-white" rows="3"
								placeholder="Provide a brief description or documentation for this endpoint"></textarea>
		</div>

		<div class="flex space-x-2 mb-4">
			{#each ["Status & Body", "Headers", "Rules", "Callbacks"] as tab}
				<button
					class="text-white py-2 px-4 rounded"
					class:bg-blue-500={tab === activeContentTab}
					class:bg-gray-700={tab !== activeContentTab}
					on:click={() => activeContentTab = tab}
				>
					{tab}
				</button>
			{/each}
		</div>

		<div class="flex-1 overflow-auto h-full">
			<div class="max-w-full overflow-x-auto h-full">
				<div class="min-w-0 h-full">
					<div class="h-full flex flex-col">
						{#if selectedRoute}
							{#if activeContentTab === 'Status & Body'}
								<StatusBodyTab
									responseBody={responseBody}
									statusCode={selectedRoute.responses[0]?.statusCode || 200}
									onBodyChange={(val) => responseBody = val}
									onStatusCodeChange={(val) => selectedRoute.responses[0].statusCode = val}
								/>
							{:else if activeContentTab === 'Headers'}
								<HeadersTab headers={selectedRoute.responses[0]?.headers} />
							{:else if activeContentTab === 'Rules'}
								<RulesTab rules={[]} />
							{:else if activeContentTab === 'Callbacks'}
								<CallbacksTab callbacks={[]} />
							{/if}
						{:else}
							<div class="text-gray-400">Select a route to view details.</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
