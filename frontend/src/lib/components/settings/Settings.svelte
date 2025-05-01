<script>
	function toggleTab(tabId) {
		const tabs = document.querySelectorAll(".tab-content");
		tabs.forEach((tab) => tab.classList.add("hidden"));

		const activeTab = document.getElementById(tabId);
		activeTab.classList.remove("hidden");
	}

	function togglePasswordVisibility() {
		const oldPasswordInput = document.getElementById("oldPassword");
		const newPasswordInput = document.getElementById("newPassword");
		const isChecked = document.getElementById("showPasswordCheckbox").checked;

		oldPasswordInput.type = isChecked ? "text" : "password";
		newPasswordInput.type = isChecked ? "text" : "password";
	}

	function closeSettingsModal() {
		const modal = document.getElementById("settingsModal");
		modal.classList.add("hidden");
	}

	function openSettingsModal() {
		const modal = document.getElementById("settingsModal");
		modal.classList.remove("hidden");
	}

	function toggleMenu() {
		const menu = document.getElementById("menuNavigation");
		menu.classList.toggle("hidden");
	}

	function toggleUpdateRow(rowId) {
		const updateButton = document.getElementById(`update-button-${rowId}`);
		updateButton.classList.toggle("hidden");
	}

	function lockValue(rowId) {
		const valueInput = document.getElementById(`value-${rowId}`);
		valueInput.value = "xxx"; // Mask the value for security
		valueInput.disabled = true; // Lock the input
	}

	function showUpdateLoading(rowId) {
		const updateButton = document.getElementById(`update-button-${rowId}`);
		updateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
		updateButton.disabled = true;

		// Simulate a delay for the update process
		setTimeout(() => {
			updateButton.innerHTML = '<i class="fas fa-check"></i> Updated';
			updateButton.disabled = false;
		}, 3000); // 3 seconds delay
	}
</script>

<!-- Configuration Modal -->
<div
	id="settingsModal"
	class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center hidden"
>
	<div class="bg-gray-800 text-white rounded-2xl shadow-lg w-full max-w-4xl h-full max-h-[90%] flex flex-col md:flex-row relative">
		<!-- Close Button -->
		<button
			class="absolute top-4 right-4 bg-gray-700 text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center border border-gray-500"
			on:click={()=>closeSettingsModal()}
		>
			<i class="fas fa-times"></i>
		</button>

		<!-- Left Navigation -->
		<div class="w-full md:w-1/4 bg-gray-700 p-6 flex flex-col md:space-y-4 md:pr-6">
			<!-- Hamburger Menu for Mobile -->
			<button
				class="md:hidden flex items-center bg-gray-600 text-white py-2 px-4 rounded mb-4"
				on:click={()=>toggleMenu()}
			>
				<i class="fas fa-bars text-lg mr-2"></i>
				<span>Menu</span>
			</button>
			<div id="menuNavigation" class="space-y-4 hidden md:block">
				<h2 class="text-xl font-bold mb-6">Configuration</h2>
				<button
					class="flex items-center space-x-2 text-white hover:bg-gray-600 py-2 px-4 rounded"
					on:click={()=>toggleTab('gitConfigTab')}
				>
					<i class="fas fa-code-branch text-lg"></i>
					<span>Git</span>
				</button>
				<button
					class="flex items-center space-x-2 text-white hover:bg-gray-600 py-2 px-4 rounded"
					on:click={()=>toggleTab('adminSettingsTab')}
				>
					<i class="fas fa-user-cog text-lg"></i>
					<span>Admin</span>
				</button>
				<button
					class="flex items-center space-x-2 text-white hover:bg-gray-600 py-2 px-4 rounded"
					on:click={()=>toggleTab('advancedSettingsTab')}
				>
					<i class="fas fa-cogs text-lg"></i>
					<span>Advanced</span>
				</button>
			</div>
		</div>

		<!-- Right Content -->
		<div class="w-full md:w-3/4 p-6 md:pt-12 overflow-y-auto">
			<!-- Git Configuration Tab -->
			<div id="gitConfigTab" class="tab-content">
				<div class="space-y-4">
					<h3 class="text-xl font-bold mb-4">Git Configuration</h3>
					<div>
						<label class="block text-sm font-bold mb-2">Name</label>
						<input
							type="text"
							class="w-full bg-gray-700 text-white py-2 px-4 rounded"
							placeholder="Git name"
						/>
					</div>
					<div>
						<label class="block text-sm font-bold mb-2">Email</label>
						<input
							type="email"
							class="w-full bg-gray-700 text-white py-2 px-4 rounded"
							placeholder="Git email"
						/>
					</div>
					<div>
						<label class="block text-sm font-bold mb-2">Default Branch</label>
						<input
							type="text"
							class="w-full bg-gray-700 text-white py-2 px-4 rounded"
							placeholder="Default branch (e.g., main)"
						/>
					</div>
					<div>
						<label class="block text-sm font-bold mb-2">Private Key (id_rsa)</label>
						<input
							id="privateKey"
							type="password"
							class="w-full bg-gray-700 text-white py-2 px-4 rounded"
							placeholder="Enter your private key"
						/>
						<div class="flex items-center mt-2">
							<input
								id="showPrivateKeyCheckbox"
								type="checkbox"
								class="mr-2"
								on:click={togglePasswordVisibility}
							/>
							<label for="showPrivateKeyCheckbox" class="text-sm">
								Show Private Key
							</label>
						</div>
					</div>
					<div>
						<label class="block text-sm font-bold mb-2">SSH URL</label>
						<input
							type="text"
							class="w-full bg-gray-700 text-white py-2 px-4 rounded"
							placeholder="Enter SSH URL (e.g., git@github.com:user/repo.git)"
						/>
					</div>
				</div>
				<button class="bg-blue-500 text-white py-2 px-4 rounded mt-4 w-full">
					Save Configuration
				</button>
			</div>

			<!-- Admin Settings Tab -->
			<div id="adminSettingsTab" class="tab-content hidden">
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-bold mb-2">Old Password</label>
						<input
							id="oldPassword"
							type="password"
							class="w-full bg-gray-700 text-white py-2 px-4 rounded"
							placeholder="Old password"
						/>
					</div>
					<div>
						<label class="block text-sm font-bold mb-2">New Password</label>
						<input
							id="newPassword"
							type="password"
							class="w-full bg-gray-700 text-white py-2 px-4 rounded"
							placeholder="New password"
						/>
					</div>
					<div class="flex items-center">
						<input
							id="showPasswordCheckbox"
							type="checkbox"
							class="mr-2"
							on:click={togglePasswordVisibility}
						/>
						<label for="showPasswordCheckbox" class="text-sm">
							Show Password
						</label>
					</div>
				</div>
				<button class="bg-green-500 text-white py-2 px-4 rounded mt-4 w-full">
					Update
				</button>
			</div>

			<!-- Advanced Settings Tab -->
			<div id="advancedSettingsTab" class="tab-content hidden">
				<div class="space-y-4">
					<h3 class="text-xl font-bold mb-4">Advanced Settings</h3>
					<div class="flex items-center mb-4">
						<div class="relative w-full">
							<i class="fas fa-search absolute top-3 left-3 text-gray-400"></i>
							<input
								type="text"
								class="w-full bg-gray-700 text-white py-2 pl-10 pr-4 rounded"
								placeholder="Search configuration"
							/>
						</div>
					</div>
					<hr class="border-gray-600 mb-4" />
					<div class="space-y-4">
						<!-- Row 1 -->
						<div class="flex items-center space-x-4">
							<input
								id="key-1"
								type="text"
								class="w-1/4 bg-gray-700 text-white py-2 px-4 rounded"
								placeholder="Key"
								on:click={()=>toggleUpdateRow(1)}
							/>
							<div class="relative w-3/4">
								<input
									id="value-1"
									type="text"
									class="w-full bg-gray-700 text-white py-2 px-4 rounded"
									placeholder="Single-line Value"
									on:click={()=>toggleUpdateRow(1)}
								/>
								<button
									class="absolute top-2 right-2 text-gray-400 hover:text-white"
									on:click={()=>lockValue(1)}
								>
									<i class="fas fa-lock"></i>
								</button>
							</div>
							<button
								id="update-button-1"
								class="text-gray-400 hover:text-blue-500"
								on:click={()=>showUpdateLoading(1)}
							>
								<i class="fas fa-check text-lg"></i> Update
							</button>
						</div>
						<!-- Row 2 -->
						<div class="flex items-center space-x-4">
							<input
								id="key-2"
								type="text"
								class="w-1/4 bg-gray-700 text-white py-2 px-4 rounded"
								placeholder="Key"
								on:click={()=>toggleUpdateRow(2)}
							/>
							<div class="relative w-3/4">
                    <textarea
											id="value-2"
											class="w-full bg-gray-700 text-white py-2 px-4 rounded resize-none"
											rows="2"
											placeholder="Multi-line Value"
											on:click={()=>toggleUpdateRow(2)}
										></textarea>
								<button
									class="absolute top-2 right-2 text-gray-400 hover:text-white"
									on:click={()=>lockValue(2)}
								>
									<i class="fas fa-lock"></i>
								</button>
							</div>
							<button
								id="update-button-2"
								class="text-gray-400 hover:text-blue-500"
								on:click={()=>showUpdateLoading(2)}
							>
								<i class="fas fa-check text-lg"></i> Update
							</button>
						</div>
						<!-- Row 3 -->
						<div class="flex items-center space-x-4">
							<input
								id="key-3"
								type="text"
								class="w-1/4 bg-gray-700 text-white py-2 px-4 rounded"
								placeholder="Key"
								on:click={()=>toggleUpdateRow(3)}
							/>
							<div class="relative w-3/4">
                    <textarea
											id="value-3"
											class="w-full bg-gray-700 text-white py-2 px-4 rounded resize-none"
											rows="4"
											placeholder="Long Text Area"
											on:click={()=>toggleUpdateRow(3)}
										></textarea>
								<button
									class="absolute top-2 right-2 text-gray-400 hover:text-white"
									on:click={()=>lockValue(3)}
								>
									<i class="fas fa-lock"></i>
								</button>
							</div>
							<button
								id="update-button-3"
								class="text-gray-400 hover:text-blue-500"
								on:click={()=>showUpdateLoading(3)}
							>
								<i class="fas fa-check text-lg"></i> Update
							</button>
						</div>
						<!-- Row 4 -->
						<div class="flex items-center space-x-4">
							<input
								id="key-4"
								type="text"
								class="w-1/4 bg-gray-700 text-white py-2 px-4 rounded"
								placeholder="Key"
								on:click={()=>toggleUpdateRow(4)}
							/>
							<div class="relative w-3/4">
								<input
									id="value-4"
									type="text"
									class="w-full bg-gray-700 text-white py-2 px-4 rounded"
									placeholder="Single-line Value"
									on:click={()=>toggleUpdateRow(4)}
								/>
								<button
									class="absolute top-2 right-2 text-gray-400 hover:text-white"
									on:click={()=>lockValue(4)}
								>
									<i class="fas fa-lock"></i>
								</button>
							</div>
							<button
								id="update-button-4"
								class="text-gray-400 hover:text-blue-500"
								on:click={()=>showUpdateLoading(4)}
							>
								<i class="fas fa-check text-lg"></i> Update
							</button>
						</div>
						<!-- Row 5 -->
						<div class="flex items-center space-x-4">
							<input
								id="key-5"
								type="text"
								class="w-1/4 bg-gray-700 text-white py-2 px-4 rounded"
								placeholder="Key"
								on:click={()=>toggleUpdateRow(5)}
							/>
							<div class="relative w-3/4">
                    <textarea
											id="value-5"
											class="w-full bg-gray-700 text-white py-2 px-4 rounded resize-none"
											rows="3"
											placeholder="Multi-line Value"
											on:click={()=>toggleUpdateRow(5)}
										></textarea>
								<button
									class="absolute top-2 right-2 text-gray-400 hover:text-white"
									on:click={()=>lockValue(5)}
								>
									<i class="fas fa-lock"></i>
								</button>
							</div>
							<button
								id="update-button-5"
								class="text-gray-400 hover:text-blue-500"
								on:click={()=>showUpdateLoading(5)}
							>
								<i class="fas fa-check text-lg"></i> Update
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
