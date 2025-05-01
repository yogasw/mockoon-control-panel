<script>
	function showLoading(buttonId) {
		const button = document.getElementById(buttonId);
		button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
		button.disabled = true;

		// Simulate a delay for the sync process
		setTimeout(() => {
			button.innerHTML = 'Save and Test Sync';
			button.disabled = false;
		}, 5000); // 5 seconds delay
	}

</script>

<!-- Git Configuration Tab -->
<div id="gitConfigTab" class="tab-content hidden">
	<h3 class="text-xl font-bold mb-4">Git Configuration</h3>
	<div class="space-y-4">
		<div>
			<label class="block text-sm font-bold mb-2">Name</label>
			<input
				type="text"
				class="w-full bg-gray-700 text-white py-2 px-4 rounded"
				placeholder="Name commit author"
			/>
		</div>
		<div>
			<label class="block text-sm font-bold mb-2">Email</label>
			<input
				type="email"
				class="w-full bg-gray-700 text-white py-2 px-4 rounded"
				placeholder="Email commit author"
			/>
		</div>
		<div>
			<label class="block text-sm font-bold mb-2">Default Branch</label>
			<input
				type="text"
				class="w-full bg-gray-700 text-white py-2 px-4 rounded"
				placeholder="Default branch (e.g., main)}"
			/>
		</div>
		<div>
			<label class="block text-sm font-bold mb-2">Private Key (id_rsa)</label>
			<p class="text-sm text-gray-400 mt-2">The private key will only be visible during the initial input.</p>
			<textarea
				id="privateKey"
				class="w-full bg-gray-700 text-white py-2 px-4 rounded resize-none"
				rows="4"
				placeholder="Paste your private key (e.g., id_rsa), starting with -----BEGIN OPENSSH PRIVATE KEY----- and ending with -----END OPENSSH PRIVATE KEY-----"></textarea>
		</div>
		<div>
			<label class="block text-sm font-bold mb-2">SSH URL</label>
			<input
				type="text"
				class="w-full bg-gray-700 text-white py-2 px-4 rounded"
				placeholder="Enter SSH URL (e.g., git@github.com:user/repo.git)}"
			/>
		</div>
	</div>
	<div class="flex space-x-4 mt-4">
		<button class="bg-blue-500 text-white py-2 px-4 rounded w-full">
			Save Configuration
		</button>
		<button
			id="saveAndTestSyncButton"
			class="bg-green-500 text-white py-2 px-4 rounded w-full"
			on:click={()=>showLoading('saveAndTestSyncButton')}
		>
			Save and Test Sync
		</button>
	</div>
</div>
