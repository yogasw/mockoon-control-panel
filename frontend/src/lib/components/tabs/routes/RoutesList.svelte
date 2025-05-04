<script lang="ts">
	import type { Route } from '$lib/types/route';

	export let selectedRoute: Route | null;
	export let activeConfigName: string;
	export let filterText: string;
	export let filteredRoutes: Route[];
	export let selectRoute: (route: Route) => void;
	export let handleRouteStatusChange: (route: Route) => void;
</script>

<!-- Routes Section -->
<div class="w-1/3 bg-gray-800 p-4 flex flex-col">
	<div class="bg-gray-700 p-4 rounded mb-4">
		<div class="flex items-center">
			<i class="fas fa-info-circle text-blue-500 text-2xl mr-2"></i>
			<span class="text-xl font-bold text-blue-500">Editing Configuration:</span>
		</div>
		<span class="text-xl font-bold text-blue-500">{activeConfigName}</span>
	</div>
	<div class="flex items-center bg-gray-700 p-2 rounded mb-4">
		<i class="fas fa-search text-white text-lg mr-2"></i>
		<input
			type="text"
			id="route-search"
			placeholder="Search Path or Method"
			class="w-full bg-gray-700 text-white py-1 px-2 rounded text-sm focus:outline-none"
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
