<script lang="ts">
  export let rules: any[] = [];
</script>

<div>
  <h3 class="text-sm font-semibold mb-2">Rules</h3>
  {#if rules && rules.length > 0}
    <pre class="bg-gray-800 p-2 rounded text-xs">{JSON.stringify(rules, null, 2)}</pre>
  {:else}
    <div class="text-gray-400">No rules available.</div>
  {/if}
</div> 