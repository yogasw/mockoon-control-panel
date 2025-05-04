<script lang="ts">
	let selectedValue: string = 'Response 1 (200) MetaAds';

	const toggleDropdown = (): void => {
		const dropdown = document.getElementById('dropdownMenu');
		if (dropdown) {
			dropdown.classList.toggle('hidden');
		}
	};

	const selectValue = (value: string): void => {
		selectedValue = value;
		const selectedElement = document.getElementById('selectedValue');
		if (selectedElement) {
			selectedElement.innerText = selectedValue;
		}
		toggleDropdown();
	};
</script>

<div class="flex items-center justify-between bg-gray-800 text-gray-300 py-5">
	<div class="flex items-center w-full">
		<button class="bg-blue-500 text-white rounded px-2 py-1 text-sm font-medium">
			<i class="fas fa-plus"></i>
		</button>
		<div class="relative ml-4 w-full">
			<button
				class="text-sm font-medium bg-gray-700 text-gray-300 rounded px-2 py-1 flex items-center justify-between w-full"
				on:click={()=>{toggleDropdown()}}
			>
				<span id="selectedValue">Response 1 (200) MetaAds</span>
				<i class="fas fa-chevron-down"></i>
			</button>
			<div id="dropdownMenu" class="absolute mt-1 bg-gray-700 text-gray-300 rounded shadow-lg w-full hidden">
				<ul class="text-sm">
					<li class="px-4 py-2 hover:bg-gray-600 cursor-pointer"
							on:click={()=>{selectValue('Response 1 (200) MetaAds')}}>Response 1 (200)
					</li>
					<li class="px-4 py-2 hover:bg-gray-600 cursor-pointer"
							on:click={()=>{selectValue('Response 2 (404) MetaAds')}}>Response 2 (404)
					</li>
				</ul>
			</div>
		</div>
	</div>
	<!-- Right Section -->
	<div class="flex items-center ml-4">
		<div class="flex items-center space-x-4">
			<button class="text-gray-400 hover:text-gray-300">
				<i class="fas fa-expand"></i>
			</button>
			<button class="text-gray-400 hover:text-gray-300">
				<i class="fas fa-sync-alt"></i>
			</button>
			<button class="text-gray-400 hover:text-gray-300">
				<i class="fas fa-align-left"></i>
			</button>
			<button class="text-gray-400 hover:text-gray-300">
				<i class="fas fa-cog"></i>
			</button>
		</div>
	</div>
</div>
