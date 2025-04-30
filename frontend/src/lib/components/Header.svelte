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

  async function handleDownload() {
    if (!$selectedConfig) {
      toast.error('Please select a configuration first')
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
      await syncToGit().then(()=>{
        toast.success('Successfully synced to Git');
      }).catch((err) => {
        let message = err?.response?.data?.message || 'Failed to sync to Git';
        toast.error(message);
      });
      syncStatus.set({ isLoading: false, isSuccess: true, error: null });
    } catch (err) {
      syncStatus.set({ isLoading: false, isSuccess: false, error: 'Failed to sync to Git' });
      toast.error('Failed to sync to Git')
    }
  }
</script>

<div class="flex items-center bg-gray-800 p-4">
  <button
    class="text-white py-2 px-4 rounded mr-2 flex items-center"
    class:bg-blue-500={$activeTab === 'routes'}
    class:bg-gray-700={$activeTab !== 'routes'}
    on:click={() => handleTabClick('routes')}
  >
    <i class="fas fa-route mr-2"></i> Routes
  </button>
  <button
    class="text-white py-2 px-4 rounded mr-2 flex items-center"
    class:bg-blue-500={$activeTab === 'logs'}
    class:bg-gray-700={$activeTab !== 'logs'}
    on:click={() => handleTabClick('logs')}
  >
    <i class="fas fa-file-alt mr-2"></i> Logs
  </button>
  <button
    class="text-white py-2 px-4 rounded mr-auto flex items-center"
    class:bg-blue-500={$activeTab === 'configuration'}
    class:bg-gray-700={$activeTab !== 'configuration'}
    on:click={() => handleTabClick('configuration')}
  >
    <i class="fas fa-cogs mr-2"></i> Configuration
  </button>
  <button class="bg-blue-500 text-white py-2 px-4 rounded mr-2 flex items-center" on:click={handleDownload}>
    <i class="fas fa-download mr-2"></i> Download JSON
  </button>
  <button
    class="bg-green-500 text-white py-2 px-4 rounded mr-2 flex items-center"
    class:opacity-50={$syncStatus.isLoading}
    on:click={handleSync}
    disabled={$syncStatus.isLoading}
  >
    <i class="fas fa-sync-alt mr-2" class:fa-spin={$syncStatus.isLoading}></i>
    {$syncStatus.isLoading ? 'Syncing...' : 'Sync to Git'}
  </button>
  <button class="bg-red-500 text-white py-2 px-4 rounded flex items-center" on:click={handleLogout}>
    <i class="fas fa-sign-out-alt mr-2"></i> Logout
  </button>
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
