<script lang="ts">
	import { activeTab } from '$lib/stores/activeTab';
	import { downloadConfig, syncToGit } from '$lib/api/mockoonApi';
	import { selectedConfig } from '$lib/stores/selectedConfig';
	import { syncStatus } from '$lib/stores/syncStatus';
	import { toast } from '$lib/stores/toast';

	export let handleLogout: () => void;

	function handleTabClick(tab: string) {
		$activeTab = tab;
	}

	function toggleProfileMenu() {
		const menu = document.getElementById('profileMenu');
		menu?.classList.toggle('hidden');
	}

	function openSettingsModal() {
		const modal = document.getElementById('settingsModal');
		modal?.classList.remove('hidden');
	}

	function closeSettingsModal() {
		const modal = document.getElementById('settingsModal');
		modal?.classList.add('hidden');
	}

	async function handleDownload() {
		if (!$selectedConfig) {
			toast.error('Please select a configuration first');
			return;
		}

		try {
			const response = await downloadConfig($selectedConfig.configFile);
			const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = $selectedConfig.configFile;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			toast.error('Failed to download configuration');
		}
	}

	async function handleSync() {
		syncStatus.set({ isLoading: true, isSuccess: false, error: null });
		try {
			await syncToGit().then(() => {
				toast.success('Successfully synced to Git');
			}).catch((err) => {
				let message = err?.response?.data?.message || 'Failed to sync to Git';
				toast.error(message);
			});
			syncStatus.set({ isLoading: false, isSuccess: true, error: null });
		} catch (err) {
			syncStatus.set({ isLoading: false, isSuccess: false, error: 'Failed to sync to Git' });
			toast.error('Failed to sync to Git');
		}
	}
</script>

<div class="flex items-center bg-gray-800 p-4">
	<button
		class="relative group mr-4 flex flex-col items-center"
		on:click={() => handleTabClick('routes')}
	>
		<div
			class="w-12 aspect-square text-white p-3 rounded-full border-2 border-blue-500 flex items-center justify-center"
			class:bg-blue-500={$activeTab === 'routes'}
			class:bg-gray-700={$activeTab !== 'routes'}>
			<i class="fas fa-route"></i>
		</div>
		<span class="text-xs mt-1">Routes</span>
	</button>
	<button
		class="relative group mr-4 flex flex-col items-center"
		on:click={() => handleTabClick('logs')}
	>
		<div
			class="w-12 aspect-square bg-gray-700 text-white p-3 rounded-full border-2 border-yellow-500 flex items-center justify-center"
			class:bg-blue-500={$activeTab === 'logs'}
			class:bg-gray-700={$activeTab !== 'logs'}>
			<i class="fas fa-file-alt"></i>
		</div>
		<span class="text-xs mt-1">Logs</span>
	</button>
	<button
		class="relative group mr-auto flex flex-col items-center"
		on:click={() => handleTabClick('configuration')}
	>
		<div
			class="w-12 aspect-square text-white p-3 rounded-full border-2 border-purple-500 flex items-center justify-center"
			class:bg-blue-500={$activeTab === 'configuration'}
			class:bg-gray-700={$activeTab !== 'configuration'}>
			<i class="fas fa-cogs"></i>
		</div>
		<span class="text-xs mt-1">Configuration</span>
	</button>

	<button class="relative group mr-4 flex flex-col items-center" on:click={handleDownload}>
		<div class="w-12 aspect-square bg-gray-700 text-white p-3 rounded-full border-2 border-blue-500 flex items-center justify-center">
			<i class="fas fa-download"></i>
		</div>
		<span class="text-xs mt-1">Download JSON</span>
	</button>

	<!-- Sync Button -->
	<button
		class="relative group mr-4 flex flex-col items-center"
		class:opacity-50={$syncStatus.isLoading}
		on:click={handleSync}
	>
		<div class="w-12 aspect-square bg-gray-700 text-white p-3 rounded-full border-2 border-green-500 flex items-center justify-center">
			<i class="fas fa-code-branch" class:fa-spin={$syncStatus.isLoading}></i>
		</div>
		<span class="text-xs mt-1">Sync to Git</span>
	</button>

	<!-- Profile Button -->
	<div class="relative group flex flex-col items-center">
		<button
			class="w-12 aspect-square bg-gray-700 text-white p-3 rounded-full border-2 border-gray-500 flex items-center justify-center"
			on:click={()=>{toggleProfileMenu()}}
		>
			<i class="fas fa-user-circle"></i>
		</button>
		<span class="text-xs mt-1">Profile</span>
		<!-- Profile Menu -->
		<div
			id="profileMenu"
			class="absolute top-full right-0 bg-gray-700 text-white rounded shadow-lg mt-2 hidden w-48"
		>
			<button
				class="block w-full text-left px-4 py-2 hover:bg-gray-600"
				on:click={openSettingsModal}
			>
				<i class="fas fa-cog mr-2"></i> Settings
			</button>
			<button
				class="block w-full text-left px-4 py-2 hover:bg-gray-600"
				on:click={handleLogout}
			>
				<i class="fas fa-sign-out-alt mr-2"></i> Logout
			</button>
		</div>
	</div>
</div>

<!-- Settings Modal -->
<div
	id="settingsModal"
	class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center hidden"
>
	<div class="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-96">
		<h2 class="text-xl font-bold mb-4">Settings</h2>
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-bold mb-2">Username</label>
				<input
					type="text"
					class="w-full bg-gray-700 text-white py-2 px-4 rounded"
					placeholder="Enter your username"
				/>
			</div>
			<div>
				<label class="block text-sm font-bold mb-2">Email</label>
				<input
					type="email"
					class="w-full bg-gray-700 text-white py-2 px-4 rounded"
					placeholder="Enter your email"
				/>
			</div>
			<div>
				<label class="block text-sm font-bold mb-2">Password</label>
				<input
					type="password"
					class="w-full bg-gray-700 text-white py-2 px-4 rounded"
					placeholder="Enter your password"
				/>
			</div>
		</div>
		<div class="flex justify-end mt-4 space-x-2">
			<button
				class="bg-gray-600 text-white py-2 px-4 rounded"
				on:click={() =>closeSettingsModal()}
			>
				Cancel
			</button>
			<button class="bg-blue-500 text-white py-2 px-4 rounded">
				Save
			</button>
		</div>
	</div>
</div>

<style>

    .logo i {
        font-size: 1.5rem;
        color: #3b82f6;
    }

    .logo h1 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
    }

    .nav-button i {
        font-size: 1rem;
    }

    .fa-spin {
        animation: fa-spin 1s infinite linear;
    }

    @keyframes fa-spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
